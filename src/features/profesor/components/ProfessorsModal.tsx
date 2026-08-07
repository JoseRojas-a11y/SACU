import { Professor } from '../../../core/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  professors: Professor[]
}

export function ProfessorsModal({ isOpen, onClose, professors }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f1b3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
              👨‍🏫
            </div>
            <div>
              <h2 className="font-bold text-base">Directorio de Docentes</h2>
              <p className="text-xs text-gray-300">Profesores universitarios registrados en SACU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto divide-y divide-gray-100 flex-1">
          {professors.map(p => {
            const initials = p.name.split(' ').slice(0, 2).map(n => n[0]).join('')
            return (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{p.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{p.department}</p>
                    {p.email && <p className="text-[11px] text-gray-400 font-mono mt-0.5">{p.email}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-amber-700 flex-shrink-0">
                  <span>★</span>
                  <span>{p.rating.toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
