import { useState } from 'react'
import { DriveFileNode, formatDisplayName } from '../services/courseDriveService'

interface FilePreviewModalProps {
  file: DriveFileNode | null
  onClose: () => void
}

function isImageFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false)
  if (!file) return null

  const formattedTitle = formatDisplayName(file.name)
  const isImage = isImageFile(file.name)
  const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`
  const driveUrl = `https://drive.google.com/file/d/${file.id}/view`
  const directImageUrl = `https://lh3.googleusercontent.com/d/${file.id}=s1600`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-lg flex-shrink-0">
              {isImage ? '🖼️' : '📄'}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate" title={formattedTitle}>
                {formattedTitle}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Google Drive ID: {file.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Abrir en Drive</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar vista previa"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-2">
          {isImage && !imageError ? (
            <img
              src={directImageUrl}
              alt={formattedTitle}
              onError={() => setImageError(true)}
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
            />
          ) : (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none rounded-b-2xl"
              title={`Vista previa de ${formattedTitle}`}
              allow="autoplay"
            />
          )}
        </div>
      </div>
    </div>
  )
}

