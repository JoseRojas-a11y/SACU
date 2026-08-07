import { useQuery } from '@tanstack/react-query'
import { fetchProfessorsApi } from '../services/profesorApi'
import { Professor } from '../../../core/types'

export function useProfessors() {
  return useQuery<Professor[]>({
    queryKey: ['professors'],
    queryFn: fetchProfessorsApi,
    staleTime: 5 * 60 * 1000,
  })
}
