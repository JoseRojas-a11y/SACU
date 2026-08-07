import { useState, useMemo } from 'react'
import { Material, Faculty } from '../../../core/types'

interface Props {
  course: string
  allMaterials: Material[]
  faculties: Faculty[]
  onBack: () => void
  onDownload: (m: Material) => void
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

function TipoCategoryCard({
  tipo,
  materials,
  onDownload,
}: {
  tipo: string
  materials: Material[]
  onDownload: (m: Material) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const s = TIPO_STYLE[tipo] ?? { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
  const preview = expanded ? materials : materials.slice(0, 3)

  return (
    <div
      className="bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-200 border"
      style={{ borderColor: s.border, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ backgroundColor: s.bg, borderBottom: `1px solid ${s.border}` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold font-mono" style={{ color: s.color }}>
            {tipo}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: s.color, opacity: 0.8 }}>
              {tipo.startsWith('PC') ? 'Práctica Calificada' :
               tipo === 'EP' ? 'Examen Parcial' :
               tipo === 'EF' ? 'Examen Final' :
               tipo === 'ES' ? 'Sustitutorio' :
               tipo === 'Labo' ? 'Laboratorio' :
               tipo === 'Mono' ? 'Monografía' : tipo}
            </p>
            <p className="text-xs font-mono font-medium mt-0.5" style={{ color: s.color }}>
              {materials.length} {materials.length === 1 ? 'plancha' : 'planchas'}
            </p>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-white/70"
        >
          {TIPO_ICON[tipo] ?? '📄'}
        </div>
      </div>

      {/* List of materials */}
      <ul className="flex-1 divide-y divide-gray-100">
        {preview.map(m => {
          const initials = m.author.split(' ').slice(0, 2).map(n => n[0]).join('')
          return (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{m.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{m.author}</p>
              </div>
              <span
                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                style={{ backgroundColor: '#f0f3fa', color: '#4f73ff', border: '1px solid #c7d2fe' }}
              >
                {m.ciclo}
              </span>
              <button
                onClick={() => onDownload(m)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100"
                style={{ backgroundColor: s.bg, color: s.color }}
                title="Descargar"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Show more toggle */}
      {materials.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors cursor-pointer border-t"
          style={{
            borderColor: s.border,
            backgroundColor: s.bg,
            color: s.color,
          }}
        >
          {expanded ? (
            <>Mostrar menos <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg></>
          ) : (
            <>Ver {materials.length - 3} más <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></>
          )}
        </button>
      )}
    </div>
  )
}

export function CourseDetailView({
  course,
  allMaterials,
  faculties,
  onBack,
  onDownload,
}: Props) {
  const materials = allMaterials.filter(m => m.course === course)

  const grouped = useMemo(() => {
    const map = new Map<string, Material[]>()
    for (const m of materials) {
      const arr = map.get(m.tipo) ?? []
      map.set(m.tipo, [...arr, m])
    }
    return map
  }, [materials])

  const faculty = faculties.find(f => materials.some(m => m.faculty === f.id))

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50">
      {/* Course Sub-Hero */}
      <section
        className="pt-20 pb-10 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(155deg, #080e22 0%, #0f1b3d 50%, #172651 100%)' }}
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 mb-4 text-gray-400 text-xs font-semibold hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Volver a la vista principal
          </button>

          {faculty && (
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
              {faculty.name} ({faculty.abbr})
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {course}
          </h1>

          <p className="mt-2 text-gray-300 text-sm font-medium">
            {materials.length} planchas publicadas · {grouped.size} tipos de evaluación disponibles
          </p>

          {/* Quick jump pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[...grouped.keys()].map(tipo => {
              const s = TIPO_STYLE[tipo] ?? { color: '#818cf8' }
              return (
                <span
                  key={tipo}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/10 text-white/80 border border-white/15"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {tipo}
                  <span className="opacity-50">·</span>
                  <span className="opacity-70">{grouped.get(tipo)!.length}</span>
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="mb-6">
          <h2 className="font-bold text-xl text-gray-900">Categorías de Evaluación</h2>
          <p className="text-sm text-gray-500 mt-0.5">Exámenes y prácticas organizados por modalidad</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...grouped.entries()].map(([tipo, mats]) => (
            <TipoCategoryCard
              key={tipo}
              tipo={tipo}
              materials={mats}
              onDownload={onDownload}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
