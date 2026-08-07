import { useState } from 'react'
import { DriveFolderNode, DriveFileNode, formatDisplayName } from '../services/courseDriveService'
import { FilePreviewModal } from './FilePreviewModal'

interface FileGridProps {
  folder: DriveFolderNode | null
  courseName: string
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') {
    return { icon: '📄', color: 'bg-red-50 text-red-600 border-red-200', tag: 'PDF' }
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return { icon: '🖼️', color: 'bg-purple-50 text-purple-600 border-purple-200', tag: ext.toUpperCase() }
  }
  if (['doc', 'docx'].includes(ext)) {
    return { icon: '📝', color: 'bg-blue-50 text-blue-600 border-blue-200', tag: 'DOC' }
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { icon: '📊', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', tag: 'XLS' }
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { icon: '📙', color: 'bg-orange-50 text-orange-600 border-orange-200', tag: 'PPT' }
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: '📦', color: 'bg-amber-50 text-amber-600 border-amber-200', tag: 'ZIP' }
  }
  if (['mp4', 'avi', 'mkv', 'mov', 'webm'].includes(ext)) {
    return { icon: '🎬', color: 'bg-rose-50 text-rose-600 border-rose-200', tag: 'VIDEO' }
  }
  return { icon: '📑', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', tag: ext.toUpperCase() || 'FILE' }
}

interface FileCardItemProps {
  file: DriveFileNode
  onPreview: (file: DriveFileNode) => void
}

function FileCardItem({ file, onPreview }: FileCardItemProps) {
  const [thumbIndex, setThumbIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const formattedTitle = formatDisplayName(file.name)
  const style = getFileIcon(file.name)
  const driveUrl = `https://drive.google.com/file/d/${file.id}/view`

  // Multi-stage robust thumbnail fallback sources for Google Drive & Cloudflare
  const thumbnailSources = [
    ...(file.thumbnail_url ? [file.thumbnail_url] : []),
    `https://lh3.googleusercontent.com/d/${file.id}=w800`,
    `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
    `https://drive.google.com/uc?id=${file.id}`
  ]

  function handleImageError() {
    if (thumbIndex < thumbnailSources.length - 1) {
      setThumbIndex((prev) => prev + 1)
    } else {
      setImgError(true)
    }
  }

  const currentThumbUrl = thumbnailSources[thumbIndex]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group">
      {/* Top Image Preview (First Page / Image Thumbnail) */}
      <div
        onClick={() => onPreview(file)}
        className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
      >
        {!imgError ? (
          <img
            key={currentThumbUrl}
            src={currentThumbUrl}
            alt={formattedTitle}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${style.color}`}>
            <span className="text-4xl mb-1">{style.icon}</span>
            <span className="text-xs font-mono font-bold">{style.tag}</span>
          </div>
        )}

        {/* Floating Tag Badge */}
        <div className="absolute top-3 right-3 shadow-sm">
          <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border backdrop-blur-md ${style.color}`}>
            {style.tag}
          </span>
        </div>

        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 bg-indigo-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 text-indigo-950 text-xs font-extrabold shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Ver vista previa
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3
          onClick={() => onPreview(file)}
          className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer"
          title={formattedTitle}
        >
          {formattedTitle}
        </h3>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onPreview(file)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Ver páginas</span>
          </button>

          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Abrir en Google Drive"
          >
            <span>Drive</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export function FileGrid({ folder, courseName }: FileGridProps) {
  const [previewFile, setPreviewFile] = useState<DriveFileNode | null>(null)

  if (!folder) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
          📂
        </div>
        <h3 className="text-base font-bold text-slate-800">Selecciona una carpeta</h3>
        <p className="text-xs text-slate-500 mt-1">
          Elige una carpeta en el menú de la izquierda para desplegar sus archivos.
        </p>
      </div>
    )
  }

  const files = folder.children.filter((child): child is DriveFileNode => child.type === 'file')
  const folderDisplayName = formatDisplayName(folder.name)

  return (
    <div className="space-y-5">
      {/* Folder Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>{formatDisplayName(courseName)}</span>
            <span>/</span>
            <span className="text-slate-400 font-normal">Carpeta activa</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📁</span> {folderDisplayName}
          </h2>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-mono text-xs font-bold rounded-full border border-indigo-100">
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            📭
          </div>
          <h4 className="text-sm font-bold text-slate-700">Esta carpeta no contiene archivos</h4>
          <p className="text-xs text-slate-400 mt-1">
            Explora las subcarpetas en el menú lateral.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {files.map((file) => (
            <FileCardItem
              key={file.id}
              file={file}
              onPreview={(f) => setPreviewFile(f)}
            />
          ))}
        </div>
      )}

      {/* Interactive Modal Previewer */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  )
}


