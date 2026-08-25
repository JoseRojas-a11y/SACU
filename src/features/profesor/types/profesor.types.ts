/**
 * Tipos de dominio para el módulo de Profesores y CsP ("Cómo sobrevivir a tu Profe")
 */

export type RoleType = 'Teoria' | 'Practica' | 'Laboratorio' | 'General'

export interface MetricScores {
  ensenanza: number    // 1.0 - 5.0 (Claridad y didáctica)
  evaluacion: number   // 1.0 - 5.0 (Claridad evaluativa / Accesibilidad - persistido en difficulty_score)
  dedicacion: number   // 1.0 - 5.0 (Puntualidad y apoyo continuo)
  dificultad?: number  // Compatibilidad hacia atrás
}

export interface MetricWeights {
  ensenanza: number    // 1 - 10 (Relevancia otorgada por el usuario)
  evaluacion: number   // 1 - 10 (Relevancia otorgada por el usuario)
  dedicacion: number   // 1 - 10 (Relevancia otorgada por el usuario)
}

export interface ProfessorCourseTuple {
  id: string                    // Identificador único de la tupla (Prof, Curso, Rol)
  professorId: string
  professorName: string
  professorEmail?: string
  department?: string
  courseId: string
  courseCode?: string
  courseName: string
  facultyId?: string
  facultyName?: string
  roleType: RoleType
  scores: MetricScores
  reviewCount: number
  weightedRating?: number       // Calculado reactivamente en cliente mediante promedio ponderado
}

export interface Review {
  id: string
  professorCourseId: string
  authorTag: string             // "Estudiante FIIS #14" o similar
  scores: MetricScores
  comment: string
  createdAt: string
  flaggedCount?: number
  isApproved?: boolean
}

export interface PendingReview {
  id: string
  reviewData: Omit<Review, 'id' | 'createdAt'>
  professorCourseName: string
  submittedAt: number           // Timestamp ms
  expiresAt: number             // Timestamp ms (submittedAt + 15000)
  timerId: any
}

// ----------------------------------------------------
// Modelo de CsP: "Cómo sobrevivir a tu Profe"
// ----------------------------------------------------

export interface CsPIndexEntry {
  pages?: number[]             // Lista de páginas donde aparece el docente/curso (ej. [3, 4])
  page?: number                // Página única / principal (retrocompatibilidad)
  course_id: string
  professor_id: string
  role_type: RoleType
  course_name?: string
  professor_name?: string
  tips_summary?: string
}

export interface CsPDocument {
  id: string
  docId?: string               // Identificador único del documento
  fileName?: string            // ej. csp_26-1_1er.pdf
  period: string               // ej. "26-1", "25-2", "25-1"
  cycle: number                // 1 al 10
  title: string
  description?: string
  pdfUrl: string               // URL directa del archivo PDF alojado en Cloudinary CDN
  totalPages?: number
  indexData: CsPIndexEntry[]
  totalEntries?: number
  updatedAt?: string
}

export interface CsPInvertedSearchResult {
  documentId: string
  period: string
  cycle: number
  page: number
  professorName: string
  courseName: string
  roleType: RoleType
  documentTitle: string
  pdfUrl: string
  tipsSummary?: string
}
