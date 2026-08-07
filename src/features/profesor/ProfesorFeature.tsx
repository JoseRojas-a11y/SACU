import { useUIStore } from '../../core/store/useUIStore'
import Astronauta from '../../core/public/astronauta.png'

export default function ProfesorFeature() {
  const setActiveView = useUIStore((state) => state.setActiveView)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b0222] via-[#3a0066] to-[#8300ca] text-white animate-fade-in flex flex-col justify-center items-center pt-24 sm:pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cc6dfe]/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-2xl w-full bg-white/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl text-center flex flex-col items-center text-slate-900">
        {/* Floating Icon / Astronaut Header */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#1b0222] to-[#8300ca] p-4 flex items-center justify-center shadow-lg shadow-[#8300ca]/40">
            <img src={Astronauta} alt="Próximamente" className="w-full h-auto animate-astronaut-float pointer-events-none drop-shadow-md" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cc6dfe] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8300ca]"></span>
          </span>
        </div>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f3e8ff] border border-[#e9d5ff] mb-4">
          <span className="w-2 h-2 rounded-full bg-[#8300ca]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8300ca]">
            En Desarrollo · Próximamente
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight mb-3">
          Directorio de Docentes
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-lg mb-8">
          Estamos construyendo un espacio unificado para consultar valoraciones, metodologías y recomendaciones de los profesores universitarios.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            ⭐ Reseñas de Alumnos
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            📊 Estadísticas de Aprobación
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            🔍 Filtro por Cátedra
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setActiveView('repositorio')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#8300ca] to-[#6e00aa] hover:from-[#6e00aa] hover:to-[#580088] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Volver al Repositorio</span>
        </button>
      </div>
    </div>
  )
}
