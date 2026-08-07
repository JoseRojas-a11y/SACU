import { useQuery } from '@tanstack/react-query'
import { fetchMaterialsApi } from '../services/repositorioApi'
import { Material } from '../../../core/types'

interface MaterialFilters {
  faculty?: string | null
  ciclo?: string | null
  tipo?: string | null
  search?: string
}

export function useMaterials(filters?: MaterialFilters) {
  return useQuery<Material[]>({
    queryKey: ['materials', filters],
    queryFn: () => fetchMaterialsApi(filters),
  })
}
