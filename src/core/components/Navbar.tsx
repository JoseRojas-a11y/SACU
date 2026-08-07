import { FacultyDropdown } from '../../features/repositorio/components/FacultyDropdown'
import { Faculty } from '../types'
import { useUIStore } from '../store/useUIStore'

interface Props {
  faculties: Faculty[]
  selectedFaculty: string
  onFacultySelect: (id: string) => void
  onOpenUpload: () => void
  scrolled: boolean
}

export function Navbar({
  faculties,
  selectedFaculty,
  onFacultySelect,
  onOpenUpload,
  scrolled,
}: Props) {
  const activeView = useUIStore((state) => state.activeView)
  const setActiveView = useUIStore((state) => state.setActiveView)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-200"
      style={{
        backgroundColor: scrolled ? 'rgba(15, 27, 61, 0.97)' : '#0f1b3d',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActiveView('repositorio')
            }}
            className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #4f73ff, #818cf8)', color: 'white' }}
            >
              P
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-bold text-base tracking-tight">Planchas</span>
              <span className="text-white/35 text-xs hidden sm:inline font-mono">SACU</span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <FacultyDropdown
              faculties={faculties}
              value={selectedFaculty}
              onChange={(id) => {
                onFacultySelect(id)
                setActiveView('repositorio')
              }}
            />
            <button
              onClick={() => setActiveView('repositorio')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'repositorio'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Repositorio
            </button>
            <button
              onClick={() => setActiveView('profesor')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'profesor'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Docentes
            </button>
          </nav>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold shadow-lg transition-all hover:scale-105 cursor-pointer active:scale-95"
            style={{ backgroundColor: '#4f73ff', color: 'white' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Subir plancha
          </button>

          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white text-xs font-bold font-mono">
            SACU
          </div>
        </div>
      </div>
    </header>
  )
}
