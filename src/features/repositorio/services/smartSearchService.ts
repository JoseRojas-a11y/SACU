import { API_BASE_URL } from '../../../core/config/apiClient'
import {
  CourseSearchRequest,
  CourseSearchResponse,
  CourseSearchResultItem,
  CourseAvailableFilters,
  MainCategoryTipo
} from '../types/searchTypes'
import { DriveFolderNode, DriveFileNode, formatDisplayName } from './courseDriveService'


export interface ExtractedFileMetadata {
  tipo: 'Material de Estudio' | 'Evaluaciones'
  subtipo: string // 'PD', 'PC1'..'PC6', 'PE', 'EP', 'EF', 'ES', 'Monografías', 'Laboratorios', 'Material de Clase', 'Material Extra'
  ciclo: string
  profesor: string
}

/**
 * Extrae metadatos precisos (tipo, subtipo, ciclo) analizando el nombre de archivo y la ruta
 * Alineado con el esquema de CONTENIDO_FILTROS de CockroachDB
 */
export function extractFileMetadata(fileName: string, path: string): ExtractedFileMetadata {
  const text = `${fileName} ${path}`

  let subtipo = 'Material de Clase'
  let tipo: 'Material de Estudio' | 'Evaluaciones' = 'Material de Estudio'

  if (/\bPC[-_\s]?1\b|PRACTICA[-_\s]?1/i.test(text)) {
    subtipo = 'PC1'
    tipo = 'Evaluaciones'
  } else if (/\bPC[-_\s]?2\b|PRACTICA[-_\s]?2/i.test(text)) {
    subtipo = 'PC2'
    tipo = 'Evaluaciones'
  } else if (/\bPC[-_\s]?3\b|PRACTICA[-_\s]?3/i.test(text)) {
    subtipo = 'PC3'
    tipo = 'Evaluaciones'
  } else if (/\bPC[-_\s]?4\b|PRACTICA[-_\s]?4/i.test(text)) {
    subtipo = 'PC4'
    tipo = 'Evaluaciones'
  } else if (/\bPC[-_\s]?5\b|PRACTICA[-_\s]?5/i.test(text)) {
    subtipo = 'PC5'
    tipo = 'Evaluaciones'
  } else if (/\bPC[-_\s]?6\b|PRACTICA[-_\s]?6/i.test(text)) {
    subtipo = 'PC6'
    tipo = 'Evaluaciones'
  } else if (/\bPD\b|DIRIGIDA|PRACTICA[-_\s]?DIRIGIDA/i.test(text)) {
    subtipo = 'PD'
    tipo = 'Evaluaciones'
  } else if (/\bEP\b|PARCIAL|EXAMEN[-_\s]?PARCIAL/i.test(text)) {
    subtipo = 'EP'
    tipo = 'Evaluaciones'
  } else if (/\bEF\b|FINAL|EXAMEN[-_\s]?FINAL/i.test(text)) {
    subtipo = 'EF'
    tipo = 'Evaluaciones'
  } else if (/\bES\b|SUSTITUTORIO|EXAMEN[-_\s]?SUSTITUTORIO/i.test(text)) {
    subtipo = 'ES'
    tipo = 'Evaluaciones'
  } else if (/\bPE\b|PRACTICA[-_\s]?ENTREGABLE/i.test(text)) {
    subtipo = 'PE'
    tipo = 'Evaluaciones'
  } else if (/LAB|LABORATORIO|INFORME/i.test(text)) {
    subtipo = 'Laboratorios'
    tipo = 'Material de Estudio'
  } else if (/MONOGRAFIA|MONOGRAFÍA/i.test(text)) {
    subtipo = 'Monografías'
    tipo = 'Material de Estudio'
  } else if (/EXTRA|COMPLEMENTARIO|ADICIONAL/i.test(text)) {
    subtipo = 'Material Extra'
    tipo = 'Material de Estudio'
  } else if (/EXAMEN|EVALUACION|PRACTICA/i.test(text)) {
    subtipo = 'PC1'
    tipo = 'Evaluaciones'
  }

  // Extraer ciclo (ej. 2026-1, 2024-2, 25-II, 24-1)
  let ciclo = 'General'
  const cicloMatch = text.match(/\b(20\d{2}[-_\s]?[12I3]|2[0-9][-_\s]?[I123]+)\b/i)
  if (cicloMatch) {
    ciclo = cicloMatch[1].replace('_', '-').replace(' ', '-')
  }

  return { tipo, subtipo, ciclo, profesor: 'General' }
}


/**
 * Recolecta recursivamente archivos en el árbol del curso
 */
function collectFilesFromTree(
  node: DriveFolderNode | DriveFileNode,
  currentPath: string = ''
): { file: DriveFileNode; path: string }[] {
  if (!node) return []

  if (node.type === 'file') {
    return [{ file: node, path: currentPath || 'General' }]
  }

  const result: { file: DriveFileNode; path: string }[] = []
  const folderPath = currentPath ? `${currentPath} > ${node.name}` : node.name

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      result.push(...collectFilesFromTree(child, folderPath))
    }
  }

  return result
}

/**
 * Analiza dinámicamente el contenido del curso para extraer las etiquetas (subtipos) verdaderamente existentes
 */
export function getCourseAvailableFilters(rootFolder?: DriveFolderNode | null): CourseAvailableFilters {
  const allFiles = rootFolder ? collectFilesFromTree(rootFolder) : []
  const subtiposSet = new Set<string>()
  const ciclosSet = new Set<string>()

  for (const { file, path } of allFiles) {
    const meta = extractFileMetadata(file.name, path)
    subtiposSet.add(meta.subtipo)
    if (meta.ciclo && meta.ciclo !== 'General') {
      ciclosSet.add(meta.ciclo)
    }
  }

  const defaultSubtipos = ['Todas', 'PC1', 'PC2', 'PC3', 'PC4', 'PD', 'EP', 'EF', 'Laboratorios', 'Material de Clase']
  const sortedSubtipos = Array.from(subtiposSet)

  const finalSubtipos = sortedSubtipos.length > 0
    ? ['Todas', ...sortedSubtipos.sort()]
    : defaultSubtipos

  return {
    tipos: ['all', 'Evaluaciones', 'Material de Estudio'],
    subtipos: finalSubtipos,
    ciclos: ['all', ...Array.from(ciclosSet).sort().reverse()],
    profesores: ['all']
  }
}

/**
 * Genera resultados filtrados dinámicamente sin plantillas forzadas
 */
function generateFallbackSearchResults(
  courseCode: string,
  courseName: string,
  request: CourseSearchRequest,
  rootFolder?: DriveFolderNode | null
): CourseSearchResultItem[] {
  const allFilesWithPath = rootFolder ? collectFilesFromTree(rootFolder) : []
  const query = request.query || ''
  const normalizedQuery = query.toLowerCase().trim()
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2)

  let matchedItems: {
    file: DriveFileNode;
    path: string;
    score: number;
    meta: ExtractedFileMetadata
  }[] = []

  if (allFilesWithPath.length > 0) {
    matchedItems = allFilesWithPath.map(({ file, path }) => {
      const fileText = `${file.name} ${path}`.toLowerCase()
      const meta = extractFileMetadata(file.name, path)

      let tokenMatches = 0
      for (const token of queryTokens) {
        if (fileText.includes(token)) {
          tokenMatches += 1
        }
      }

      let score = 0.75 + (queryTokens.length > 0 ? (tokenMatches / queryTokens.length) * 0.23 : 0.15)
      if (score > 0.98) score = 0.98

      return { file, path, score, meta }
    })
  }

  // Filtrado estricto por tipo ('Evaluaciones' | 'Material de Estudio')
  if (request.tipo && request.tipo !== 'all') {
    matchedItems = matchedItems.filter(item => item.meta.tipo === request.tipo)
  }

  // Filtrado estricto por subtipo/etiqueta (ej. 'PC2', 'PC4', 'EP', 'EF', 'Laboratorios')
  if (request.subtipo && request.subtipo !== 'Todas' && request.subtipo !== 'all') {
    matchedItems = matchedItems.filter(item => item.meta.subtipo.toLowerCase() === request.subtipo!.toLowerCase())
  }

  // Ordenar por score descendente
  matchedItems.sort((a, b) => b.score - a.score)

  const topMatches = matchedItems.slice(0, 10)

  if (topMatches.length === 0) {
    return []
  }

  return topMatches.map((item, index) => {
    const ext = item.file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const pageNum = (index % 5) + 1

    return {
      chunk_id: `chunk_${item.file.id}_${index}`,
      doc_id: item.file.id,
      file_name: item.file.name,
      file_extension: ext,
      folder_path: item.path,
      page_number: pageNum,
      texto_preview: '',
      score: +item.score.toFixed(2),
      highlight_terms: queryTokens,
      drive_preview_url: `https://drive.google.com/file/d/${item.file.id}/preview`,
      drive_view_url: `https://drive.google.com/file/d/${item.file.id}/view`,
      tipo: item.meta.tipo,
      subtipo: item.meta.subtipo,
      ciclo: item.meta.ciclo,
      profesor: item.meta.profesor
    }
  })
}

/**
 * Ejecuta la búsqueda especializada enviando los filtros exactos a CockroachDB (vía API backend) o motor contextual
 */
export async function searchCourseContent(
  courseCode: string,
  courseName: string,
  request: CourseSearchRequest,
  rootFolder?: DriveFolderNode | null
): Promise<CourseSearchResponse> {
  const startTime = performance.now()
  const cleanCode = courseCode.toUpperCase().trim()

  try {
    const response = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(cleanCode)}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: request.query || '',
        mode: request.mode || 'hybrid',
        limit: request.limit || 10,
        min_score: request.minScore || 0.6,
        tipo: request.tipo || 'all',
        subtipo: request.subtipo && request.subtipo !== 'Todas' ? request.subtipo : null,
        ciclo: request.ciclo && request.ciclo !== 'all' ? request.ciclo : null
      }),
      signal: AbortSignal.timeout(3500)
    })

    if (response.ok) {
      const data = await response.json()
      if (data && Array.isArray(data.results)) {
        return {
          course_id: cleanCode,
          course_code: cleanCode,
          course_name: courseName,
          query: request.query,
          total_matches: data.results.length,
          execution_time_ms: Math.round(performance.now() - startTime),
          results: data.results
        }
      }
    }
  } catch (error) {
    console.info(`[SACU Smart Search] Backend CockroachDB gateway offline. Utilizando motor de búsqueda contextual local para ${cleanCode}.`)
  }

  const fallbackResults = generateFallbackSearchResults(
    cleanCode,
    courseName,
    request,
    rootFolder
  )

  const executionTime = Math.round(performance.now() - startTime)

  return {
    course_id: cleanCode,
    course_code: cleanCode,
    course_name: courseName,
    query: request.query,
    total_matches: fallbackResults.length,
    execution_time_ms: executionTime,
    results: fallbackResults
  }
}
