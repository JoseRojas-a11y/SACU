import { useQuery } from '@tanstack/react-query'
import { fetchFacultiesApi } from '../services/repositorioApi'
import { Faculty } from '../../../core/types'

export function useFaculties() {
  return useQuery<Faculty[]>({
    queryKey: ['faculties'],
    queryFn: fetchFacultiesApi,
    staleTime: 10 * 60 * 1000,
  })
}
