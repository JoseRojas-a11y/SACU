import { Faculty } from '../types'

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  faculties: Faculty[]
  selectedFaculty: string
  onFacultySelect: (id: string) => void
  totalMaterials: number
  totalCourses: number
  totalAuthors: number
}

export function Hero({
  searchQuery,
  onSearchChange,
  faculties,
  selectedFaculty,
  onFacultySelect,
  totalMaterials,
  totalCourses,
  totalAuthors,
}: Props) {
  const currentFaculty = faculties.find(f => f.id === selectedFaculty) || faculties[0]

  return (
    <section
      className="pt-20 pb-12 relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(155deg, #080e22 0%, #0f1b3d 50%, #172651 100%)' }}
    >
      {/* Decorative Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Sistema Académico Unificado (SACU) v1.0
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          <span>Planchas de <span className="text-indigo-400">{currentFaculty ? currentFaculty.name : 'Facultad de Ingeniería Industrial y de Sistemas'}</span></span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Encuentra exámenes parciales, finales, prácticas calificadas y laboratorios resueltos de la FIIS.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto relative shadow-2xl">
          <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/30 transition-all">
            <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por curso, tema (ej. Grafos, Integrales), autor o tipo..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="mr-2 text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/10"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Faculty quick filters */}
        {faculties.length > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1">Facultades:</span>
            {faculties.map(f => (
              <button
                key={f.id}
                onClick={() => onFacultySelect(f.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  selectedFaculty === f.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {f.abbr}
              </button>
            ))}
          </div>
        )}

        {/* System Stats Chips */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-indigo-300 font-mono">{totalMaterials}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Planchas</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-xl sm:text-2xl font-extrabold text-sky-300 font-mono">{totalCourses}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Cursos</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-extrabold text-indigo-300 font-mono">{totalAuthors}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Colaboradores</p>
          </div>
        </div>
      </div>
    </section>
  )
}
