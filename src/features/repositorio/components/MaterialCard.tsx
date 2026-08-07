import { useState } from 'react'
import { Material } from '../../../core/types'

interface Props {
  material: Material
  onDownload?: (material: Material) => void
}

const TIPO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  PC1:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  PC2:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  PC3:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  PC4:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  EP:   { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  EF:   { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  ES:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Labo: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Mono: { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
}

const TIPO_ICON: Record<string, string> = {
  PC1: '✏️', PC2: '✏️', PC3: '✏️', PC4: '✏️',
  EP: '📝', EF: '📋', ES: '📄', Labo: '🔬', Mono: '📖',
}

export function TipoPill({ tipo, size = 'sm' }: { tipo: string; size?: 'sm' | 'xs' }) {
  const s = TIPO_STYLE[tipo] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
      className={`inline-flex items-center font-mono font-semibold border rounded-full ${
        size === 'xs' ? 'px-1.5 py-px text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {tipo}
    </span>
  )
}

export function MaterialCard({ material, onDownload }: Props) {
  const [hovered, setHovered] = useState(false)
  const initials = material.author.split(' ').slice(0, 2).map(n => n[0]).join('')

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl flex flex-col cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        border: hovered ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
        boxShadow: hovered
          ? '0 12px 32px rgba(79, 115, 255, 0.14), 0 2px 8px rgba(0,0,0,0.04)'
          : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Top: icon + tipo */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: '#f0f3fa' }}
          >
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
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
          >
            {initials}
          </div>
          <span className="text-xs text-gray-500 truncate font-medium">{material.author}</span>
        </div>
      </div>

      {/* Card footer */}
      <div
        className="flex items-center justify-between gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-slate-50"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold flex-shrink-0"
            style={{ backgroundColor: '#eef2ff', color: '#4f73ff', border: '1px solid #c7d2fe' }}
          >
            {material.ciclo}
          </span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium truncate bg-gray-100 text-gray-600 border border-gray-200"
          >
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
