import { useState } from 'react'
import { Faculty, Material } from '../../../core/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  faculties: Faculty[]
  onSubmit: (newMat: Omit<Material, 'id'>) => Promise<void>
}

const CICLOS = ['26-1', '25-2', '25-1', '24-2', '24-1', '23-2']
const TIPOS = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6', 'EP', 'EF', 'ES', 'PD', 'Laboratorio', 'Monografía']

export function UploadMaterialModal({
  isOpen,
  onClose,
  faculties,
  onSubmit,
}: Props) {
  const [facultyId, setFacultyId] = useState(faculties[0]?.id || 'sistemas')
  const [course, setCourse] = useState('')
  const [customCourse, setCustomCourse] = useState('')
  const [tipo, setTipo] = useState('PC1')
  const [ciclo, setCiclo] = useState('26-1')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [fileName, setFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const selectedFacultyObj = faculties.find(f => f.id === facultyId)
  const availableCourses = selectedFacultyObj?.courses || []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalCourse = course === 'other' ? customCourse : course
    if (!finalCourse || !title || !author) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        faculty: facultyId,
        course: finalCourse,
        tipo,
        ciclo,
        title,
        author,
        file_url: fileName ? `/uploads/${fileName}` : '/downloads/sample.pdf'
      })
      // Reset form
      setTitle('')
      setAuthor('')
      setFileName('')
      setCourse('')
      setCustomCourse('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
        {/* Header con colores del tema dinámico */}
        <div className="px-6 py-4 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-hover)] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-base shadow-inner border border-white/20">
              📤
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight">Subir nueva plancha</h2>
              <p className="text-xs text-white/80">Aporta al repositorio académico comunitario de SACU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Formulario que respeta las variables del tema de la página */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
          {/* Facultad */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Facultad</label>
            <select
              value={facultyId}
              onChange={(e) => {
                setFacultyId(e.target.value)
                setCourse('')
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden transition-all"
            >
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.abbr})</option>
              ))}
            </select>
          </div>

          {/* Curso */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Curso</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden transition-all"
              required
            >
              <option value="">Selecciona un curso...</option>
              {availableCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="other">Otro curso...</option>
            </select>
          </div>

          {course === 'other' && (
            <div>
              <label className="block text-slate-800 font-bold mb-1">Nombre del curso personalizado</label>
              <input
                type="text"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Ej. Redes de Computadores II"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden transition-all"
                required
              />
            </div>
          )}

          {/* Tipo & Ciclo row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">Tipo de Evaluación</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden font-mono font-semibold transition-all"
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">Ciclo Académico</label>
              <select
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden font-mono font-semibold transition-all"
              >
                {CICLOS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Título o descripción del examen</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Examen Parcial — Algoritmos y Árboles B+"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden transition-all"
              required
            />
          </div>

          {/* Autor */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Nombre del estudiante / docente</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] focus:outline-hidden transition-all"
              required
            />
          </div>

          {/* Zona de Carga de Archivos alineada con el tema */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">Archivo de la plancha (PDF / Img)</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[var(--theme-primary)] rounded-xl p-4 text-center bg-slate-50 hover:bg-purple-50/30 transition-all group">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFileName(e.target.files[0].name)
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                <svg className="w-8 h-8 text-[var(--theme-primary)] transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
                <span className="font-semibold text-[var(--theme-primary)]">
                  {fileName ? fileName : 'Haz clic para seleccionar tu archivo (PDF)'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">PDF, PNG o JPG (máx. 15MB)</span>
              </label>
            </div>
          </div>

          {/* Botones del pie con tema dinámico */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white font-bold transition-all shadow-md shadow-[var(--theme-primary)]/20 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Plancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
