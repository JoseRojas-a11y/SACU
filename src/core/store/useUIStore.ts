import { create } from 'zustand'

export type ViewType = 'repositorio' | 'profesor'

interface UIState {
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info'
  showUploadModal: boolean
  showProfessorsModal: boolean
  activeView: ViewType
  setToast: (msg: string | null, type?: 'success' | 'error' | 'info') => void
  setUploadModal: (open: boolean) => void
  setProfessorsModal: (open: boolean) => void
  setActiveView: (view: ViewType, updateUrl?: boolean) => void
}

export function getViewFromUrl(): ViewType {
  if (typeof window === 'undefined') return 'repositorio'
  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()
  const search = window.location.search.toLowerCase()

  if (
    path.includes('/docentes') ||
    path.includes('/profesor') ||
    path.includes('/profesores') ||
    hash.includes('docentes') ||
    hash.includes('profesor') ||
    search.includes('view=docentes') ||
    search.includes('view=profesor')
  ) {
    return 'profesor'
  }
  return 'repositorio'
}

export const useUIStore = create<UIState>((set) => ({
  toastMessage: null,
  toastType: 'success',
  showUploadModal: false,
  showProfessorsModal: false,
  activeView: getViewFromUrl(),
  setToast: (msg, type = 'success') => set({ toastMessage: msg, toastType: type }),
  setUploadModal: (open) => set({ showUploadModal: open }),
  setProfessorsModal: (open) => set({ showProfessorsModal: open }),
  setActiveView: (view, updateUrl = true) => {
    set({ activeView: view })
    if (updateUrl && typeof window !== 'undefined') {
      const targetPath = view === 'profesor' ? '/docentes' : '/repositorio'
      if (window.location.pathname !== targetPath) {
        const search = window.location.search
        window.history.pushState({ view }, '', targetPath + search)
      }
    }
  },
}))
