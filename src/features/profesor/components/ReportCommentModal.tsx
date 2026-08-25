import React, { useState } from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import { useProfessorReviews } from '../hooks/useProfessorReviews'
import { Flag, X, CheckCircle2 } from 'lucide-react'

export const ReportCommentModal: React.FC = () => {
  const reportingReviewId = useProfesorStore((state) => state.reportingReviewId)
  const setReportingReviewId = useProfesorStore((state) => state.setReportingReviewId)
  const selectedTuple = useProfesorStore((state) => state.selectedTuple)
  const { reportReview, isReporting } = useProfessorReviews(selectedTuple?.id)

  const [reason, setReason] = useState<string>('Lenguaje ofensivo o inapropiado')
  const [customReason, setCustomReason] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  if (!reportingReviewId) return null

  const handleClose = () => {
    setReportingReviewId(null)
    setReason('Lenguaje ofensivo o inapropiado')
    setCustomReason('')
    setSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalReason = reason === 'Otro' ? customReason.trim() : reason
    if (!finalReason) return

    reportReview(
      {
        reviewId: reportingReviewId,
        reason: finalReason,
        extraContext: {
          professorName: selectedTuple?.professorName,
          courseName: selectedTuple?.courseName,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          setTimeout(() => {
            handleClose()
          }, 2000)
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reporte Registrado</h3>
            <p className="text-xs text-slate-500">
              El reporte se ha guardado en Supabase y se ha notificado a los administradores vía correo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reportar Comentario</h3>
                <p className="text-xs text-slate-500">
                  Ayúdanos a mantener la comunidad universitaria respetuosa.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Motivo del reporte:
              </label>
              {[
                'Lenguaje ofensivo o inapropiado',
                'Información falsa o difamatoria',
                'Spam o contenido no relacionado',
                'Otro',
              ].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt}
                    checked={reason === opt}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                  />
                  <span>{opt}</span>
                </label>
              ))}

              {reason === 'Otro' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe brevemente la razón del reporte..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] resize-none"
                  required
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isReporting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isReporting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
