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
    </div>
  )
}
