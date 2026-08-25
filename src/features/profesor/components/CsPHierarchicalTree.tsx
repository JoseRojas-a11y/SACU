import React from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import { useCsPRepository } from '../hooks/useCsPRepository'
import { Calendar, Layers, FileText, ArrowRight, BookOpen } from 'lucide-react'

export const CsPHierarchicalTree: React.FC = () => {
  const selectedPeriod = useProfesorStore((state) => state.selectedPeriod)
  const setSelectedPeriod = useProfesorStore((state) => state.setSelectedPeriod)
  const setSelectedDocument = useProfesorStore((state) => state.setSelectedDocument)

  const { availablePeriods, availableCycles, activeDocuments, isLoading } = useCsPRepository()

  return (
    <div className="space-y-6">
      {/* 1. Academic Period Selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[var(--theme-primary)]" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Seleccionar Periodo Académico
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {availablePeriods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => {
                setSelectedPeriod(period)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedPeriod === period
                  ? 'bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] text-white shadow-md shadow-purple-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
            >
              Semestre {period}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Document Entry Cards List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[var(--theme-primary)]" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Guías y Compilados ({activeDocuments.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando guías CsP...</div>
        ) : activeDocuments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No se encontraron documentos CsP para el periodo y ciclo seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDocuments.map((doc) => (
              <div
                key={doc.id}
                className="prof-bento-card p-5 flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-[var(--theme-primary)]">
                      Semestre {doc.period} · {doc.cycle}° Ciclo
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {doc.indexData.length} docentes indexados
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[var(--theme-primary)] transition-colors leading-snug">
                    {doc.title}
                  </h4>

                  {doc.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>PDF + index.json</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDocument(doc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Abrir en Inspector</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
