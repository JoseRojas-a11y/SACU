import { useProfessorsDirectory } from './useProfessorsDirectory'

export function useProfessors() {
  const { tuples, isLoading, isError, refetch } = useProfessorsDirectory()
  return {
    data: tuples,
    isLoading,
    isError,
    refetch,
  }
}
