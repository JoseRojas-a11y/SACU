import { useState, useMemo } from 'react'
import { DriveFolderNode, DriveFileNode, formatDisplayName } from '../services/courseDriveService'
import { FilePreviewModal } from './FilePreviewModal'

interface FileGridProps {
  folder: DriveFolderNode | null
  rootFolder?: DriveFolderNode | null
  courseName: string
  onSelectFolder?: (folder: DriveFolderNode) => void
}

function findFolderPath(root: DriveFolderNode | null, targetId: string): DriveFolderNode[] {
  if (!root) return []
  if (root.id === targetId) return [root]

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      if (child && child.type === 'folder') {
        const subPath = findFolderPath(child, targetId)
        if (subPath.length > 0) {
          return [root, ...subPath]
        }
      }
    }
  }

  return []
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

interface FolderCardItemProps {
  folder: DriveFolderNode
  onSelect: (folder: DriveFolderNode) => void
}

function FolderCardItem({ folder, onSelect }: FolderCardItemProps) {
  const displayName = formatDisplayName(folder.name)

  const fileCount = typeof folder.total_files === 'number'
    ? folder.total_files
    : Array.isArray(folder.children)
      ? folder.children.filter(c => c && c.type === 'file').length
      : 0

  const subfoldersCount = Array.isArray(folder.children)
    ? folder.children.filter(c => c && c.type === 'folder').length
    : 0

  return (
    <div
      onClick={() => onSelect(folder)}
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-[#8300ca] hover:bg-[#8300ca]/5 transition-all cursor-pointer group flex items-center justify-between gap-3 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#8300ca]/10 text-[#8300ca] border border-[#8300ca]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#8300ca] group-hover:text-white transition-all shadow-inner">
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#8300ca] transition-colors truncate">
            {displayName}
          </h4>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{fileCount} {fileCount === 1 ? 'archivo' : 'archivos'}</span>
            {subfoldersCount > 0 && (
              <>
                <span className="opacity-40">•</span>
                <span>{subfoldersCount} {subfoldersCount === 1 ? 'subcarpeta' : 'subcarpetas'}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#8300ca] text-slate-400 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-2xs">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  )
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

  const thumbnailSources = [
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
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#d2c1d8] transition-all flex flex-col justify-between overflow-hidden group">
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
        <div className="absolute top-3 right-3 shadow-xs">
          <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border backdrop-blur-md ${style.color}`}>
            {style.tag}
          </span>
        </div>

        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 bg-[#1e1b4b]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 text-[#191c1e] text-xs font-extrabold shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
            <svg className="w-4 h-4 text-[#8300ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
          className="text-xs font-bold text-[#191c1e] line-clamp-2 leading-snug group-hover:text-[#8300ca] transition-colors cursor-pointer"
          title={formattedTitle}
        >
          {formattedTitle}
        </h3>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
          <button
            onClick={() => onPreview(file)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#e2e8f0] text-slate-700 hover:text-[#8300ca] text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Ver páginas</span>
          </button>

          <a
            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8300ca] hover:bg-[#6e00aa] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Descargar archivo directamente"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Descargar</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export function FileGrid({ folder, rootFolder, courseName, onSelectFolder }: FileGridProps) {
  const [previewFile, setPreviewFile] = useState<DriveFileNode | null>(null)

  const folderPath = useMemo(() => {
    if (!rootFolder || !folder) return []
    return findFolderPath(rootFolder, folder.id)
  }, [rootFolder, folder])

  if (!folder) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#e2e8f0] shadow-xs">
        <div className="w-14 h-14 bg-[#8300ca]/10 text-[#8300ca] border border-[#8300ca]/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800">Selecciona una carpeta</h3>
        <p className="text-xs text-slate-500 mt-1">
          Elige una carpeta en el menú de la izquierda para desplegar sus archivos.
        </p>
      </div>
    )
  }

  const children = Array.isArray(folder?.children) ? folder.children : []
  const subfolders = children.filter((child): child is DriveFolderNode => Boolean(child && child.type === 'folder'))
  const files = children.filter((child): child is DriveFileNode => Boolean(child && child.type === 'file'))
  const folderDisplayName = formatDisplayName(folder?.name || '')

  return (
    <div className="space-y-6">
      {/* Folder Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-medium text-slate-500 mb-1">
            {folderPath.length > 0 ? (
              folderPath.map((node, index) => {
                const isLast = index === folderPath.length - 1
                const formatted = formatDisplayName(node.name)
                return (
                  <div key={node.id} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-slate-300">/</span>}
                    {onSelectFolder && !isLast ? (
                      <button
                        onClick={() => onSelectFolder(node)}
                        className="hover:text-[#8300ca] hover:underline cursor-pointer transition-colors"
                      >
                        {formatted}
                      </button>
                    ) : (
                      <span className={isLast ? 'text-[#8300ca] font-semibold' : 'text-slate-600'}>
                        {formatted}
                      </span>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="flex items-center gap-1.5">
                <span>{formatDisplayName(courseName)}</span>
                <span>/</span>
                <span className="text-[#8300ca] font-semibold">{folderDisplayName}</span>
              </div>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-[#191c1e] flex items-center gap-2">
            {folderDisplayName}
          </h2>
        </div>

        {/* Resumen de elementos en la carpeta */}
        <div className="flex items-center gap-2">
          {subfolders.length > 0 && (
            <span className="px-3 py-1 bg-purple-50 text-[var(--theme-primary)] font-mono text-xs font-bold rounded-full border border-purple-200 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
              </svg>
              <span>{subfolders.length} {subfolders.length === 1 ? 'carpeta' : 'carpetas'}</span>
            </span>
          )}
          <span className="px-3 py-1 bg-[#f2f4f6] text-[#5c647a] font-mono text-xs font-bold rounded-full border border-[#e2e8f0]">
            📄 {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>
      </div>

      {/* Subcarpetas dentro del Grid */}
      {subfolders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
              </svg>
              <span>Carpetas en este nivel ({subfolders.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {subfolders.map((sub) => (
              <FolderCardItem
                key={sub.id}
                folder={sub}
                onSelect={(f) => onSelectFolder?.(f)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archivos en el Grid */}
      {files.length > 0 && (
        <div className="space-y-3">
          {subfolders.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>📄</span>
                <span>Archivos ({files.length})</span>
              </h3>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {files.map((file) => (
              <FileCardItem
                key={file.id}
                file={file}
                onPreview={(f) => setPreviewFile(f)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado Vacío cuando no hay subcarpetas ni archivos */}
      {subfolders.length === 0 && files.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e2e8f0] shadow-xs">
          <div className="w-12 h-12 bg-[#f2f4f6] text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            📭
          </div>
          <h4 className="text-sm font-bold text-slate-700">Esta carpeta no contiene carpetas ni archivos</h4>
          <p className="text-xs text-slate-400 mt-1">
            Usa el menú lateral o el navegador superior para dirigirte a otras carpetas.
          </p>
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
