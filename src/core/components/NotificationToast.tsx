import { useEffect } from 'react'
import { useUIStore } from '../store/useUIStore'

export function NotificationToast() {
  const toastMessage = useUIStore((state) => state.toastMessage)
  const toastType = useUIStore((state) => state.toastType)
  const setToast = useUIStore((state) => state.setToast)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toastMessage, setToast])

  if (!toastMessage) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in shadow-2xl rounded-2xl overflow-hidden border border-white/20 bg-slate-900 text-white p-4 max-w-md flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          toastType === 'success'
            ? 'bg-emerald-500 text-white'
            : toastType === 'error'
            ? 'bg-rose-500 text-white'
            : 'bg-indigo-500 text-white'
        }`}
      >
        {toastType === 'success' ? '✓' : toastType === 'error' ? '✕' : 'ℹ'}
      </div>
      <div className="flex-1 text-xs font-medium leading-snug">{toastMessage}</div>
      <button
        onClick={() => setToast(null)}
        className="text-gray-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
