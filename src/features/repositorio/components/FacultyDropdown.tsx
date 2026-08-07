import { useState, useRef, useEffect } from 'react'
import { Faculty } from '../../../core/types'

interface Props {
  faculties: Faculty[]
  value: string
  onChange: (id: string) => void
}

export function FacultyDropdown({ faculties, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = faculties.find(f => f.id === value) || faculties.find(f => f.id === 'sistemas') || faculties[0]

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer"
        style={{
          backgroundColor: open || value ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
          color: 'white',
        }}
      >
        <svg className="w-4 h-4 opacity-60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
        <span className="max-w-[160px] truncate">{selected ? selected.name : 'Facultad'}</span>
        <svg
          className={`w-3 h-3 opacity-50 transition-transform duration-150 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 bg-white rounded-xl z-50 py-1.5 overflow-hidden shadow-2xl animate-fade-in"
          style={{
            width: '272px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
          }}
        >
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Seleccionar facultad
          </p>

          {faculties.map(f => (
            <button
              key={f.id}
              onClick={() => { onChange(f.id); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 transition-colors hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: value === f.id ? '#4f73ff' : '#111827' }}
                >
                  {f.name}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{f.courses.length} cursos disponibles</p>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                style={{
                  backgroundColor: value === f.id ? '#eef2ff' : '#f3f4f6',
                  color: value === f.id ? '#4f73ff' : '#6b7280',
                }}
              >
                {f.abbr}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
