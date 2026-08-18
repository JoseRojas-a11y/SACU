import { useState, useEffect, useRef, useTransition, useMemo } from 'react'
import {
  DriveFolderNode,
  DriveFileNode,
  formatDisplayName
} from '../services/courseDriveService'
import {
  searchCourseContent,
  getCourseAvailableFilters
} from '../services/smartSearchService'
import {
  CourseSearchResultItem,
  MainCategoryTipo
} from '../types/searchTypes'
import { useUIStore } from '../../../core/store/useUIStore'

interface CourseSmartSearchProps {
  courseId: string
  courseName: string
  rootFolder?: DriveFolderNode | null
  onPreviewFile: (file: DriveFileNode, pageNumber?: number) => void
  onBackToExplorer: () => void
}

function getFileIconStyle(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') {
    return { icon: '📄', bg: 'bg-red-50 text-red-600 border-red-200', tag: 'PDF' }
  }
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return { icon: '🖼️', bg: 'bg-purple-50 text-purple-600 border-purple-200', tag: ext.toUpperCase() }
  }
  if (['doc', 'docx'].includes(ext)) {
    return { icon: '📝', bg: 'bg-blue-50 text-blue-600 border-blue-200', tag: 'DOC' }
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return { icon: '📊', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', tag: 'XLS' }
  }
  return { icon: '📑', bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', tag: ext.toUpperCase() || 'FILE' }
}

export function CourseSmartSearch({
  courseId,
  courseName,
  rootFolder,
  onPreviewFile,
  onBackToExplorer
}: CourseSmartSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedTipo, setSelectedTipo] = useState<MainCategoryTipo>('all')
  const [selectedSubtipo, setSelectedSubtipo] = useState<string>('Todas')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CourseSearchResultItem[]>([])
  const [executionTime, setExecutionTime] = useState<number>(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const setToast = useUIStore((state) => state.setToast)

  const formattedCourseTitle = formatDisplayName(courseName)
  const availableFilters = useMemo(() => getCourseAvailableFilters(rootFolder), [rootFolder])

  // Escuchar atajo '/' para enfocar el buscador
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const executeSearch = async (
    searchQuery: string,
    searchTipo: MainCategoryTipo = selectedTipo,
    searchSubtipo: string = selectedSubtipo
  ) => {
    setLoading(true)
    try {
      const response = await searchCourseContent(
        courseId,
        courseName,
        {
          query: searchQuery.trim(),
          tipo: searchTipo,
          subtipo: searchSubtipo,
          mode: 'hybrid'
        },
        rootFolder
      )

      startTransition(() => {
        setResults(response.results)
        setExecutionTime(response.execution_time_ms)
        setHasSearched(true)
        setLoading(false)
      })
    } catch (err) {
      console.error('Error en búsqueda especializada:', err)
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(query, selectedTipo, selectedSubtipo)
  }

  function handleTopicClick(topic: string) {
    setQuery(topic)
    executeSearch(topic, selectedTipo, selectedSubtipo)
    searchInputRef.current?.focus()
  }

  function handleTipoChange(newTipo: MainCategoryTipo) {
    setSelectedTipo(newTipo)
    executeSearch(query, newTipo, selectedSubtipo)
  }

  function handleSubtipoChange(newSubtipo: string) {
    setSelectedSubtipo(newSubtipo)
    executeSearch(query, selectedTipo, newSubtipo)
  }

  function handleCopySnippet(chunk: CourseSearchResultItem) {
    const textToCopy = chunk.texto_preview || `${chunk.file_name} (${chunk.subtipo || 'Material'}) - Página ${chunk.page_number || 1}\nEnlace: https://drive.google.com/file/d/${chunk.doc_id}/view`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedChunkId(chunk.chunk_id)
      setToast('¡Información copiada al portapapeles!', 'success')
      setTimeout(() => setCopiedChunkId(null), 2000)
    })
  }

  function handleOpenViewer(chunk: CourseSearchResultItem) {
    const fileNode: DriveFileNode = {
      id: chunk.doc_id,
      name: chunk.file_name,
      type: 'file'
    }
    onPreviewFile(fileNode, chunk.page_number)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Course Context Header / Search Banner */}
      <div className="bg-white rounded-2xl border border-[var(--theme-border)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-50 text-[var(--theme-primary)] border border-purple-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                {courseId}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Búsqueda especializada por contenido y etiquetas
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Encuentra exámenes específicos (PC1, PC2, EP, EF) y temas de {formattedCourseTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onBackToExplorer}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[var(--theme-primary)] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              <span>Explorador de Carpetas</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="smart-search-wrapper flex items-center gap-3">
          <svg
            className="w-5 h-5 text-[var(--theme-primary)] flex-shrink-0 ml-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>

          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Busca un problema o tema en ${courseId}`}
            className="w-full bg-transparent border-none text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                setHasSearched(false)
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Limpiar búsqueda"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-500">
            <kbd>/</kbd>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Dynamic Category Filters & Subtipo Tag Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          {/* Categoría Principal */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Categoría:</span>
            {[
              { id: 'all', label: 'Todos los contenidos' },
              { id: 'Evaluaciones', label: 'Evaluaciones' },
              { id: 'Material de Estudio', label: 'Material de Estudio' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTipoChange(cat.id as MainCategoryTipo)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${selectedTipo === cat.id
                  ? 'bg-[var(--theme-primary)] text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Etiquetas / Subtipos Dinámicos del Curso (ej. PC1, PC2, PC3, EP, EF, PD, Laboratorios) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <span>Etiqueta exacta ({courseId}):</span>
            </span>
            {availableFilters.subtipos.map((tag) => {
              const isSelected = selectedSubtipo === tag
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSubtipoChange(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${isSelected
                    ? 'bg-purple-100 text-[var(--theme-primary)] border-2 border-[var(--theme-primary)] font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-[var(--theme-primary)]'
                    }`}
                >
                  {tag === 'Todas' ? 'Todas las etiquetas' : tag}
                </button>
              )
            })}
          </div>
        </div>
      </div >

      {/* Search Results / Loading / Zero States */}
      <div>
        {
          loading ? (
            /* Shimmer Skeleton Loaders */
            <div className="space-y-4">
              <div className="h-5 w-48 rounded-md skeleton-shimmer" />
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
                      <div className="h-4 w-48 rounded-md skeleton-shimmer" />
                    </div>
                    <div className="h-6 w-28 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-64 w-full rounded-xl skeleton-shimmer" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-32 rounded-xl skeleton-shimmer" />
                    <div className="h-8 w-28 rounded-xl skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasSearched && !query && selectedSubtipo === 'Todas' && selectedTipo === 'all' ? (
            /* Zero State: Welcome Guide */
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[var(--theme-border)] shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[var(--theme-primary)] border border-purple-200 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
                🧠
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                Búsqueda por Etiquetas Específicas de {courseId}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                Selecciona una etiqueta (ej. <strong>PC2</strong>, <strong>EP</strong>, <strong>Laboratorios</strong>) o ingresa un tema para realizar una búsqueda precisa en <strong>{formattedCourseTitle}</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {availableFilters.subtipos.filter(t => t !== 'Todas').slice(0, 5).map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubtipoChange(tag)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-purple-50 text-[var(--theme-primary)] border border-purple-200 hover:bg-[var(--theme-primary)] hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    🏷️ Ver evaluaciones {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : hasSearched && results.length === 0 ? (
            /* Empty State: No results found */
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[var(--theme-border)] shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                No se encontraron materiales para {selectedSubtipo !== 'Todas' ? `etiqueta "${selectedSubtipo}"` : ''} {query ? `búsqueda "${query}"` : ''}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Prueba cambiando la etiqueta seleccionada o limpiando el texto de búsqueda para ver más contenidos de este curso.
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setSelectedTipo('all')
                  setSelectedSubtipo('Todas')
                  executeSearch('', 'all', 'Todas')
                }}
                className="text-xs font-bold text-[var(--theme-primary)] hover:underline"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-4">
              {/* Results Header Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="text-xs font-semibold text-slate-600">
                  Mostrando <span className="font-bold text-[var(--theme-primary)]">{results.length}</span> documentos {selectedSubtipo !== 'Todas' ? `etiquetados con [${selectedSubtipo}]` : ''} en <span className="font-bold text-slate-800">{courseId}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  Encontrado en <span className="font-bold text-[var(--theme-primary)]">{executionTime}ms</span>
                </div>
              </div>

              {/* Result Cards */}
              <div className="space-y-4">
                {results.map((item) => {
                  const fileStyle = getFileIconStyle(item.file_name)
                  const isHighMatch = item.score >= 0.88
                  const isMedMatch = item.score >= 0.75 && item.score < 0.88
                  const scorePercent = Math.round(item.score * 100)

                  return (
                    <article
                      key={item.chunk_id}
                      className="smart-result-card group"
                    >
                      {/* Card Top: File Name, Subtipo Tag, Category, Page and Score Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`w-8 h-8 rounded-lg ${fileStyle.bg} flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}>
                            {fileStyle.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[var(--theme-primary)] transition-colors truncate">
                                {formatDisplayName(item.file_name)}
                              </h4>
                              {item.subtipo && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 text-[var(--theme-primary)] border border-purple-200 flex-shrink-0">
                                  🏷️ {item.subtipo}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                              {item.folder_path && (
                                <span className="truncate max-w-[200px] sm:max-w-xs">
                                  {item.folder_path}
                                </span>
                              )}
                              {item.page_number && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                  📍 Pág. {item.page_number}
                                </span>
                              )}
                              {item.ciclo && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                  📅 {item.ciclo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${isHighMatch
                              ? 'score-badge-high'
                              : isMedMatch
                                ? 'score-badge-med'
                                : 'score-badge-low'
                              }`}
                          >
                            <span>{isHighMatch ? '✨' : '🎯'}</span>
                            <span>{scorePercent}% coincidencia</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body: Embedded document page preview */}
                      <div className="relative w-full h-72 sm:h-80 bg-[#0f0214] rounded-xl overflow-hidden border border-slate-200 mb-4 shadow-inner">
                        {item.doc_id && !item.doc_id.startsWith('mock_doc_') && !item.doc_id.startsWith('fallback_') ? (
                          <iframe
                            src={`https://drive.google.com/file/d/${item.doc_id}/preview#page=${item.page_number || 1}`}
                            className="w-full h-full border-none rounded-xl"
                            title={`Vista previa de ${item.file_name}`}
                            allow="autoplay"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6">
                            <span className="text-4xl mb-3">📄</span>
                            <span className="text-xs font-bold text-slate-300">
                              Vista previa del archivo no disponible en entorno simulado
                            </span>
                            <span className="text-[10px] text-slate-500 mt-1 font-mono text-center">
                              ID: {item.doc_id} | Etiqueta: {item.subtipo || 'General'} | Página: {item.page_number || 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Quick Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {/* Open in Viewer Button */}
                          <button
                            onClick={() => handleOpenViewer(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span>
                              Ver en Visor {item.page_number ? `(Pág. ${item.page_number})` : ''}
                            </span>
                          </button>

                          {/* Copy Snippet Button */}
                          <button
                            onClick={() => handleCopySnippet(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                            title="Copiar información del archivo"
                          >
                            {copiedChunkId === item.chunk_id ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <span className="text-emerald-700 font-bold">¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.849A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.599m9.332 0c.053.255.085.52.085.791v.75a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 6.75 6.75v-.75c0-.271.032-.536.085-.791m9.332 0c1.087.24 1.933 1.155 1.933 2.29v10.5a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25V6.14a2.25 2.25 0 0 1 1.933-2.29" />
                                </svg>
                                <span>Copiar Enlace</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Direct Google Drive Link */}
                        {item.doc_id && (
                          <a
                            href={`https://drive.google.com/file/d/${item.doc_id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-[var(--theme-primary)] hover:underline"
                          >
                            <span>Abrir en Drive</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )
        }
      </div >
    </div >
  )
}
