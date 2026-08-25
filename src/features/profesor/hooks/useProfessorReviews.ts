import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchReviewsByTuple, insertReviewApi, reportReviewApi } from '../services/profesorApi'
import { useProfesorStore } from '../store/useProfesorStore'
import { Review } from '../types/profesor.types'

export function useProfessorReviews(tupleId?: string) {
  const queryClient = useQueryClient()
  const addPendingReview = useProfesorStore((state) => state.addPendingReview)

  const { data: reviews = [], isLoading, refetch } = useQuery<Review[]>({
    queryKey: ['professor-reviews', tupleId],
    queryFn: () => (tupleId ? fetchReviewsByTuple(tupleId) : Promise.resolve([])),
    enabled: Boolean(tupleId),
    staleTime: 1000 * 60 * 3,
  })

  // Mutación para persistencia definitiva en Supabase
  const persistMutation = useMutation({
    mutationFn: (newReview: Omit<Review, 'id' | 'createdAt'>) => insertReviewApi(newReview),
    onSuccess: (savedReview) => {
      queryClient.invalidateQueries({ queryKey: ['professor-reviews', savedReview.professorCourseId] })
      queryClient.invalidateQueries({ queryKey: ['professors-directory'] })
    },
  })

  // Programación de reseña con 15s Grace Period
  const scheduleReviewSubmission = (
    reviewData: Omit<Review, 'id' | 'createdAt'>,
    professorCourseName: string
  ) => {
    return addPendingReview(
      {
        reviewData,
        professorCourseName,
      },
      () => {
        // Callback que se ejecuta tras 15 segundos sin cancelación
        persistMutation.mutate(reviewData)
      }
    )
  }

  // Mutación para reportar comentario y despachar correo Resend
  const reportMutation = useMutation({
    mutationFn: ({
      reviewId,
      reason,
      extraContext,
    }: {
      reviewId: string
      reason: string
      extraContext?: {
        commentText?: string
        authorTag?: string
        professorName?: string
        courseName?: string
      }
    }) => reportReviewApi(reviewId, reason, extraContext),
    onSuccess: () => {
      if (tupleId) {
        queryClient.invalidateQueries({ queryKey: ['professor-reviews', tupleId] })
      }
    },
  })

  return {
    reviews,
    isLoading,
    refetch,
    scheduleReviewSubmission,
    reportReview: reportMutation.mutate,
    isReporting: reportMutation.isPending,
  }
}
