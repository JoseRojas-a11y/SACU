import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rateProfessorApi } from '../services/profesorApi'
import { useUIStore } from '../../../core/store/useUIStore'

export function useRateProfessor() {
  const queryClient = useQueryClient()
  const setToast = useUIStore((state) => state.setToast)

  return useMutation({
    mutationFn: ({ profId, rating }: { profId: number; rating: number }) =>
      rateProfessorApi(profId, rating),
    onSuccess: (updatedProf) => {
      queryClient.invalidateQueries({ queryKey: ['professors'] })
      setToast(`¡Gracias! Calificación registrada para ${updatedProf.name}`)
    },
    onError: (err: any) => {
      setToast(`Error al registrar la valoración: ${err.message}`, 'error')
    },
  })
}
