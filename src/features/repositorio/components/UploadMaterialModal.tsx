import { useState } from 'react'
import { Faculty, Material } from '../../../core/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  faculties: Faculty[]
  onSubmit: (newMat: Omit<Material, 'id'>) => Promise<void>
}

const CICLOS = ['25-1', '24-2', '24-1', '23-2', '23-1']
const TIPOS = ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES', 'Labo', 'Mono']

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
  const [ciclo, setCiclo] = useState('25-1')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f1b3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
              📤
            </div>
            <div>
              <h2 className="font-bold text-base">Subir nueva plancha</h2>
              <p className="text-xs text-gray-300">Aporta a la comunidad académica de SACU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
          {/* Faculty select */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Facultad</label>
            <select
              value={facultyId}
              onChange={(e) => {
                setFacultyId(e.target.value)
                setCourse('')
              }}
              className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.abbr})</option>
              ))}
            </select>
          </div>

          {/* Course select */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Curso</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              <label className="block text-gray-700 font-bold mb-1">Nombre del curso</label>
              <input
                type="text"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Ej. Redes de Computadores II"
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Tipo & Ciclo row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Tipo de Evaluación</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-semibold"
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">Ciclo Académico</label>
              <select
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-semibold"
              >
                {CICLOS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Título o descripción del examen</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Examen Parcial — Algoritmos y Árboles B+"
              className="w-full h-10 px-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Nombre del estudiante / docente</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full h-10 px-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* File Upload simulator */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Archivo de la plancha (PDF / Img)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:bg-indigo-50/50 transition-colors">
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
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1">
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
                <span className="font-semibold text-indigo-600">
                  {fileName ? fileName : 'Haz clic para seleccionar tu archivo (PDF)'}
                </span>
                <span className="text-[10px] text-gray-400">PDF, PNG o JPG (máx. 15MB)</span>
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Plancha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
