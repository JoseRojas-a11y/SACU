import { FacultyDropdown } from '../../features/repositorio/components/FacultyDropdown'
import { Faculty } from '../types'
import { useUIStore } from '../store/useUIStore'

interface Props {
  faculties: Faculty[]
  selectedFaculty: string
  onFacultySelect: (id: string) => void
  onOpenUpload: () => void
}

export function Navbar({
  faculties,
  selectedFaculty,
  onFacultySelect,
  onOpenUpload,
}: Props) {
  const activeView = useUIStore((state) => state.activeView)
  const setActiveView = useUIStore((state) => state.setActiveView)

  return (
    <header
      className='navbar-header'
    >
      <div className="navbar-container">
        {/* Brand logo & navigation */}
        <div className="navbar-left">
          <button
            onClick={() => setActiveView('repositorio')}
            className="navbar-brand-btn group"
          >
            <span className="navbar-brand-logo">
              SACU
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="navbar-nav">
            <button
              onClick={() => setActiveView('repositorio')}
              className={`nav-link ${activeView === 'repositorio' ? 'nav-link-active' : ''
                }`}
            >
              Repositorio
            </button>

            <button
              onClick={() => setActiveView('profesor')}
              className={`nav-link ${activeView === 'profesor' ? 'nav-link-active' : ''
                }`}
            >
              Docentes
            </button>

            <FacultyDropdown
              faculties={faculties}
              value={selectedFaculty}
              onChange={(id) => {
                onFacultySelect(id)
                setActiveView('repositorio')
              }}
            />
          </nav>
        </div>

        {/* Right action controls */}
        <div className="navbar-right">
          <button onClick={onOpenUpload} className="btn-upload">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Subir plancha</span>
            <span className="sm:hidden">Subir</span>
          </button>
        </div>
      </div>
    </header>
  )
}
