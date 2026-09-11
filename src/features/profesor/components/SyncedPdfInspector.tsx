import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useProfesorStore } from '../store/useProfesorStore'
import { useCsPRepository } from '../hooks/useCsPRepository'
import { useProfessorsDirectory } from '../hooks/useProfessorsDirectory'
import { useProfessorReviews } from '../hooks/useProfessorReviews'
import { CsPDocument, CsPIndexEntry, ProfessorCourseTuple } from '../types/profesor.types'
import '../styles/SyncedPdfInspector.css'
import {
  ArrowLeft,
  ExternalLink,
  Download,
  BookOpen,
  FileCheck2,
  Search,
  Maximize2,
  Minimize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Columns,
  X,
  GitCompare,
  ArrowRightLeft,
  Star,
  MessageSquare
} from 'lucide-react'

/**
 * Subcomponente de Reseñas y Calificación Expandible dentro del Índice
 */
interface CsPIndexReviewSectionProps {
  tuple?: ProfessorCourseTuple
  entry: CsPIndexEntry
}

const CsPIndexReviewSection: React.FC<CsPIndexReviewSectionProps> = ({ tuple, entry }) => {
  const setSelectedTuple = useProfesorStore((state) => state.setSelectedTuple)
  const setReviewsModalOpen = useProfesorStore((state) => state.setReviewsModalOpen)

  const { reviews, isLoading } = useProfessorReviews(tuple?.id)
  const [visibleCount, setVisibleCount] = useState<number>(3)

  const handleOpenRateModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tuple && tuple.id) {
      setSelectedTuple(tuple)
      setReviewsModalOpen(true)
    }
  }

  const rating =
    tuple?.weightedRating ||
    (tuple
      ? (tuple.scores.ensenanza + tuple.scores.evaluacion + tuple.scores.dedicacion) / 3
      : 4.0)

  return (
    <div className="synced-index-review-panel" onClick={(e) => e.stopPropagation()}>
      {/* 1. Header de Calificaciones y Métricas */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-200/80">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="text-xs font-mono font-black text-slate-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            ({tuple?.reviewCount || reviews.length} reseñas)
          </span>
        </div>

        {/* Botón para Calificar y Dejar Comentario */}
        <button
          type="button"
          onClick={handleOpenRateModal}
          disabled={!tuple || !tuple.id}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-dark)] text-white text-[10px] font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          title="Calificar a este docente y dejar un consejo"
        >
          <Star className="w-2.5 h-2.5 fill-white" />
          <span>Calificar</span>
        </button>
      </div>

      {/* Desglose de puntuaciones */}
      {tuple && (
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-[8px] text-slate-500 font-semibold uppercase">Enseñanza</span>
            <span className="text-[10px] font-mono font-bold text-slate-800">
              {tuple.scores.ensenanza.toFixed(1)}
            </span>
          </div>
          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-[8px] text-slate-500 font-semibold uppercase">Evaluación</span>
            <span className="text-[10px] font-mono font-bold text-slate-800">
              {tuple.scores.evaluacion.toFixed(1)}
            </span>
          </div>
          <div className="p-1 rounded-lg bg-slate-50 border border-slate-100">
            <span className="block text-[8px] text-slate-500 font-semibold uppercase">Dedicación</span>
            <span className="text-[10px] font-mono font-bold text-slate-800">
              {tuple.scores.dedicacion.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* 2. Listado de Comentarios Reales */}
      <div className="space-y-1.5 mt-0.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-[var(--theme-primary)]" />
            <span>Comentarios ({reviews.length})</span>
          </span>
        </div>

        {isLoading ? (
          <div className="py-2 text-center text-[10px] text-slate-400">
            Cargando comentarios...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            Aún no hay comentarios. ¡Sé el primero en calificar!
          </div>
        ) : (
          <>
            {reviews.slice(0, visibleCount).map((rev) => (
              <div key={rev.id} className="synced-mini-comment-item">
                <div className="flex items-center justify-between gap-1 text-[9px]">
                  <span className="font-bold text-slate-700 truncate max-w-[140px]">
                    {rev.authorTag || 'Estudiante FIIS'}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span className="font-mono font-bold text-[9px] text-slate-800">
                      {((rev.scores.ensenanza + rev.scores.evaluacion + rev.scores.dedicacion) / 3).toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 leading-snug">
                  "{rev.comment}"
                </p>
              </div>
            ))}

            {/* Botón Ver Más Comentarios */}
            {visibleCount < reviews.length && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setVisibleCount((prev) => prev + 3)
                }}
                className="w-full py-1 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[var(--theme-primary)] text-[10px] font-bold transition-colors cursor-pointer text-center border border-purple-100"
              >
                Ver más comentarios (+{reviews.length - visibleCount} restantes)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export const SyncedPdfInspector: React.FC = () => {
  const selectedDocument = useProfesorStore((state) => state.selectedDocument)
  const setSelectedDocument = useProfesorStore((state) => state.setSelectedDocument)
  const activePdfPage = useProfesorStore((state) => state.activePdfPage)
  const setActivePdfPage = useProfesorStore((state) => state.setActivePdfPage)

  const compareDocument = useProfesorStore((state) => state.compareDocument)
  const setCompareDocument = useProfesorStore((state) => state.setCompareDocument)
  const comparePdfPage = useProfesorStore((state) => state.comparePdfPage)
  const setComparePdfPage = useProfesorStore((state) => state.setComparePdfPage)
  const isCompareMode = useProfesorStore((state) => state.isCompareMode)
  const setIsCompareMode = useProfesorStore((state) => state.setIsCompareMode)

  const { documents } = useCsPRepository()
  const { tuples } = useProfessorsDirectory()

  const [selectedEntryKey, setSelectedEntryKey] = useState<string | null>(null)
  const [iframeLoadingA, setIframeLoadingA] = useState<boolean>(true)
  const [iframeLoadingB, setIframeLoadingB] = useState<boolean>(true)
  const [indexFilter, setIndexFilter] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false)
  const [isFloatingIndexOpen, setIsFloatingIndexOpen] = useState<boolean>(false)

  // Filtro de coincidencia en comparativa: 'all' = todos, 'match' = solo coincidentes en ambos PDFs
  const [compareMatchFilter, setCompareMatchFilter] = useState<'all' | 'match'>('all')

  // Filtros del modal de selección para comparar
  const [compareSearch, setCompareSearch] = useState<string>('')
  const [comparePeriodFilter, setComparePeriodFilter] = useState<string>('ALL')
  const [compareCycleFilter, setCompareCycleFilter] = useState<number | 'ALL'>('ALL')

  // Bloquear el scroll del body cuando haya un modal, drawer o pantalla completa activa
  useEffect(() => {
    if (isFullscreen || isCompareModalOpen || isFloatingIndexOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (isCompareModalOpen) {
            setIsCompareModalOpen(false)
          } else if (isFloatingIndexOpen) {
            setIsFloatingIndexOpen(false)
          } else if (isFullscreen) {
            setIsFullscreen(false)
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isFullscreen, isCompareModalOpen, isFloatingIndexOpen])

  if (!selectedDocument) return null

  // URLs directas de Cloudinary optimizadas con parámetro ?p=N y ancla #page=N
  const pdfViewerUrlA = selectedDocument.pdfUrl
    ? `${selectedDocument.pdfUrl}?p=${activePdfPage || 1}#page=${activePdfPage || 1}&view=FitH`
    : ''

  const pdfViewerUrlB = compareDocument?.pdfUrl
    ? `${compareDocument.pdfUrl}?p=${comparePdfPage || 1}#page=${comparePdfPage || 1}&view=FitH`
    : ''

  const totalPagesA = selectedDocument.totalPages || Math.max(
    ...selectedDocument.indexData.flatMap((e) => (Array.isArray(e.pages) && e.pages.length > 0 ? e.pages : (e.page ? [e.page] : [1]))),
    selectedDocument.indexData.length,
    1
  )

  const totalPagesB = compareDocument
    ? compareDocument.totalPages || Math.max(
      ...compareDocument.indexData.flatMap((e) => (Array.isArray(e.pages) && e.pages.length > 0 ? e.pages : (e.page ? [e.page] : [1]))),
      compareDocument.indexData.length,
      1
    )
    : 1

  // Entradas filtradas y ordenadas por número de página ascendente con soporte para filtro Match
  const filteredEntries = useMemo(() => {
    return selectedDocument.indexData
      .filter((e) => {
        // Si está en modo comparativa y se seleccionó ver 'Solo coincidentes (Match)'
        if (isCompareMode && compareDocument && compareMatchFilter === 'match') {
          const matchInB = compareDocument.indexData.find((b) => {
            const matchName =
              e.professor_name &&
              b.professor_name &&
              e.professor_name.toLowerCase() === b.professor_name.toLowerCase()
            const matchCourse =
              e.course_name &&
              b.course_name &&
              e.course_name.toLowerCase() === b.course_name.toLowerCase()
            return matchName || matchCourse
          })
          if (!matchInB) return false
        }

        if (!indexFilter.trim()) return true
        const q = indexFilter.toLowerCase()
        return (
          (e.professor_name && e.professor_name.toLowerCase().includes(q)) ||
          (e.course_name && e.course_name.toLowerCase().includes(q)) ||
          (e.tips_summary && e.tips_summary.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        const pageA = Array.isArray(a.pages) && a.pages.length > 0 ? a.pages[0] : (a.page || 0)
        const pageB = Array.isArray(b.pages) && b.pages.length > 0 ? b.pages[0] : (b.page || 0)
        return pageA - pageB
      })
  }, [selectedDocument.indexData, indexFilter, isCompareMode, compareDocument, compareMatchFilter])

  // Manejadores de navegación y alternancia de selección
  const handleSelectEntryDocA = (entryKey: string, targetPage: number) => {
    if (selectedEntryKey === entryKey) {
      // Si ya está seleccionado, contraer al volver a hacer clic
      setSelectedEntryKey(null)
    } else {
      setSelectedEntryKey(entryKey)
      if (targetPage !== activePdfPage) {
        setIframeLoadingA(true)
        setActivePdfPage(targetPage)
      }
    }
  }

  const handleSelectEntryDocB = (targetPage: number) => {
    if (targetPage !== comparePdfPage) {
      setIframeLoadingB(true)
      setComparePdfPage(targetPage)
    }
  }

  const handleSyncBoth = (entryKey: string, pageA: number, pageB?: number) => {
    setSelectedEntryKey(entryKey)
    if (pageA !== activePdfPage) {
      setIframeLoadingA(true)
      setActivePdfPage(pageA)
    }
    if (pageB && pageB !== comparePdfPage) {
      setIframeLoadingB(true)
      setComparePdfPage(pageB)
    }
  }

  const handlePageChangeA = (newPage: number) => {
    const clampedPage = Math.max(1, Math.min(totalPagesA, newPage))
    if (clampedPage !== activePdfPage) {
      setIframeLoadingA(true)
      setActivePdfPage(clampedPage)
    }
  }

  const handlePageChangeB = (newPage: number) => {
    const clampedPage = Math.max(1, Math.min(totalPagesB, newPage))
    if (clampedPage !== comparePdfPage) {
      setIframeLoadingB(true)
      setComparePdfPage(clampedPage)
    }
  }

  // Periodos y Ciclos únicos para los filtros del modal de comparativa
  const availableComparePeriods = useMemo(() => {
    const pSet = new Set(documents.filter((d) => d.id !== selectedDocument.id).map((d) => d.period))
    return Array.from(pSet).sort().reverse()
  }, [documents, selectedDocument.id])

  const availableCompareCycles = useMemo(() => {
    const cSet = new Set(documents.filter((d) => d.id !== selectedDocument.id).map((d) => d.cycle))
    return Array.from(cSet).sort((a, b) => a - b)
  }, [documents, selectedDocument.id])

  // Documentos filtrados para comparar
  const filteredCompareDocs = useMemo(() => {
    return documents
      .filter((d) => d.id !== selectedDocument.id)
      .filter((d) => {
        if (comparePeriodFilter !== 'ALL' && d.period !== comparePeriodFilter) return false
        if (compareCycleFilter !== 'ALL' && d.cycle !== compareCycleFilter) return false
        if (compareSearch.trim()) {
          const q = compareSearch.toLowerCase()
          return (
            d.title.toLowerCase().includes(q) ||
            d.period.toLowerCase().includes(q) ||
            `${d.cycle}`.includes(q)
          )
        }
        return true
      })
  }, [documents, selectedDocument.id, comparePeriodFilter, compareCycleFilter, compareSearch])

  const handleStartComparison = (doc: CsPDocument) => {
    setCompareDocument(doc)
    setIsCompareMode(true)
    setIsCompareModalOpen(false)
    setIsFloatingIndexOpen(false)
  }

  const handleCloseComparison = () => {
    setIsCompareMode(false)
    setCompareDocument(null)
    setIsFloatingIndexOpen(false)
  }

  // Componente de Contenido del Índice Reutilizable
  const renderIndexContent = (isFloating: boolean = false) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>Índice {isCompareMode ? 'Comparativo' : 'de Docentes'}</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[var(--theme-primary)] bg-purple-100 px-2 py-0.5 rounded-md">
              {filteredEntries.length} registros
            </span>
            {isFloating && (
              <button
                type="button"
                onClick={() => setIsFloatingIndexOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                title="Cerrar índice"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mb-2 leading-snug">
          {isCompareMode
            ? 'Navega por las páginas del periodo actual y contrasta con el periodo comparativo.'
            : 'Haz clic en un docente para ver sus calificaciones, comentarios y navegar a su página.'}
        </p>

        {/* Quick Index Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={indexFilter}
            onChange={(e) => setIndexFilter(e.target.value)}
            placeholder="Filtrar por docente o curso..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all"
          />
          {indexFilter && (
            <button
              onClick={() => setIndexFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mini Selector Desplegable de Coincidencia (Solo en modo comparativa) */}
        {isCompareMode && compareDocument && (
          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">Filtrar:</span>
            <select
              value={compareMatchFilter}
              onChange={(e) => setCompareMatchFilter(e.target.value as 'all' | 'match')}
              className="synced-match-filter-select text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            >
              <option value="all">📑 Todos los docentes ({selectedDocument.indexData.length})</option>
              <option value="match">⚡ Solo coincidentes (Match)</option>
            </select>
          </div>
        )}
      </div>

      {/* Indexed Entries Scrollable List */}
      <div className="overflow-y-auto space-y-2.5 flex-1 p-1">
        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            {compareMatchFilter === 'match'
              ? 'No hay docentes coincidentes entre ambos periodos con los filtros actuales.'
              : `No se encontraron docentes con el filtro "${indexFilter}".`}
          </div>
        ) : (
          filteredEntries.map((entry, idx) => {
            const pagesListA = Array.isArray(entry.pages) && entry.pages.length > 0
              ? entry.pages
              : (entry.page ? [entry.page] : [1])
            const primaryPageA = pagesListA[0]

            // Buscar si este docente o curso también está en el documento comparativo (Guía B)
            let matchingInDocB = compareDocument?.indexData.find((b) => {
              const matchName = entry.professor_name && b.professor_name && entry.professor_name.toLowerCase() === b.professor_name.toLowerCase()
              const matchCourse = entry.course_name && b.course_name && entry.course_name.toLowerCase() === b.course_name.toLowerCase()
              return matchName || matchCourse
            })

            const pagesListB = matchingInDocB
              ? (Array.isArray(matchingInDocB.pages) && matchingInDocB.pages.length > 0
                ? matchingInDocB.pages
                : (matchingInDocB.page ? [matchingInDocB.page] : [1]))
              : null

            // Cruzar con las tuplas del directorio de docentes para obtener calificaciones y comentarios
            const matchingTuple = tuples.find((t) => {
              const matchId = t.professorId === entry.professor_id && t.courseId === entry.course_id
              const matchName =
                entry.professor_name &&
                t.professorName.toLowerCase().includes(entry.professor_name.toLowerCase()) &&
                entry.course_name &&
                t.courseName.toLowerCase().includes(entry.course_name.toLowerCase())
              return matchId || matchName
            })

            const entryKey = `${entry.course_id}_${entry.professor_id}_${primaryPageA}_${idx}`
            const isActive = selectedEntryKey === entryKey

            return (
              <div
                key={entryKey}
                onClick={() => handleSelectEntryDocA(entryKey, primaryPageA)}
                className={`synced-index-card ${isActive ? 'is-active' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {/* Badges de Páginas en Guía A */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-mono font-extrabold text-[var(--theme-primary)]">
                      {selectedDocument.period}:
                    </span>
                    {pagesListA.map((p) => (
                      <button
                        key={`a-${p}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectEntryDocA(entryKey, p)
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${activePdfPage === p
                            ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                            : 'bg-purple-100 text-[var(--theme-primary)] hover:bg-purple-200'
                          }`}
                        title={`Ir a pág. ${p} en ${selectedDocument.period}`}
                      >
                        Pág. {p}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {entry.role_type}
                  </span>
                </div>

                {/* Referencia Cruzada en Guía B si está en modo comparativa */}
                {isCompareMode && compareDocument && (
                  <div className="mb-2 p-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-2">
                    {pagesListB ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-emerald-800">
                          {compareDocument.period}:
                        </span>
                        {pagesListB.map((pB) => (
                          <button
                            key={`b-${pB}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectEntryDocB(pB)
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${comparePdfPage === pB
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            title={`Ir a pág. ${pB} en ${compareDocument.period}`}
                          >
                            Pág. {pB}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">
                        No registrado en {compareDocument.period}
                      </span>
                    )}

                    {pagesListB && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSyncBoth(entryKey, primaryPageA, pagesListB[0])
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Sincronizar ambos visores a este docente"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Sincronizar</span>
                      </button>
                    )}
                  </div>
                )}

                <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {entry.professor_name || 'Docente Universitario'}
                </h5>

                <p className="text-[11px] text-purple-700 font-semibold mt-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                  <span>{entry.course_name || 'Cátedra'}</span>
                </p>

                {entry.tips_summary && (
                  <div className="mt-2 p-2 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-slate-600 italic leading-relaxed">
                    "{entry.tips_summary}"
                  </div>
                )}

                {/* Sección Expandible: Calificaciones y Comentarios (Solo si este profesor está seleccionado) */}
                {isActive && (
                  <CsPIndexReviewSection tuple={matchingTuple} entry={entry} />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )

  // Contenido Principal del Visor (Compartido entre vista normal y portal de pantalla completa)
  const renderInspectorContent = () => (
    <>
      {/* 1. Barra Superior de Acciones y Control de Comparativa */}
      <div className="synced-inspector-topbar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedDocument(null)
              setIsCompareMode(false)
              setCompareDocument(null)
              setIsFullscreen(false)
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Guías CsP</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-100 text-[var(--theme-primary)]">
              Semestre {selectedDocument.period} · {selectedDocument.cycle}° Ciclo
            </span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
              {selectedDocument.title}
            </span>

            {isCompareMode && compareDocument && (
              <>
                <span className="text-xs font-bold text-slate-400">vs</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                  Semestre {compareDocument.period} · {compareDocument.cycle}° Ciclo
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Botón Abrir Índice Flotante en Modo Comparativa */}
          {isCompareMode && (
            <button
              type="button"
              onClick={() => setIsFloatingIndexOpen(!isFloatingIndexOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isFloatingIndexOpen
                  ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-[var(--theme-primary)] border-purple-200'
                }`}
              title="Abrir/Cerrar menú del índice comparativo"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Índice</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200/60 font-mono">
                {filteredEntries.length}
              </span>
            </button>
          )}

          {/* Botón Modo Comparativa */}
          {isCompareMode && compareDocument ? (
            <button
              type="button"
              onClick={handleCloseComparison}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
              title="Cerrar vista comparativa de dos guías"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Comparativa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[var(--theme-primary)] text-xs font-bold transition-colors cursor-pointer border border-purple-200"
              title="Comparar reseñas con otra guía o ciclo de CsP"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Comparar con otro ciclo</span>
            </button>
          )}

          {/* Botón Descargar PDF */}
          <a
            href={selectedDocument.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={selectedDocument.fileName || `${selectedDocument.title}.pdf`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title="Descargar documento PDF oficial"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Descargar</span>
          </a>

          {/* Botón Abrir PDF Completo */}
          <a
            href={selectedDocument.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-[var(--theme-primary)] text-[var(--theme-primary)] hover:text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            title="Abrir PDF en pestaña nueva"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abrir PDF</span>
          </a>

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa (ESC)' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Layout Grid: Normal (9 cols + 3 cols) vs Comparativa (6 cols y 6 cols = 100% visores) */}
      <div className={isCompareMode && compareDocument ? 'synced-compare-grid' : 'synced-inspector-grid'}>
        {/* Visor 1: Documento Principal (Guía A) */}
        <div className={isCompareMode && compareDocument ? 'synced-viewer-compare-column' : 'synced-viewer-column'}>
          {/* Subheader Banner */}
          <div className="px-4 py-2.5 bg-[#13011a] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-white text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-slate-200 truncate max-w-[220px]">
                {selectedDocument.period} · {selectedDocument.title}
              </span>
            </div>

            {/* Controles de página */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChangeA(activePdfPage - 1)}
                disabled={activePdfPage <= 1}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 font-mono font-bold text-[11px] border border-purple-800">
                Pág. {activePdfPage} / {totalPagesA}
              </span>
              <button
                type="button"
                onClick={() => handlePageChangeA(activePdfPage + 1)}
                disabled={activePdfPage >= totalPagesA}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container A */}
          <div className="synced-iframe-wrapper">
            {iframeLoadingA && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-10 space-y-2">
                <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-300">
                  Cargando página {activePdfPage}...
                </p>
              </div>
            )}

            {pdfViewerUrlA ? (
              <iframe
                key={`${selectedDocument.id}-p${activePdfPage || 1}`}
                src={pdfViewerUrlA}
                onLoad={() => setIframeLoadingA(false)}
                className="synced-drive-iframe"
                title={`Vista previa oficial de ${selectedDocument.title}`}
                allow="autoplay"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-bold text-slate-300">PDF no disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Visor 2: Documento Comparativo (Guía B) - Ocupa las 6 columnas restantes en modo comparativa */}
        {isCompareMode && compareDocument && (
          <div className="synced-viewer-compare-column animate-fade-in">
            {/* Subheader Banner Comparativo */}
            <div className="px-4 py-2.5 bg-[#081a17] border-b border-emerald-900/80 flex flex-wrap items-center justify-between gap-2 text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono font-bold text-emerald-200 truncate max-w-[220px]">
                  {compareDocument.period} · {compareDocument.title}
                </span>
              </div>

              {/* Controles de página B */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChangeB(comparePdfPage - 1)}
                  disabled={comparePdfPage <= 1}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Página anterior en comparativa"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-800">
                  Pág. {comparePdfPage} / {totalPagesB}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChangeB(comparePdfPage + 1)}
                  disabled={comparePdfPage >= totalPagesB}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Página siguiente en comparativa"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Iframe Viewport Container B */}
            <div className="synced-iframe-wrapper">
              {iframeLoadingB && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-10 space-y-2">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-300">
                    Cargando comparativa ({compareDocument.period})...
                  </p>
                </div>
              )}

              {pdfViewerUrlB ? (
                <iframe
                  key={`${compareDocument.id}-p${comparePdfPage || 1}`}
                  src={pdfViewerUrlB}
                  onLoad={() => setIframeLoadingB(false)}
                  className="synced-drive-iframe"
                  title={`Vista previa oficial comparativa de ${compareDocument.title}`}
                  allow="autoplay"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center space-y-2">
                  <FileText className="w-10 h-10 text-slate-600" />
                  <p className="text-xs font-bold text-slate-300">PDF comparativo no disponible</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel de Índice Lateral Tradicional (Solo en modo individual) */}
        {!isCompareMode && (
          <div className="synced-index-column">
            {renderIndexContent(false)}
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* 1. Vista Normal en la Página o Portal en Pantalla Completa */}
      {isFullscreen ? (
        createPortal(
          <div className="synced-fullscreen-portal">
            {renderInspectorContent()}
          </div>,
          document.body
        )
      ) : (
        <div className="synced-inspector-container animate-fade-in">
          {renderInspectorContent()}
        </div>
      )}

      {/* 2. Portal: Modal de Selección de Documento para Comparar */}
      {isCompareModalOpen &&
        createPortal(
          <div
            className="synced-portal-backdrop animate-fade-in"
            onClick={() => setIsCompareModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-[var(--theme-primary)]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Seleccionar Guía para Comparar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                  title="Cerrar modal (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Compara las opiniones y metodologías de los docentes del semestre{' '}
                <strong>{selectedDocument.period}</strong> frente a otro ciclo o periodo académico.
              </p>

              {/* Barra de Búsqueda de Guías para Comparar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={compareSearch}
                    onChange={(e) => setCompareSearch(e.target.value)}
                    placeholder="Buscar por nombre de guía, semestre o ciclo..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all"
                  />
                  {compareSearch && (
                    <button
                      onClick={() => setCompareSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtros rápidos de Periodo y Ciclo */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Periodos */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Periodo:</span>
                    <button
                      type="button"
                      onClick={() => setComparePeriodFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${comparePeriodFilter === 'ALL'
                          ? 'bg-[var(--theme-primary)] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                      Todos
                    </button>
                    {availableComparePeriods.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setComparePeriodFilter(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${comparePeriodFilter === p
                            ? 'bg-[var(--theme-primary)] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Ciclos */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500">Ciclo:</span>
                    <button
                      type="button"
                      onClick={() => setCompareCycleFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${compareCycleFilter === 'ALL'
                          ? 'bg-purple-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                      Todos
                    </button>
                    {availableCompareCycles.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCompareCycleFilter(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${compareCycleFilter === c
                            ? 'bg-purple-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                      >
                        {c}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Listado de Documentos Disponibles */}
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {filteredCompareDocs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    No se encontraron guías con los filtros seleccionados.
                  </div>
                ) : (
                  filteredCompareDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleStartComparison(doc)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[var(--theme-primary)]">
                            Semestre {doc.period}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {doc.cycle}° Ciclo
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-[var(--theme-primary)] transition-colors">
                          {doc.title}
                        </h5>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-[var(--theme-primary)] font-bold text-xs group-hover:bg-[var(--theme-primary)] group-hover:text-white transition-all">
                        Comparar
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Portal: Menú Desplegable Flotante del Índice (Por encima de los PDFs en modo comparativa) */}
      {isCompareMode &&
        isFloatingIndexOpen &&
        createPortal(
          <>
            {/* Backdrop global con blur */}
            <div
              className="synced-portal-backdrop animate-fade-in"
              onClick={() => setIsFloatingIndexOpen(false)}
            />

            <div className="synced-floating-index-drawer">
              {renderIndexContent(true)}
            </div>
          </>,
          document.body
        )}

      {/* 4. Portal: Pestaña Lateral Flotante del Índice (Pegada al borde derecho absoluto de la pantalla) */}
      {isCompareMode &&
        !isFloatingIndexOpen &&
        createPortal(
          <button
            type="button"
            onClick={() => setIsFloatingIndexOpen(true)}
            className="synced-collapsed-index-tab animate-fade-in"
            title="Abrir índice interactivo de docentes"
          >
            <FileCheck2 className="w-4 h-4 text-purple-200" />
            <span className="synced-tab-vertical-text">Índice</span>
            <span className="synced-tab-badge">{filteredEntries.length}</span>
          </button>,
          document.body
        )}
    </>
  )
}


