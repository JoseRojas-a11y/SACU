import { useState } from 'react'
import { DriveFolderNode, formatDisplayName } from '../services/courseDriveService'

interface FolderSidebarProps {
  rootFolder: DriveFolderNode
  selectedFolder: DriveFolderNode | null
  onSelectFolder: (folder: DriveFolderNode) => void
}

interface TreeNodeProps {
  folder: DriveFolderNode
  selectedFolder: DriveFolderNode | null
  onSelectFolder: (folder: DriveFolderNode) => void
  level?: number
  isFirstChild?: boolean
}

function countFolderTotalFiles(folder: DriveFolderNode): number {
  if (typeof folder.total_files === 'number') {
    return folder.total_files
  }
  let count = 0
  const children = Array.isArray(folder.children) ? folder.children : []
  for (const child of children) {
    if (!child) continue
    if (child.type === 'file') {
      count += 1
    } else if (child.type === 'folder') {
      count += countFolderTotalFiles(child)
    }
  }
  return count
}

function FolderTreeNode({
  folder,
  selectedFolder,
  onSelectFolder,
  level = 0,
  isFirstChild = false
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  if (!folder) return null

  const isSelected = selectedFolder?.id === folder.id
  const children = Array.isArray(folder.children) ? folder.children : []

  const subfolders = children.filter(
    (child): child is DriveFolderNode => Boolean(child && child.type === 'folder')
  )
  const totalFiles = countFolderTotalFiles(folder)

  const displayName = formatDisplayName(folder.name || '')

  // Sombra e intensidad de oscurecimiento según la profundidad de la jerarquía (level)
  const shadowAlpha = Math.min(level * 0.04, 0.35)
  const darkAlpha = Math.min(level * 0.02, 0.2)
  const brightness = Math.max(100 - level * 2.25, 80)
  const indentPx = `${Math.max(12, level * 14)}px`

  const isNestedNode = !isSelected && level > 0

  return (
    <div className="select-none [direction:ltr]">
      <div
        onClick={() => onSelectFolder(folder)}
        className={`tree-node-item group ${isSelected ? 'tree-node-item-selected' : 'tree-node-item-idle'} ${
          isNestedNode ? 'tree-node-nested' : ''
        } ${isNestedNode && isFirstChild ? 'tree-node-first-child' : ''}`}
        style={{
          '--tree-indent': indentPx,
          '--tree-dark-alpha': darkAlpha,
          '--tree-brightness': `${brightness}%`,
          '--tree-shadow-alpha': shadowAlpha,
        } as React.CSSProperties}
      >
        <div className="flex items-center min-w-0">
          {subfolders.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className={`p-0.5 rounded transition-transform hover:bg-black/5 cursor-pointer ${isOpen ? 'rotate-90' : ''
                }`}
            >
              <svg className="w-3 h-3 text-[#8300ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Folder Icon (Abierta si isSelected, Cerrada si no) */}
          {isSelected ? (
            <svg
              className="w-4 h-4 flex-shrink-0 text-[#8300ca] transition-all duration-200"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-1.5V9a3 3 0 0 0-3-3h-5.379a3 3 0 0 1-2.121-.879l-1.243-1.242A1.5 1.5 0 0 0 6.197 3.5H4.5A3 3 0 0 0 1.5 6.5v11.25a3.75 3.75 0 0 0 .195 1.2A3 3 0 0 0 4.5 21h15Z" />
              <path fillRule="evenodd" d="M1.5 18a3 3 0 0 0 3 3h15a3 3 0 0 0 2.87-2.126l1.83-6.102A1.5 1.5 0 0 0 22.76 11H7.135a3 3 0 0 0-2.87 2.126L1.5 18Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 flex-shrink-0 text-[#8300ca]/70 group-hover:text-[#8300ca] transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
            </svg>
          )}

          <span className="truncate" title={displayName}>
            {displayName}
          </span>
        </div>

        {totalFiles > 0 && (
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono font-semibold flex-shrink-0 ${isSelected ? 'bg-white/80 text-[#8300ca]' : 'bg-[#e2e8f0]/80 text-[#4f4255]'
              }`}
            title={`${totalFiles} archivos en esta carpeta`}
          >
            {totalFiles}
          </span>
        )}
      </div>

      {/* Render Subfolders */}
      {isOpen && subfolders.length > 0 && (
        <div>
          {subfolders.map((sub, index) => (
            <FolderTreeNode
              key={sub.id}
              folder={sub}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              level={level + 1}
              isFirstChild={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderSidebar({ rootFolder, selectedFolder, onSelectFolder }: FolderSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <aside className="sidebar-tree-card">
      <div className="sidebar-tree-header">
        <h3 className="sidebar-tree-title">
          Estructura del Curso
        </h3>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden text-xs font-semibold text-[var(--theme-primary)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{isMobileOpen ? 'Ocultar carpetas' : 'Ver carpetas'}</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      <nav className={`space-y-1 overflow-y-auto [direction:rtl] max-h-[calc(120vh-280px)] pl-1 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
        <FolderTreeNode
          folder={rootFolder}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
          level={0}
        />
      </nav>
    </aside>
  )
}
