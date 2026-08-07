export interface Faculty {
  id: string
  abbr: string
  name: string
  courses: string[]
  description?: string
}

export interface Material {
  id: number
  faculty: string
  course: string
  author: string
  tipo: string
  ciclo: string
  title: string
  file_url?: string
  download_count?: number
  created_at?: string
}

export interface Professor {
  id: number
  name: string
  department?: string
  email?: string
  rating: number
}

export interface User {
  id: number
  username: string
  email: string
  role?: string
}

export interface SystemStats {
  total_materials: number
  total_courses: number
  total_authors: number
  total_faculties: number
}

export type ViewState = 
  | { kind: 'home' } 
  | { kind: 'course'; course: string }
  | { kind: 'professors' }

export type TipoEvaluation = 'PC1' | 'PC2' | 'PC3' | 'PC4' | 'EP' | 'EF' | 'ES' | 'Labo' | 'Mono'
