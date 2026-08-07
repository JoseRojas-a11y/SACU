import { Faculty, Material } from '../../../core/types'
import { API_BASE_URL, fetchWithAuth } from '../../../core/config/apiClient'
import { MOCK_FACULTIES, MOCK_MATERIALS } from '../../../services/api'

export async function fetchFacultiesApi(): Promise<Faculty[]> {
  try {
    const data = await fetchWithAuth<Faculty[]>('/faculties')
    if (Array.isArray(data) && data.length > 0) {
      return data.map((f: any) => ({
        ...f,
        courses: MOCK_FACULTIES.find(mf => mf.id === f.id)?.courses || []
      }))
    }
  } catch (e) {
    console.info('[SACU] Backend unreachable. Fallback to mock faculties.')
  }
  return MOCK_FACULTIES
}

export async function fetchMaterialsApi(filters?: {
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

    const endpoint = `/materials?${query.toString()}`
    const data = await fetchWithAuth<Material[]>(endpoint)
    if (Array.isArray(data)) return data
  } catch (e) {
    console.info('[SACU] Backend unreachable.')
  }

  return []
}

export async function createMaterialApiCall(newMat: Omit<Material, 'id'>): Promise<Material> {
  try {
    const data = await fetchWithAuth<Material>('/materials', {
      method: 'POST',
      body: JSON.stringify(newMat),
    })
    return data
  } catch (e) {
    console.info('[SACU] Backend offline. Created material in session memory.')
  }

  return {
    ...newMat,
    id: Date.now(),
    download_count: 0,
    created_at: new Date().toISOString()
  }
}
