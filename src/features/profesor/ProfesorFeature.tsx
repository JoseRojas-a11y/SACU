import React from 'react'
import { useProfesorStore } from './store/useProfesorStore'
import { useProfessorsDirectory } from './hooks/useProfessorsDirectory'
import { WeightCustomizer } from './components/WeightCustomizer'
import { ProfessorCourseCard } from './components/ProfessorCourseCard'
import { ProfessorReviewsModal } from './components/ProfessorReviewsModal'
import { ReportCommentModal } from './components/ReportCommentModal'
import { UndoSnackbar } from './components/UndoSnackbar'
import { CsPHierarchicalTree } from './components/CsPHierarchicalTree'
import { CsPInvertedSearch } from './components/CsPInvertedSearch'
import { SyncedPdfInspector } from './components/SyncedPdfInspector'
import { ScheduleGeneratorWidget } from './components/ScheduleGeneratorWidget'
import { RoleType } from './types/profesor.types'
import {
  GraduationCap,
  BookOpen,
  Search,
  SlidersHorizontal,
  Compass,
  Layers,
  Sparkles,
  Award,
  Users
} from 'lucide-react'

import AstronautImg from '@/core/public/astronauta.png'

interface Trajectory {
  startPos: { x: string; y: string }
  endPos: { x: string; y: string }
  startRotate: number
  endRotate: number
  scale: number
}

const ASTRONAUT_TRAJECTORIES: Trajectory[] = [
  { startPos: { x: '-10%', y: '65%' }, endPos: { x: '105%', y: '10%' }, startRotate: -15, endRotate: 35, scale: 0.9 },
  { startPos: { x: '105%', y: '15%' }, endPos: { x: '-15%', y: '75%' }, startRotate: 20, endRotate: -45, scale: 0.8 },
  { startPos: { x: '-10%', y: '10%' }, endPos: { x: '105%', y: '80%' }, startRotate: 0, endRotate: 60, scale: 1.0 },
  { startPos: { x: '105%', y: '85%' }, endPos: { x: '-15%', y: '5%' }, startRotate: 45, endRotate: -20, scale: 0.85 },
  { startPos: { x: '15%', y: '105%' }, endPos: { x: '85%', y: '-25%' }, startRotate: -30, endRotate: 30, scale: 0.95 },
]

function FloatingAstronaut() {
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [stage, setStage] = React.useState<'idle' | 'floating' | 'fadingOut'>('idle')
  const [key, setKey] = React.useState(0)

  const traj = ASTRONAUT_TRAJECTORIES[currentIdx]

  React.useEffect(() => {
    // Paso 1: Iniciar movimiento tras montar la posición inicial
    const startTimer = setTimeout(() => {
      setStage('floating')
    }, 100)

    // Paso 2: Desvanecer suavemente 2s antes de completar la trayectoria
    const fadeTimer = setTimeout(() => {
      setStage('fadingOut')
    }, 13500)

    // Paso 3: Al finalizar el vuelo (15.5s), cambiar a la siguiente trayectoria en otra dirección
    const resetTimer = setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % ASTRONAUT_TRAJECTORIES.length)
      setKey((k) => k + 1)
      setStage('idle')
    }, 16500)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(fadeTimer)
      clearTimeout(resetTimer)
    }
  }, [key])

  const isMoving = stage === 'floating' || stage === 'fadingOut'
  const isVisible = stage === 'floating'

  return (
    <div
      key={key}
      className="absolute pointer-events-none z-10 select-none hidden sm:block"
      style={{
        left: isMoving ? traj.endPos.x : traj.startPos.x,
        top: isMoving ? traj.endPos.y : traj.startPos.y,
        opacity: isVisible ? 0.9 : 0,
        transform: `scale(${traj.scale}) rotate(${isMoving ? traj.endRotate : traj.startRotate}deg)`,
        transition: isMoving
          ? 'left 15.5s linear, top 15.5s linear, transform 15.5s linear, opacity 1.5s ease-in-out'
          : 'none',
      }}
    >
      <img
        src={AstronautImg}
        alt="Astronauta flotando"
        className="w-24 h-24 sm:w-32 sm:h-32 object-contain filter drop-shadow-[0_10px_25px_rgba(168,85,247,0.6)] animate-pulse"
      />
    </div>
  )
}

interface StarConfig {
  id: number
  style: React.CSSProperties
  sizeClass: string
  animationDelay: string
  animationDuration: string
  isCrossStar?: boolean
}

const HERO_STARS: StarConfig[] = [
  // Bordes Superiores
  { id: 1, style: { top: '6%', left: '4%' }, sizeClass: 'w-3 h-3', animationDelay: '0s', animationDuration: '6s', isCrossStar: true },
  { id: 2, style: { top: '12%', left: '18%' }, sizeClass: 'w-1.5 h-1.5', animationDelay: '1.2s', animationDuration: '6.4s' },
  { id: 3, style: { top: '5%', right: '22%' }, sizeClass: 'w-2 h-2', animationDelay: '2.4s', animationDuration: '5.8s' },
  { id: 4, style: { top: '8%', right: '5%' }, sizeClass: 'w-3.5 h-3.5', animationDelay: '3.6s', animationDuration: '6.2s', isCrossStar: true },

  // Bordes Izquierdos
  { id: 5, style: { top: '32%', left: '3%' }, sizeClass: 'w-1.5 h-1.5', animationDelay: '4.8s', animationDuration: '6s' },
  { id: 6, style: { top: '58%', left: '5%' }, sizeClass: 'w-3 h-3', animationDelay: '1.8s', animationDuration: '6.3s', isCrossStar: true },
  { id: 7, style: { top: '80%', left: '4%' }, sizeClass: 'w-2 h-2', animationDelay: '3.2s', animationDuration: '5.7s' },

  // Bordes Derechos
  { id: 8, style: { top: '28%', right: '4%' }, sizeClass: 'w-2 h-2', animationDelay: '0.8s', animationDuration: '6.1s' },
  { id: 9, style: { top: '55%', right: '3%' }, sizeClass: 'w-3.5 h-3.5', animationDelay: '4.2s', animationDuration: '6.5s', isCrossStar: true },
  { id: 10, style: { top: '78%', right: '6%' }, sizeClass: 'w-1.5 h-1.5', animationDelay: '2.0s', animationDuration: '5.9s' },

  // Bordes Inferiores
  { id: 11, style: { bottom: '8%', left: '10%' }, sizeClass: 'w-3 h-3', animationDelay: '5.2s', animationDuration: '6s', isCrossStar: true },
  { id: 12, style: { bottom: '6%', right: '8%' }, sizeClass: 'w-3.5 h-3.5', animationDelay: '0.4s', animationDuration: '6.2s', isCrossStar: true },
]

function HeroSpaceStars() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes heroStarShine {
          0%, 75%, 100% {
            transform: scale(1);
            opacity: 0.35;
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4));
          }
          88% {
            transform: scale(2.2);
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(192, 132, 252, 0.9)) drop-shadow(0 0 14px rgba(255, 255, 255, 1));
          }
        }
      `}</style>
      {HERO_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute flex items-center justify-center"
          style={{
            ...star.style,
            animation: `heroStarShine ${star.animationDuration} ease-in-out infinite`,
            animationDelay: star.animationDelay,
          }}
        >
          {star.isCrossStar ? (
            <svg
              className={`${star.sizeClass} text-white fill-current`}
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          ) : (
            <div className={`${star.sizeClass} rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ProfesorFeature() {
  const activeTab = useProfesorStore((state) => state.activeTab)
  const setActiveTab = useProfesorStore((state) => state.setActiveTab)

  const searchQuery = useProfesorStore((state) => state.searchQuery)
  const setSearchQuery = useProfesorStore((state) => state.setSearchQuery)
  const selectedRole = useProfesorStore((state) => state.selectedRole)
  const setSelectedRole = useProfesorStore((state) => state.setSelectedRole)
  const sortBy = useProfesorStore((state) => state.sortBy)
  const setSortBy = useProfesorStore((state) => state.setSortBy)

  // CsP Sub-navigation
  const selectedDocument = useProfesorStore((state) => state.selectedDocument)
  const [cspNavMode, setCspNavMode] = React.useState<'tree' | 'search'>('tree')

  const { tuples, totalCount, isLoading } = useProfessorsDirectory()

  const roles: (RoleType | 'ALL')[] = ['ALL', 'Teoria', 'Practica', 'Laboratorio', 'General']

  const [visibleCount, setVisibleCount] = React.useState<number>(20)

  // Resetear paginación al cambiar filtros o búsqueda
  React.useEffect(() => {
    setVisibleCount(20)
  }, [searchQuery, selectedRole, sortBy])

  const visibleTuples = React.useMemo(() => {
    return tuples.slice(0, visibleCount)
  }, [tuples, visibleCount])

  return (
    <div className="min-h-screen bg-[var(--theme-bg-main)] text-[var(--theme-text-main)] pb-24">
      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-[#1b0222] via-[#2d0046] to-[#8300ca] text-white pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow ambient light */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--theme-accent)]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#8300ca]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Estrellas Espaciales en los bordes */}
        <HeroSpaceStars />

        {/* Astronauta Flotante Dinámico */}
        <FloatingAstronaut />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Directorio de Docentes & <br />
              <span className="bg-gradient-to-r from-white via-purple-100 to-[var(--theme-accent)] bg-clip-text text-transparent">
                Cómo sobrevivir a tu Profe
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-purple-100/90 max-w-2xl leading-relaxed">
              Consulta métricas ponderadas en tiempo real, comparte valoraciones anónimas y explora las guías de consejos históricos por ciclo.
            </p>

            {/* Tab Switcher (Directorio vs CsP) */}
            <div className="flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-md w-full">

              <button
                type="button"
                onClick={() => setActiveTab('csp')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'csp'
                  ? 'bg-white text-slate-900 shadow-lg scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
              >
                <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Cómo sobrevivir a tu Profe</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('directorio')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'directorio'
                  ? 'bg-white text-slate-900 shadow-lg scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
              >
                <GraduationCap className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Directorio & Valoraciones</span>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Content */}
      <main className="max-w-1xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 -mt-6 relative z-20">
        {/* ========================================================================= */}
        {/* 1. VISTA: CÓMO SOBREVIVIR A TU PROFE (CsP)                                 */}
        {/* ========================================================================= */}
        <div className={activeTab === 'csp' ? 'space-y-6 animate-fade-in' : 'hidden'}>
          {/* If a document is currently selected -> Synced PDF Inspector */}
          {selectedDocument ? (
            <SyncedPdfInspector />
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {/* CsP Navigation Switcher Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[var(--theme-primary)]" />
                    <span>Cómo sobrevivir a tu Profe (CsP)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recopilación oficial de experiencias, metodologías de examen y tips de alumnos de ciclos superiores.
                  </p>
                </div>

                {/* Dual Navigation Mode Switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCspNavMode('tree')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${cspNavMode === 'tree'
                      ? 'bg-white text-[var(--theme-primary)] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Árbol Jerárquico</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCspNavMode('search')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${cspNavMode === 'search'
                      ? 'bg-white text-[var(--theme-primary)] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Buscador Invertido</span>
                  </button>
                </div>
              </div>

              {/* Sub-view: Hierarchical Tree vs Inverted Index Search */}
              {cspNavMode === 'tree' ? (
                <CsPHierarchicalTree />
              ) : (
                <CsPInvertedSearch />
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. VISTA: DIRECTORIO Y VALORACIONES                                      */}
        {/* ========================================================================= */}
        <div className={activeTab === 'directorio' ? 'space-y-6 animate-fade-in' : 'hidden'}>
          {/* Interactive Dynamic Weight Customizer */}
          <WeightCustomizer />

          {/* Search Bar & Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de profesor o curso (ej. Mendoza, Algorítmica)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role filter pills & Sort dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Role Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${selectedRole === role
                      ? 'bg-white text-[var(--theme-primary)] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {role === 'ALL' ? 'Todos' : role}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] cursor-pointer text-xs"
                >
                  <option value="rating">⭐ Mayor Rating Ponderado</option>
                  <option value="reviews">💬 Más Reseñas</option>
                  <option value="name">👤 Nombre Docente (A-Z)</option>
                  <option value="course">📚 Curso (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-4 px-1">
              <span>
                Mostrando {Math.min(visibleTuples.length, tuples.length)} de {tuples.length} cátedras evaluadas
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Cargando directorio de docentes...
              </div>
            ) : tuples.length === 0 ? (
              <div className="py-16 px-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No se encontraron docentes</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Intenta con otro término de búsqueda o cambia el filtro de rol.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedRole('ALL')
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-[var(--theme-primary)] font-bold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleTuples.map((tuple) => (
                    <ProfessorCourseCard key={tuple.id} tuple={tuple} />
                  ))}
                </div>

                {/* Botón Cargar Más Profesores */}
                {visibleCount < tuples.length && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 20)}
                      className="px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-800 hover:text-[var(--theme-primary)] font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      Cargar más docentes ({tuples.length - visibleCount} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>


      </main>

      {/* Global Modals & Floating Snackbars */}
      <ProfessorReviewsModal />
      <ReportCommentModal />
      <UndoSnackbar />
      <ScheduleGeneratorWidget />
    </div>
  )
}
