import React, { useEffect, useState } from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import '../styles/UndoSnackbar.css'
import { Undo2, Clock, CheckCircle2 } from 'lucide-react'

export const UndoSnackbar: React.FC = () => {
  const pendingReviews = useProfesorStore((state) => state.pendingReviews)
  const cancelPendingReview = useProfesorStore((state) => state.cancelPendingReview)
  const [, setTick] = useState(0)

  // Re-render tick every 200ms to update remaining seconds
  useEffect(() => {
    if (pendingReviews.length === 0) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 200)
    return () => clearInterval(interval)
  }, [pendingReviews.length])

  if (pendingReviews.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-lg w-[92vw] sm:w-auto animate-fade-in pointer-events-auto">
      {pendingReviews.map((pending) => {
        const remainingMs = Math.max(0, pending.expiresAt - Date.now())
        const remainingSec = Math.ceil(remainingMs / 1000)
        const percent = (remainingMs / 15000) * 100

        return (
          <div
            key={pending.id}
            className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-purple-500/30 flex flex-col gap-2.5 overflow-hidden relative"
          >
            {/* Top countdown progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
              <div
                style={{ width: `${percent}%` }}
                className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-primary)] transition-all duration-200"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-[var(--theme-accent)] flex items-center justify-center flex-shrink-0 font-bold">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      Publicando reseña en {remainingSec}s
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">
                    {pending.professorCourseName}
                  </p>
                </div>
              </div>

              {/* Cancel / Undo Action */}
              <button
                type="button"
                onClick={() => cancelPendingReview(pending.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
