import React, { useState } from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import { useProfessorReviews } from '../hooks/useProfessorReviews'
import '../styles/ProfessorReviewsModal.css'
import { Star, X, Flag, Send, ShieldCheck, UserCheck, MessageSquare, AlertCircle } from 'lucide-react'

export const ProfessorReviewsModal: React.FC = () => {
  const selectedTuple = useProfesorStore((state) => state.selectedTuple)
  const isReviewsModalOpen = useProfesorStore((state) => state.isReviewsModalOpen)
  const setReviewsModalOpen = useProfesorStore((state) => state.setReviewsModalOpen)
  const setReportingReviewId = useProfesorStore((state) => state.setReportingReviewId)

  const { reviews, isLoading, scheduleReviewSubmission } = useProfessorReviews(selectedTuple?.id)

  // Form State
  const [formTeaching, setFormTeaching] = useState<number>(5)
  const [formEvaluation, setFormEvaluation] = useState<number>(5)
  const [formDedication, setFormDedication] = useState<number>(5)
  const [formComment, setFormComment] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [justScheduled, setJustScheduled] = useState<boolean>(false)

  if (!isReviewsModalOpen || !selectedTuple) return null

  const handleClose = () => {
    setReviewsModalOpen(false)
    setFormComment('')
    setFormError(null)
    setJustScheduled(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTuple?.id) {
      setFormError('No se encontró el identificador de la cátedra seleccionada. Por favor, selecciona nuevamente el docente.')
      return
    }
    if (!formComment.trim()) {
      setFormError('Por favor escribe un comentario o consejo sobre el docente.')
      return
    }
    if (formComment.trim().length < 10) {
      setFormError('El comentario debe tener al menos 10 caracteres para ser útil a otros estudiantes.')
      return
    }

    setFormError(null)

    // Programar con 15s de grace period (Undo)
    scheduleReviewSubmission(
      {
        professorCourseId: selectedTuple.id,
        authorTag: `Estudiante FIIS #${Math.floor(10 + Math.random() * 90)}`,
        scores: {
          ensenanza: formTeaching,
          evaluacion: formEvaluation,
          dedicacion: formDedication,
          dificultad: formEvaluation,
        },
        comment: formComment.trim(),
      },
      `${selectedTuple.professorName} (${selectedTuple.courseName})`
    )

    setFormComment('')
    setJustScheduled(true)
    setTimeout(() => {
      setJustScheduled(false)
    }, 4000)
  }

  // Helper para renderizar estrellas interactivas en el formulario
  const renderStarPicker = (
    label: string,
    currentValue: number,
    setter: (val: number) => void,
    colorClass: string
  ) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setter(star)}
            className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= currentValue
                  ? `${colorClass} fill-current`
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-mono font-bold text-slate-700 ml-1">
          {currentValue}.0
        </span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1b0222] via-[#2a0136] to-[#8300ca] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
                {selectedTuple.roleType}
              </span>
              <span className="text-xs text-purple-200">{selectedTuple.courseName}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {selectedTuple.professorName}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Aggregated Score Summary */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Enseñanza</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-[var(--theme-primary)]">
                ⭐ {(selectedTuple.scores.ensenanza || 4.0).toFixed(1)}
              </span>
            </div>
            <div className="border-x border-purple-200/60">
              <span className="text-[11px] font-semibold text-slate-500 block">Evaluación</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-amber-600">
                📊 {(selectedTuple.scores.evaluacion ?? selectedTuple.scores.dificultad ?? 4.0).toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Dedicación</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-600">
                ⏱️ {(selectedTuple.scores.dedicacion || 4.0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Just Scheduled Success Toast inside Modal */}
          {justScheduled && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                ¡Reseña programada! Tienes 15 segundos en la barra inferior para cancelar o deshacer el envío.
              </span>
            </div>
          )}

          {/* Form to Submit Anonymous Review */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[var(--theme-primary)]" />
                Dejar una valoración anónima
              </h4>
              <span className="text-[10px] font-mono text-slate-400">100% Anónimo</span>
            </div>

            {/* Star Pickers */}
            <div className="space-y-2">
              {renderStarPicker('Enseñanza (Didáctica y claridad)', formTeaching, setFormTeaching, 'text-[var(--theme-primary)]')}
              {renderStarPicker('Evaluación (Justicia y accesibilidad)', formEvaluation, setFormEvaluation, 'text-amber-500')}
              {renderStarPicker('Dedicación (Puntualidad y apoyo continuo)', formDedication, setFormDedication, 'text-emerald-500')}
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tu recomendación o consejo para otros alumnos:
              </label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Ej: Para sus exámenes de teoría practica mucho con ejercicios tipo; en las prácticas es muy puntual y valora el código limpio..."
                rows={3}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-none"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Grace period de 15s para deshacer tras enviar.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary-dark)] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar reseña</span>
              </button>
            </div>
          </form>

          {/* Community Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                Comentarios de la Comunidad ({reviews.length})
              </h4>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Cargando valoraciones...</div>
            ) : reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-500">
                Aún no hay comentarios para esta cátedra. ¡Sé el primero en dejar una reseña anónima!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-[var(--theme-primary)] font-bold text-xs flex items-center justify-center">
                          {rev.authorTag.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {rev.authorTag}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Flag Button */}
                      <button
                        type="button"
                        onClick={() => setReportingReviewId(rev.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Reportar comentario inapropiado"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scores Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[var(--theme-primary)] font-bold border border-purple-100">
                        Ens: {rev.scores.ensenanza}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-100">
                        Eval: {rev.scores.evaluacion ?? rev.scores.dificultad}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                        Ded: {rev.scores.dedicacion}
                      </span>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
