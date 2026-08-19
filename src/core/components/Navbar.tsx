import { useState, useEffect } from 'react'
import { FacultyDropdown } from '../../features/repositorio/components/FacultyDropdown'
import { Faculty } from '../types'
import { useUIStore } from '../store/useUIStore'

interface Props {
  faculties: Faculty[]
  selectedFaculty: string
  onFacultySelect: (id: string) => void
  onOpenUpload: () => void
  onResetCourse?: () => void
}

export function Navbar({
  faculties,
  selectedFaculty,
  onFacultySelect,
  onOpenUpload,
  onResetCourse,
}: Props) {
  const activeView = useUIStore((state) => state.activeView)
  const setActiveView = useUIStore((state) => state.setActiveView)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Cerrar menú móvil al cambiar de tamaño de ventana a desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleNavigate(view: 'repositorio' | 'profesor') {
    setActiveView(view)
    if (view === 'repositorio') {
      onResetCourse?.()
    }
    setMobileMenuOpen(false)
  }

  function handleFacultyChange(id: string) {
    onFacultySelect(id)
    onResetCourse?.()
    setActiveView('repositorio')
    setMobileMenuOpen(false)
  }

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand logo & navigation desktop */}
        <div className="navbar-left">
          <button
            onClick={() => handleNavigate('repositorio')}
            className="navbar-brand-btn group"
            title="Ir a la vista general del repositorio"
          >
            <span className="navbar-brand-logo">
              SACU
            </span>
          </button>

          {/* Navigation Links Desktop */}
          <nav className="navbar-nav hidden md:flex">
            <button
              onClick={() => handleNavigate('repositorio')}
              className={`nav-link ${activeView === 'repositorio' ? 'nav-link-active' : ''}`}
            >
              Repositorio
            </button>

            <button
              onClick={() => handleNavigate('profesor')}
              className={`nav-link ${activeView === 'profesor' ? 'nav-link-active' : ''}`}
            >
              Docentes
            </button>

            <FacultyDropdown
              faculties={faculties}
              value={selectedFaculty}
              onChange={handleFacultyChange}
            />
          </nav>
        </div>

        {/* Right action controls */}
        <div className="navbar-right">
          <button
            onClick={onOpenUpload}
            className="btn-upload"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Subir plancha</span>
            <span className="sm:hidden">Subir</span>
          </button>

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden navbar-mobile-drawer animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleNavigate('repositorio')}
                className={`navbar-mobile-link ${activeView === 'repositorio' ? 'navbar-mobile-link-active' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <span>Repositorio de Cursos</span>
              </button>

              <button
                onClick={() => handleNavigate('profesor')}
                className={`navbar-mobile-link ${activeView === 'profesor' ? 'navbar-mobile-link-active' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>Directorio de Docentes</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider px-1">
                Facultad activa
              </span>
              <FacultyDropdown
                faculties={faculties}
                value={selectedFaculty}
                onChange={handleFacultyChange}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
