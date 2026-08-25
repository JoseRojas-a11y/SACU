import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCsPDocuments, queryInvertedIndexFromDb } from '../services/cspApi'
import { useProfesorStore } from '../store/useProfesorStore'
import { CsPDocument, CsPInvertedSearchResult } from '../types/profesor.types'

export function useCsPRepository() {
  const selectedPeriod = useProfesorStore((state) => state.selectedPeriod)
  const selectedCycle = useProfesorStore((state) => state.selectedCycle)
  const invertedSearchQuery = useProfesorStore((state) => state.invertedSearchQuery)

  const { data: documents = [], isLoading, isError, refetch } = useQuery<CsPDocument[]>({
    queryKey: ['csp-documents'],
    queryFn: fetchCsPDocuments,
    staleTime: 1000 * 60 * 5,
  })

  // Periodos únicos disponibles ordenados
  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(documents.map((d) => d.period)))
    return periods.sort().reverse()
  }, [documents])

  // Ciclos disponibles para el periodo seleccionado
  const availableCycles = useMemo(() => {
    const docsInPeriod = documents.filter((d) => d.period === selectedPeriod)
    const cycles = Array.from(new Set(docsInPeriod.map((d) => d.cycle)))
    return cycles.sort((a, b) => a - b)
  }, [documents, selectedPeriod])

  // Documentos filtrados por periodo y ciclo activo
  const activeDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (d.period !== selectedPeriod) return false
      if (selectedCycle !== null && d.cycle !== selectedCycle) return false
      return true
    })
  }, [documents, selectedPeriod, selectedCycle])

  // Búsqueda Invertida reactiva sobre Supabase (profesores_indice_invertido)
  const { data: searchResults = [], isLoading: isSearching } = useQuery<CsPInvertedSearchResult[]>({
    queryKey: ['csp-inverted-search', invertedSearchQuery, documents.length],
    queryFn: () => queryInvertedIndexFromDb(invertedSearchQuery, documents),
    enabled: Boolean(invertedSearchQuery && invertedSearchQuery.trim().length > 0),
    staleTime: 1000 * 60 * 2,
  })

  return {
    documents,
    availablePeriods,
    availableCycles,
    activeDocuments,
    searchResults: invertedSearchQuery.trim() ? searchResults : [],
    isLoading,
    isSearching,
    isError,
    refetch,
  }
}
