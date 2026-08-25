import { supabase, isSupabaseConfigured, ensureAuthenticated } from '../../../core/config/supabaseClient'
import { ProfessorCourseTuple, Review, RoleType } from '../types/profesor.types'
import { sendResendReportNotification } from './reportNotificationService'

/**
 * Obtener listado de tuplas (Profesor, Curso, RoleType) directamente desde Supabase.
 * Prioriza la vista agregada 'view_professor_course_stats' y dispone de consulta relacional directa como respaldo.
 */
export async function fetchProfessorTuples(): Promise<ProfessorCourseTuple[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[SACU Supabase] Cliente de Supabase no inicializado.')
    return []
  }

  await ensureAuthenticated()


  try {
    // 1. Intento principal: vista 'view_professor_course_stats' (si existe en base de datos)
    const { data: viewData, error: viewError } = await supabase
      .from('view_professor_course_stats')
      .select('*')

    if (!viewError && Array.isArray(viewData) && viewData.length > 0) {
      return viewData.map((row) => ({
        id: row.id,
        professorId: row.professor_id,
        professorName: row.professor_name || 'Docente Universitario',
        professorEmail: row.professor_email || '',
        department: row.faculty_name || 'Facultad de Ingeniería',
        courseId: row.course_id,
        courseCode: row.course_code || '',
        courseName: row.course_name || 'Curso Universitario',
        facultyId: row.faculty_id || row.faculty_code || 'sistemas',
        facultyName: row.faculty_name || 'Facultad de Ingeniería',
        roleType: (row.role_type as RoleType) || 'Teoria',
        scores: {
          ensenanza: Number(Number(row.avg_teaching || 4.0).toFixed(1)),
          evaluacion: Number(Number(row.avg_difficulty || 3.5).toFixed(1)),
          dedicacion: Number(Number(row.avg_dedication || 4.0).toFixed(1)),
          dificultad: Number(Number(row.avg_difficulty || 3.5).toFixed(1)),
        },
        reviewCount: Number(row.review_count || 0),
      }))
    }

    // 2. Consulta relacional directa a 'professor_courses' según supabase.sql
    const { data: directData, error: directError } = await supabase
      .from('professor_courses')
      .select(`
        id,
        role_type,
        professors:professor_id (
          id,
          full_name,
          faculty_id,
          faculties:faculty_id (id, code, name)
        ),
        courses:course_id (
          id,
          course_code,
          full_name,
          faculty_id,
          faculties:faculty_id (id, code, name)
        ),
        reviews (
          id,
          teaching_score,
          difficulty_score,
          dedication_score,
          is_approved
        )
      `)

    if (directError) {
      console.error('[SACU Supabase] Error consultando professor_courses:', directError)
      throw directError
    }

    if (Array.isArray(directData)) {
      return directData.map((item: any) => {
        const prof = item.professors || {}
        const course = item.courses || {}
        const profFaculty = prof.faculties || {}
        const courseFaculty = course.faculties || {}
        const facultyName = profFaculty.name || courseFaculty.name || 'Facultad de Ingeniería Industrial y de Sistemas'
        const facultyId = prof.faculty_id || course.faculty_id || 'fiis'

        const approvedReviews = (item.reviews || []).filter((r: any) => r.is_approved !== false)

        let avgT = 4.0
        let avgE = 4.0
        let avgDed = 4.0

        if (approvedReviews.length > 0) {
          const sumT = approvedReviews.reduce((acc: number, r: any) => acc + Number(r.teaching_score || 0), 0)
          const sumE = approvedReviews.reduce((acc: number, r: any) => acc + Number(r.difficulty_score || 0), 0)
          const sumDed = approvedReviews.reduce((acc: number, r: any) => acc + Number(r.dedication_score || 0), 0)
          avgT = Number((sumT / approvedReviews.length).toFixed(1))
          avgE = Number((sumE / approvedReviews.length).toFixed(1))
          avgDed = Number((sumDed / approvedReviews.length).toFixed(1))
        }

        return {
          id: item.id,
          professorId: prof.id || '',
          professorName: prof.full_name || 'Docente Universitario',
          professorEmail: '',
          department: facultyName,
          courseId: course.id || '',
          courseCode: course.course_code || '',
          courseName: course.full_name || 'Curso Universitario',
          facultyId: facultyId,
          facultyName: facultyName,
          roleType: (item.role_type as RoleType) || 'Teoria',
          scores: {
            ensenanza: avgT,
            evaluacion: avgE,
            dedicacion: avgDed,
            dificultad: avgE,
          },
          reviewCount: approvedReviews.length,
        }
      })
    }
  } catch (err) {
    console.error('[SACU Supabase] Fallo al recuperar tuplas de docentes de la base de datos:', err)
  }

  return []
}

/**
 * Obtener reseñas para una tupla específica directamente desde la tabla 'reviews' en Supabase.
 */
export async function fetchReviewsByTuple(tupleId: string): Promise<Review[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return []
  }

  await ensureAuthenticated()

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('professor_course_id', tupleId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`[SACU Supabase] Error al consultar reseñas para tupla ${tupleId}:`, error)
      throw error
    }

    if (Array.isArray(data)) {
      return data.map((r) => {
        const evalScore = Number(r.difficulty_score)
        return {
          id: r.id,
          professorCourseId: r.professor_course_id,
          authorTag: r.author_tag || 'Estudiante Anónimo',
          scores: {
            ensenanza: Number(r.teaching_score),
            evaluacion: evalScore,
            dedicacion: Number(r.dedication_score),
            dificultad: evalScore,
          },
          comment: r.comment,
          createdAt: r.created_at,
          flaggedCount: Number(r.flagged_count || 0),
        }
      })
    }
  } catch (err) {
    console.error('[SACU Supabase] Error obteniendo reseñas de la base de datos:', err)
  }

  return []
}

/**
 * Insertar reseña en la tabla 'reviews' de Supabase (ejecutada tras vencer los 15s de grace period).
 */
export async function insertReviewApi(newReview: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('No hay conexión con la base de datos de Supabase.')
  }

  await ensureAuthenticated()

  const evalVal = newReview.scores.evaluacion ?? newReview.scores.dificultad ?? 4.0

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      professor_course_id: newReview.professorCourseId,
      author_tag: newReview.authorTag || `Estudiante Anónimo #${Math.floor(10 + Math.random() * 90)}`,
      teaching_score: newReview.scores.ensenanza,
      difficulty_score: evalVal,
      dedication_score: newReview.scores.dedicacion,
      comment: newReview.comment,
      is_approved: true,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[SACU Supabase] Error insertando reseña en base de datos:', error)
    throw error || new Error('No se pudo guardar la reseña en la base de datos.')
  }

  const savedEval = Number(data.difficulty_score)

  return {
    id: data.id,
    professorCourseId: data.professor_course_id,
    authorTag: data.author_tag,
    scores: {
      ensenanza: Number(data.teaching_score),
      evaluacion: savedEval,
      dedicacion: Number(data.dedication_score),
      dificultad: savedEval,
    },
    comment: data.comment,
    createdAt: data.created_at,
  }
}

/**
 * Reportar / Flaggear comentario en Supabase y notificar a administradores mediante Resend.
 */
export async function reportReviewApi(
  reviewId: string,
  reason: string,
  extraContext?: {
    commentText?: string
    authorTag?: string
    professorName?: string
    courseName?: string
  }
): Promise<{ success: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[SACU Supabase] Supabase offline, reporte no persistido.')
    return { success: false }
  }

  await ensureAuthenticated()

  try {
    // 1. Registrar reporte en la tabla 'reports' de Supabase
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .insert({
        review_id: reviewId,
        reason,
        status: 'pending',
      })
      .select()
      .single()

    if (reportError) {
      console.error('[SACU Supabase] Error registrando reporte en la tabla reports:', reportError)
    }

    // 2. Incrementar flagged_count en la reseña
    try {
      const { data: currentRev } = await supabase
        .from('reviews')
        .select('flagged_count')
        .eq('id', reviewId)
        .single()

      const newFlagCount = (currentRev?.flagged_count || 0) + 1

      await supabase
        .from('reviews')
        .update({ flagged_count: newFlagCount })
        .eq('id', reviewId)
    } catch (flagErr) {
      console.warn('[SACU Supabase] Aviso actualizando flagged_count:', flagErr)
    }

    // 3. Notificar a los administradores del sistema por correo vía Resend
    await sendResendReportNotification({
      reportId: reportRecord?.id,
      reviewId,
      reason,
      commentText: extraContext?.commentText,
      authorTag: extraContext?.authorTag,
      professorName: extraContext?.professorName,
      courseName: extraContext?.courseName,
    })

    return { success: true }
  } catch (err) {
    console.error('[SACU Supabase] Error general en proceso de reporte:', err)
    return { success: false }
  }
}
