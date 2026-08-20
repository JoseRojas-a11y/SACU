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
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer border ${open
          ? 'bg-white/20 border-white/30 text-white shadow-xs'
          : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100 hover:text-white'
          }`}
      >
        <svg className="w-4 h-4 opacity-80 flex-shrink-0 text-[var(--theme-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
        <span className="max-w-[150px] truncate">{selected ? selected.name : 'Facultad'}</span>
        <svg
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180 text-[var(--theme-accent)]' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="faculty-dropdown-panel animate-fade-in">
          <p className="faculty-dropdown-header">
            Seleccionar Facultad
          </p>

          <div className="space-y-0.5 max-h-64 overflow-y-auto px-1">
            {faculties.map((f) => {
              const isSelected = value === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onChange(f.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected
                    ? 'bg-purple-50/80 text-[var(--theme-primary)] font-bold'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-main)]'}`}>
                      {f.name}
                    </p>
                  </div>
                  <span className={isSelected ? 'faculty-dropdown-badge-selected' : 'faculty-dropdown-badge-idle'}>
                    {f.abbr}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
