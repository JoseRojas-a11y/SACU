import { Professor } from '../../../core/types'
import { fetchWithAuth } from '../../../core/config/apiClient'
import { MOCK_PROFESSORS } from '../../../services/api'

export async function fetchProfessorsApi(): Promise<Professor[]> {
  try {
    const data = await fetchWithAuth<Professor[]>('/professors')
    if (Array.isArray(data)) return data
  } catch (e) {
    console.info('[SACU] Backend unreachable.')
  }
  return []
}

export async function rateProfessorApi(profId: number, rating: number): Promise<Professor> {
  try {
    const data = await fetchWithAuth<Professor>(`/professors/${profId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    })
    return data
  } catch (e) {
    console.info('[SACU] Backend offline. Simulated rating submission.')
  }

  const prof = MOCK_PROFESSORS.find(p => p.id === profId)
  if (prof) {
    return { ...prof, rating: Number(((prof.rating + rating) / 2).toFixed(1)) }
  }
  throw new Error('Docente no encontrado')
}
