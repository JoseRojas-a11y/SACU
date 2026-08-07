import { create } from 'zustand'

interface UIState {
  toastMessage: string | null
  toastType: 'success' | 'error' | 'info'
  showUploadModal: boolean
  showProfessorsModal: boolean
  activeView: 'repositorio' | 'profesor'
  setToast: (msg: string | null, type?: 'success' | 'error' | 'info') => void
  setUploadModal: (open: boolean) => void
  setProfessorsModal: (open: boolean) => void
  setActiveView: (view: 'repositorio' | 'profesor') => void
}

export const useUIStore = create<UIState>((set) => ({
  toastMessage: null,
  toastType: 'success',
  showUploadModal: false,
  showProfessorsModal: false,
  activeView: 'repositorio',
  setToast: (msg, type = 'success') => set({ toastMessage: msg, toastType: type }),
  setUploadModal: (open) => set({ showUploadModal: open }),
  setProfessorsModal: (open) => set({ showProfessorsModal: open }),
  setActiveView: (view) => set({ activeView: view }),
}))
