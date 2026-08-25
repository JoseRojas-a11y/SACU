import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProfessorTuples } from '../services/profesorApi'
import { useProfesorStore } from '../store/useProfesorStore'
import { ProfessorCourseTuple } from '../types/profesor.types'

export function useProfessorsDirectory() {
  const weights = useProfesorStore((state) => state.weights)
  const searchQuery = useProfesorStore((state) => state.searchQuery)
  const selectedRole = useProfesorStore((state) => state.selectedRole)
  const sortBy = useProfesorStore((state) => state.sortBy)

  const { data: rawTuples = [], isLoading, isError, refetch } = useQuery<ProfessorCourseTuple[]>({
    queryKey: ['professors-directory'],
    queryFn: fetchProfessorTuples,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Cálculo de scoring dinámico y filtrado reactivo
  const processedTuples = useMemo(() => {
    // 1. Calcular promedio ponderado con base en la escala 1-10
    const wEns = Number(weights.ensenanza || 1)
    const wEval = Number(weights.evaluacion || 1)
    const wDed = Number(weights.dedicacion || 1)
    const totalWeights = wEns + wEval + wDed

    let list = rawTuples.map((tuple) => {
      const sEns = tuple.scores.ensenanza || 4.0
      const sEval = tuple.scores.evaluacion ?? tuple.scores.dificultad ?? 4.0
      const sDed = tuple.scores.dedicacion || 4.0

      const calculatedRating = totalWeights > 0
        ? ((sEns * wEns) + (sEval * wEval) + (sDed * wDed)) / totalWeights
        : (sEns + sEval + sDed) / 3

      return {
        ...tuple,
        weightedRating: Number(calculatedRating.toFixed(2)),
      }
    })

    // 2. Filtrar por búsqueda (Profesor y Curso)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (t) =>
          t.professorName.toLowerCase().includes(q) ||
          t.courseName.toLowerCase().includes(q) ||
          (t.courseCode && t.courseCode.toLowerCase().includes(q))
      )
    }

    // 3. Filtrar por RoleType
    if (selectedRole !== 'ALL') {
      list = list.filter((t) => t.roleType === selectedRole)
    }

    // 4. Ordenamiento dinámico
    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.weightedRating || 0) - (a.weightedRating || 0)
      }
      if (sortBy === 'reviews') {
        return b.reviewCount - a.reviewCount
      }
      if (sortBy === 'name') {
        return a.professorName.localeCompare(b.professorName)
      }
      if (sortBy === 'course') {
        return a.courseName.localeCompare(b.courseName)
      }
      return 0
    })

    return list
  }, [rawTuples, weights, searchQuery, selectedRole, sortBy])

  return {
    tuples: processedTuples,
    totalCount: rawTuples.length,
    isLoading,
    isError,
    refetch,
  }
}
