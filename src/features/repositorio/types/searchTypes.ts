export type SearchMode = 'hybrid' | 'semantic' | 'keyword'

export type MainCategoryTipo = 'all' | 'Evaluaciones' | 'Material de Estudio'

export interface CourseSearchResultItem {
  chunk_id: string
  doc_id: string
  file_name: string
  file_extension: string
  folder_path?: string
  page_number?: number
  texto_preview: string
  score: number // Valor entre 0.0 y 1.0 (ej. 0.95 = 95% de similitud)
  highlight_terms?: string[]
  drive_preview_url?: string
  drive_view_url?: string
  tipo?: string // 'Material de Estudio' | 'Evaluaciones'
  subtipo?: string // 'PC1', 'PC2', 'EP', 'EF', etc.
  ciclo?: string // '2026-1', '25-II', 'General'
  profesor?: string // 'Ing. Juan Pérez', etc.
}

export interface CourseSearchRequest {
  query: string
  mode?: SearchMode
  limit?: number
  minScore?: number
  tipo?: MainCategoryTipo
  subtipo?: string // Ej: 'PC2', 'EP', 'EF', 'Laboratorios'
  ciclo?: string
  profesor?: string
}

export interface CourseSearchResponse {
  course_id: string
  course_code: string
  course_name: string
  query: string
  total_matches: number
  execution_time_ms: number
  results: CourseSearchResultItem[]
}

export interface CourseAvailableFilters {
  tipos: string[]
  subtipos: string[]
  ciclos: string[]
  profesores: string[]
}
