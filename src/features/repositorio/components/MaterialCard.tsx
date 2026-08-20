import { Material } from '../../../core/types'

interface Props {
  material: Material
  onDownload?: (material: Material) => void
}

const TIPO_CLASS: Record<string, string> = {
  PC1: 'tipo-pill-pc',
  PC2: 'tipo-pill-pc',
  PC3: 'tipo-pill-pc',
  PC4: 'tipo-pill-pc',
  EP:  'tipo-pill-ep',
  EF:  'tipo-pill-ef',
  ES:  'tipo-pill-es',
  Labo: 'tipo-pill-labo',
  Mono: 'tipo-pill-mono',
}

const TIPO_ICON: Record<string, string> = {
  PC1: '✏️', PC2: '✏️', PC3: '✏️', PC4: '✏️',
  EP: '📝', EF: '📋', ES: '📄', Labo: '🔬', Mono: '📖',
}

export function TipoPill({ tipo, size = 'sm' }: { tipo: string; size?: 'sm' | 'xs' }) {
  const pillVariant = TIPO_CLASS[tipo] ?? 'tipo-pill-default'
  return (
    <span
      className={`inline-flex items-center font-mono font-semibold border rounded-full ${pillVariant} ${
        size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {tipo}
    </span>
  )
}

export function MaterialCard({ material, onDownload }: Props) {
  const initials = material.author.split(' ').slice(0, 2).map(n => n[0]).join('')

  return (
    <article className="material-card-item">
      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Top: icon + tipo */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 card-icon-wrapper">
            {TIPO_ICON[material.tipo] ?? '📄'}
          </div>
          <TipoPill tipo={material.tipo} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">
          {material.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold card-author-avatar">
            {initials}
          </div>
          <span className="text-xs text-gray-500 truncate font-medium">{material.author}</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-slate-50">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold flex-shrink-0 card-ciclo-pill">
            {material.ciclo}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium truncate bg-gray-100 text-gray-600 border border-gray-200">
            {material.course}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onDownload) onDownload(material)
          }}
          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
          title="Descargar plancha"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>
    </article>
  )
}
