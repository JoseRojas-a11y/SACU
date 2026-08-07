import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMaterialApiCall } from '../services/repositorioApi'
import { Material } from '../../../core/types'
import { useUIStore } from '../../../core/store/useUIStore'

export function useUploadMaterial() {
  const queryClient = useQueryClient()
  const setToast = useUIStore((state) => state.setToast)
  const setUploadModal = useUIStore((state) => state.setUploadModal)

  return useMutation({
    mutationFn: (newMaterial: Omit<Material, 'id'>) => createMaterialApiCall(newMaterial),
    onSuccess: (data) => {
      // Invalidate queries so that UI immediately updates with new material
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      setToast(`¡Plancha "${data.title}" subida con éxito!`)
      setUploadModal(false)
    },
    onError: (err: any) => {
      setToast(`Error al subir la plancha: ${err.message || 'Error desconocido'}`, 'error')
    },
  })
}
