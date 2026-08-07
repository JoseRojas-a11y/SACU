import { Faculty, Material, Professor, SystemStats } from '../core/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const MOCK_FACULTIES: Faculty[] = [
  {
    id: 'sistemas',
    abbr: 'FIIS',
    name: 'Facultad de Ingeniería Industrial y de Sistemas',
    courses: ['Algorítmica', 'Base de Datos I', 'Sistemas Operativos', 'Redes de Computadores', 'POO', 'Estructura de Datos'],
    description: 'Ingeniería Industrial, de Sistemas, Software y Ciencias de la Computación.'
  }
]

export const MOCK_MATERIALS: Material[] = []
export const MOCK_PROFESSORS: Professor[] = []

export async function fetchFaculties(): Promise<Faculty[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/faculties`, { signal: AbortSignal.timeout(2500) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map((f: any) => ({
          ...f,
          courses: MOCK_FACULTIES.find(mf => mf.id === f.id)?.courses || []
        }))
      }
    }
  } catch (e) {
    console.info('[SACU Frontend] Backend API offline/unreachable.')
  }
  return MOCK_FACULTIES
}

export async function fetchMaterials(filters?: {
  faculty?: string | null
  ciclo?: string | null
  tipo?: string | null
  search?: string
}): Promise<Material[]> {
  try {
    const query = new URLSearchParams()
    if (filters?.faculty) query.append('faculty', filters.faculty)
    if (filters?.ciclo) query.append('ciclo', filters.ciclo)
    if (filters?.tipo) query.append('tipo', filters.tipo)
    if (filters?.search) query.append('search', filters.search)

    const res = await fetch(`${API_BASE_URL}/materials?${query.toString()}`, { signal: AbortSignal.timeout(2500) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (e) {
    console.info('[SACU Frontend] Backend API offline/unreachable.')
  }
  return []
}

export async function fetchProfessors(): Promise<Professor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/professors`, { signal: AbortSignal.timeout(2500) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) return data
    }
  } catch (e) {
    console.info('[SACU Frontend] Backend API offline.')
  }
  return []
}

export async function createMaterialApi(newMat: Omit<Material, 'id'>): Promise<Material> {
  try {
    const res = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMat),
      signal: AbortSignal.timeout(3000)
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.info('[SACU Frontend] Backend API offline. Created material in local session state.')
  }
  
  return {
    ...newMat,
    id: Date.now(),
    download_count: 0,
    created_at: new Date().toISOString()
  }
}
