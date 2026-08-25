import { create } from 'zustand'
import { RoleType, MetricWeights, ProfessorCourseTuple, PendingReview, CsPDocument } from '../types/profesor.types'

interface ProfesorStoreState {
  // Pestaña activa: Directorio / CsP
  activeTab: 'csp' | 'directorio'
  setActiveTab: (tab: 'directorio' | 'csp') => void

  // Ponderación de métricas (Escala 1 al 10 por criterio)
  weights: MetricWeights
  setWeight: (key: keyof MetricWeights, value: number) => void
  applyPreset: (preset: 'balanced' | 'teaching_first' | 'evaluation_first' | 'high_dedication' | 'low_difficulty') => void

  // Filtros y Búsqueda del Directorio
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedRole: RoleType | 'ALL'
  setSelectedRole: (role: RoleType | 'ALL') => void
  sortBy: 'rating' | 'reviews' | 'name' | 'course'
  setSortBy: (sort: 'rating' | 'reviews' | 'name' | 'course') => void

  // Modal de Reseñas / Detalle de Docente
  selectedTuple: ProfessorCourseTuple | null
  setSelectedTuple: (tuple: ProfessorCourseTuple | null) => void
  isReviewsModalOpen: boolean
  setReviewsModalOpen: (open: boolean) => void

  // Modal de Reporte
  reportingReviewId: string | null
  setReportingReviewId: (id: string | null) => void

  // Buffer de Grace Period (15s Undo)
  pendingReviews: PendingReview[]
  addPendingReview: (review: Omit<PendingReview, 'id' | 'submittedAt' | 'expiresAt' | 'timerId'>, onPersist: () => void) => string
  cancelPendingReview: (id: string) => void

  // Estado del Módulo CsP ("Cómo sobrevivir a tu Profe")
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  selectedCycle: number | null
  setSelectedCycle: (cycle: number | null) => void
  selectedDocument: CsPDocument | null
  setSelectedDocument: (doc: CsPDocument | null) => void
  activePdfPage: number
  setActivePdfPage: (page: number) => void
  compareDocument: CsPDocument | null
  setCompareDocument: (doc: CsPDocument | null) => void
  comparePdfPage: number
  setComparePdfPage: (page: number) => void
  isCompareMode: boolean
  setIsCompareMode: (isCompare: boolean) => void
  invertedSearchQuery: string
  setInvertedSearchQuery: (query: string) => void
}

export const useProfesorStore = create<ProfesorStoreState>((set, get) => ({
  activeTab: 'csp',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Pesos iniciales en escala 1 al 10
  weights: {
    ensenanza: 10,
    evaluacion: 8,
    dedicacion: 8,
  },

  // Asignación directa de importancia (1 a 10)
  setWeight: (changedKey, rawValue) => {
    const val = Math.min(10, Math.max(1, Math.round(rawValue)))
    set((state) => ({
      weights: {
        ...state.weights,
        [changedKey]: val,
      },
    }))
  },

  applyPreset: (preset) => {
    switch (preset) {
      case 'balanced':
        set({ weights: { ensenanza: 10, evaluacion: 10, dedicacion: 10 } })
        break
      case 'teaching_first':
        set({ weights: { ensenanza: 10, evaluacion: 5, dedicacion: 5 } })
        break
      case 'evaluation_first':
      case 'low_difficulty':
        set({ weights: { ensenanza: 5, evaluacion: 10, dedicacion: 5 } })
        break
      case 'high_dedication':
        set({ weights: { ensenanza: 5, evaluacion: 5, dedicacion: 10 } })
        break
    }
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedRole: 'ALL',
  setSelectedRole: (role) => set({ selectedRole: role }),
  sortBy: 'rating',
  setSortBy: (sort) => set({ sortBy: sort }),

  selectedTuple: null,
  setSelectedTuple: (tuple) => set({ selectedTuple: tuple }),
  isReviewsModalOpen: false,
  setReviewsModalOpen: (open) => set({ isReviewsModalOpen: open }),

  reportingReviewId: null,
  setReportingReviewId: (id) => set({ reportingReviewId: id }),

  // Gestión de Grace Period (15 segundos)
  pendingReviews: [],
  addPendingReview: (reviewInput, onPersist) => {
    const id = 'pending-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
    const now = Date.now()
    const expiresAt = now + 15000 // 15 segundos exactos

    const timerId = setTimeout(() => {
      onPersist()
      set((state) => ({
        pendingReviews: state.pendingReviews.filter((r) => r.id !== id),
      }))
    }, 15000)

    const pendingItem: PendingReview = {
      id,
      reviewData: reviewInput.reviewData,
      professorCourseName: reviewInput.professorCourseName,
      submittedAt: now,
      expiresAt,
      timerId,
    }

    set((state) => ({
      pendingReviews: [...state.pendingReviews, pendingItem],
    }))

    return id
  },

  cancelPendingReview: (id) => {
    const item = get().pendingReviews.find((r) => r.id === id)
    if (item?.timerId) {
      clearTimeout(item.timerId)
    }
    set((state) => ({
      pendingReviews: state.pendingReviews.filter((r) => r.id !== id),
    }))
  },

  // Estado CsP
  selectedPeriod: '26-2',
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  selectedCycle: null,
  setSelectedCycle: (cycle) => set({ selectedCycle: cycle }),
  selectedDocument: null,
  setSelectedDocument: (doc) => set({ selectedDocument: doc, activePdfPage: 1 }),
  activePdfPage: 1,
  setActivePdfPage: (page) => set({ activePdfPage: page }),
  compareDocument: null,
  setCompareDocument: (doc) => set({ compareDocument: doc, comparePdfPage: 1 }),
  comparePdfPage: 1,
  setComparePdfPage: (page) => set({ comparePdfPage: page }),
  isCompareMode: false,
  setIsCompareMode: (isCompare) => set({ isCompareMode: isCompare }),
  invertedSearchQuery: '',
  setInvertedSearchQuery: (query) => set({ invertedSearchQuery: query }),
}))
