import { supabase, isSupabaseConfigured, ensureAuthenticated } from '../../../core/config/supabaseClient'
import { CsPDocument, CsPInvertedSearchResult } from '../types/profesor.types'

/**
 * Obtener todos los documentos CsP ("Cómo sobrevivir a tu Profe") directamente desde la base de datos Supabase.
 */
export async function fetchCsPDocuments(): Promise<CsPDocument[]> {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[SACU Supabase] Cliente de Supabase no configurado para CsP.')
    return []
  }

  await ensureAuthenticated()

  try {
    const { data, error } = await supabase
      .from('csp_documents')
      .select('*')
      .order('period', { ascending: false })
      .order('cycle', { ascending: true })

    if (error) {
      console.error('[SACU Supabase] Error consultando csp_documents:', error)
      throw error
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map((d) => {
        const rawIndex: any[] = Array.isArray(d.index_data) ? d.index_data : []
        const normalizedIndex = rawIndex.map((entry) => {
          let pagesList: number[] = []
          if (Array.isArray(entry.pages)) {
            pagesList = entry.pages.map((p: any) => Number(p)).filter((n: number) => !isNaN(n) && n > 0)
          } else if (entry.page) {
            const singlePage = Number(entry.page)
            if (!isNaN(singlePage) && singlePage > 0) pagesList = [singlePage]
          }

          const primaryPage = pagesList.length > 0 ? pagesList[0] : 1

          return {
            ...entry,
            pages: pagesList,
            page: primaryPage,
          }
        })

        return {
          id: d.id,
          docId: d.doc_id,
          fileName: d.file_name,
          period: d.period,
          cycle: Number(d.cycle),
          title: d.title,
          description: d.description || '',
          pdfUrl: d.pdf_url,
          totalPages: Number(d.total_pages || 0),
          indexData: normalizedIndex,
          updatedAt: d.updated_at || d.created_at,
        }
      })
    }
  } catch (err) {
    console.error('[SACU Supabase] Fallo al recuperar documentos CsP de la base de datos:', err)
  }

  return []
}

/**
 * Motor de Búsqueda Invertida sobre la Base de Datos de Supabase.
 * Consulta la tabla 'profesores_indice_invertido' e 'index_data' de csp_documents.
 */
export async function queryInvertedIndexFromDb(
  query: string,
  cachedDocs: CsPDocument[] = []
): Promise<CsPInvertedSearchResult[]> {
  if (!query || !query.trim()) return []

  const cleanQuery = query.toLowerCase().trim()
  const resultsMap = new Map<string, CsPInvertedSearchResult>()

  // 1. Asegurar catálogo de documentos CsP para resolución de metadatos y URLs
  let allDocs = cachedDocs
  if (allDocs.length === 0) {
    allDocs = await fetchCsPDocuments()
  }

  const docsMapById = new Map<string, CsPDocument>()
  allDocs.forEach((d) => docsMapById.set(d.id, d))

  // 2. Consulta directa a la tabla 'professors_search_index' en Supabase (según supabase.sql)
  if (isSupabaseConfigured() && supabase) {
    await ensureAuthenticated()
    try {
      // Intento 1: tabla 'professors_search_index' con columna 'term'
      let invRows: any[] | null = null
      const { data: primaryRows, error: primaryErr } = await supabase
        .from('professors_search_index')
        .select('*')
        .ilike('term', `%${cleanQuery}%`)
        .limit(30)

      if (!primaryErr && Array.isArray(primaryRows) && primaryRows.length > 0) {
        invRows = primaryRows
      } else {
        // Fallback por compatibilidad con instalaciones anteriores: 'profesores_indice_invertido'
        const { data: fallbackRows } = await supabase
          .from('profesores_indice_invertido')
          .select('*')
          .ilike('termino', `%${cleanQuery}%`)
          .limit(30)
        invRows = fallbackRows || []
      }

      if (Array.isArray(invRows)) {
        for (const row of invRows) {
          const docEntries = Array.isArray(row.documents) ? row.documents : Array.isArray(row.documentos) ? row.documentos : []
          const termLabel = row.term || row.termino || ''

          for (const item of docEntries) {
            // Soportar variantes de esquema en 'documents' jsonb
            const docId = item.doc_id || item.document_id || item.id || ''
            const pageNum = Number(item.page_number || item.page || item.pagina || 1)
            const snippet = item.snippet || item.context || item.texto || `Coincidencia con término "${termLabel}"`
            const roleType = item.role_type || 'General'

            // Enlazar con documento CsP
            const matchedDoc =
              docsMapById.get(docId) ||
              allDocs.find((d) => d.id === docId || d.period === item.period || d.title.includes(docId))

            const finalDocId = matchedDoc?.id || docId || 'doc-general'
            const key = `${finalDocId}_p${pageNum}_${roleType}`

            if (!resultsMap.has(key)) {
              resultsMap.set(key, {
                documentId: finalDocId,
                period: matchedDoc?.period || item.period || 'General',
                cycle: matchedDoc?.cycle || Number(item.cycle) || 1,
                page: pageNum,
                professorName: item.professor_name || item.profesor || termLabel || 'Docente Universitario',
                courseName: item.course_name || item.curso || matchedDoc?.title || 'Curso Académico',
                roleType,
                documentTitle: matchedDoc?.title || `Documento CsP (${item.period || 'General'})`,
                pdfUrl: matchedDoc?.pdfUrl || item.pdf_url || '',
                tipsSummary: snippet,
              })
            }
          }
        }
      }
    } catch (err) {
      console.warn('[SACU Supabase] Consulta a professors_search_index:', err)
    }
  }

  // 3. Consulta estructurada en 'index_data' de los documentos CsP cargados
  allDocs.forEach((doc) => {
    (doc.indexData || []).forEach((entry) => {
      const profName = entry.professor_name || ''
      const courseName = entry.course_name || ''
      const tips = entry.tips_summary || ''

      const matchProf = profName.toLowerCase().includes(cleanQuery)
      const matchCourse = courseName.toLowerCase().includes(cleanQuery)
      const matchTips = tips.toLowerCase().includes(cleanQuery)

      if (matchProf || matchCourse || matchTips) {
        const primaryPage = Number(entry.page || entry.pages?.[0] || 1)
        const key = `${doc.id}_p${primaryPage}_${entry.role_type}`
        if (!resultsMap.has(key)) {
          resultsMap.set(key, {
            documentId: doc.id,
            period: doc.period,
            cycle: doc.cycle,
            page: primaryPage,
            professorName: profName || 'Docente Universitario',
            courseName: courseName || 'Curso Académico',
            roleType: entry.role_type,
            documentTitle: doc.title,
            pdfUrl: doc.pdfUrl,
            tipsSummary: entry.tips_summary,
          })
        }
      }
    })
  })

  return Array.from(resultsMap.values())
}

/**
 * Función sincrónica auxiliar para filtrado rápido en memoria
 */
export function queryInvertedIndex(
  query: string,
  documents: CsPDocument[]
): CsPInvertedSearchResult[] {
  if (!query.trim()) return []
  const cleanQuery = query.toLowerCase().trim()
  const results: CsPInvertedSearchResult[] = []

  documents.forEach((doc) => {
    (doc.indexData || []).forEach((entry) => {
      const profName = entry.professor_name || ''
      const courseName = entry.course_name || ''
      const tips = entry.tips_summary || ''

      if (
        profName.toLowerCase().includes(cleanQuery) ||
        courseName.toLowerCase().includes(cleanQuery) ||
        tips.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          documentId: doc.id,
          period: doc.period,
          cycle: doc.cycle,
          page: Number(entry.page || entry.pages?.[0] || 1),
          professorName: profName || 'Docente Universitario',
          courseName: courseName || 'Curso Académico',
          roleType: entry.role_type,
          documentTitle: doc.title,
          pdfUrl: doc.pdfUrl,
          tipsSummary: entry.tips_summary,
        })
      }
    })
  })

  return results
}
