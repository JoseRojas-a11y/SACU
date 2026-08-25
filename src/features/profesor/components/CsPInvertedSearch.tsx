import React from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import { useCsPRepository } from '../hooks/useCsPRepository'
import { Search, Compass, ExternalLink, BookOpen, GraduationCap } from 'lucide-react'

export const CsPInvertedSearch: React.FC = () => {
  const invertedSearchQuery = useProfesorStore((state) => state.invertedSearchQuery)
  const setInvertedSearchQuery = useProfesorStore((state) => state.setInvertedSearchQuery)
  const setSelectedDocument = useProfesorStore((state) => state.setSelectedDocument)
  const setActivePdfPage = useProfesorStore((state) => state.setActivePdfPage)

  const { documents, searchResults } = useCsPRepository()

  const handleJumpToResult = (docId: string, targetPage: number) => {
    const doc = documents.find((d) => d.id === docId)
    if (doc) {
      setSelectedDocument(doc)
      setActivePdfPage(targetPage)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={invertedSearchQuery}
          onChange={(e) => setInvertedSearchQuery(e.target.value)}
          placeholder="Buscar profesor, curso o tema en todas las guías históricas de CsP..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] shadow-xs transition-all"
        />
        {invertedSearchQuery && (
          <button
            onClick={() => setInvertedSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Results List */}
      {invertedSearchQuery.trim() ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Resultados encontrados en el índice: {searchResults.length}</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
              No se encontraron coincidencias en las guías CsP para "{invertedSearchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {searchResults.map((res, idx) => (
                <div
                  key={`${res.documentId}-${res.page}-${idx}`}
                  className="prof-bento-card p-4 flex flex-col justify-between hover:border-[var(--theme-primary)] transition-all group shadow-xs bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-[var(--theme-primary)]">
                        Semestre {res.period} · {res.cycle}° Ciclo · Pág. {res.page}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {res.roleType}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[var(--theme-primary)] transition-colors">
                      {res.professorName}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                      <BookOpen className="w-3 h-3 text-[var(--theme-primary)]" />
                      <span>{res.courseName}</span>
                    </div>

                    {res.tipsSummary && (
                      <p className="text-xs text-slate-500 mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100 line-clamp-2 italic">
                        "{res.tipsSummary}"
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {res.documentTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJumpToResult(res.documentId, res.page)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 hover:bg-[var(--theme-primary)] text-[var(--theme-primary)] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Ir a pág. {res.page}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center gap-3 text-slate-600 text-xs">
          <Compass className="w-5 h-5 text-[var(--theme-primary)] flex-shrink-0" />
          <span>
            El <strong>Motor de Búsqueda Invertida</strong> consulta el esquema <code>index.json</code> de todos los semestres históricos para llevarte directamente a la página exacta de cualquier docente.
          </span>
        </div>
      )}
    </div>
  )
}
