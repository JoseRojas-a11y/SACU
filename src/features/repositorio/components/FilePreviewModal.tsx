import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [iframeLoading, setIframeLoading] = useState(true)

  // Lock background page scrolling when modal is open and handle ESC key
  useEffect(() => {
    if (!file) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [file, onClose])

  if (!file) return null

  const formattedTitle = formatDisplayName(file.name)
  const isImage = isImageFile(file.name)
  const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`
  const driveUrl = `https://drive.google.com/file/d/${file.id}/view`
  const directImageUrl = `https://lh3.googleusercontent.com/d/${file.id}=s1600`

  return createPortal(
    <div
      className="preview-modal-overlay animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Box */}
      <div
        className="preview-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-white/10 bg-[#14011a]/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#cc6dfe]/20 text-[#cc6dfe] border border-[#cc6dfe]/30 text-base sm:text-lg flex items-center justify-center flex-shrink-0">
              {isImage ? '🖼️' : '📄'}
            </span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white truncate leading-snug" title={formattedTitle}>
                {formattedTitle}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#cbd5e1]/70 font-mono truncate">
                {file.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8300ca] hover:bg-[#6e00aa] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Descargar archivo directamente"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Descargar</span>
            </a>

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
              title="Cerrar vista previa"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Viewport Body */}
        <div className="flex-1 bg-[#0b010e] relative overflow-hidden flex items-center justify-center p-1 sm:p-2">
          {isImage && !imageError ? (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
              <img
                src={directImageUrl}
                alt={formattedTitle}
                onError={() => setImageError(true)}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-full h-full relative">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b010e] text-white z-10">
                  <div className="w-9 h-9 border-3 border-[#cc6dfe] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-semibold text-[#cbd5e1]">
                    Cargando vista previa del archivo...
                  </p>
                </div>
              )}
              <iframe
                src={previewUrl}
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-none rounded-b-xl"
                title={`Vista previa de ${formattedTitle}`}
                allow="autoplay"
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
