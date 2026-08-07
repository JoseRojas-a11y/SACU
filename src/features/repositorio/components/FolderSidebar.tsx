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
}

function FolderTreeNode({ folder, selectedFolder, onSelectFolder, level = 0 }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  if (!folder) return null

  const isSelected = selectedFolder?.id === folder.id
  const children = Array.isArray(folder.children) ? folder.children : []

  const subfolders = children.filter(
    (child): child is DriveFolderNode => Boolean(child && child.type === 'folder')
  )
  const fileCount = children.filter((child) => Boolean(child && child.type === 'file')).length

  const displayName = formatDisplayName(folder.name || '')

  return (
    <div className="select-none">
      <div
        onClick={() => onSelectFolder(folder)}
        className={`tree-node-item group ${
          isSelected ? 'tree-node-item-selected' : 'tree-node-item-idle'
        }`}
        style={{ paddingLeft: `${Math.max(12, level * 14)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {subfolders.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className={`p-0.5 rounded transition-transform hover:bg-black/5 cursor-pointer ${
                isOpen ? 'rotate-90' : ''
              }`}
            >
              <svg className="w-3 h-3 text-[#8300ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Folder Icon */}
          <svg
            className={`w-4 h-4 flex-shrink-0 transition-colors ${
              isSelected ? 'text-[#8300ca]' : 'text-[#8300ca]/70 group-hover:text-[#8300ca]'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.5V6a3 3 0 0 1 3-3h5.379a3 3 0 0 1 2.121.879l1.243 1.242a1.5 1.5 0 0 0 1.06.44H19.5a3 3 0 0 1 3 3v2.04a4.5 4.5 0 0 0-3-.54H4.5a4.5 4.5 0 0 0-3 .54Z" />
          </svg>

          <span className="truncate" title={displayName}>
            {displayName}
          </span>
        </div>

        {fileCount > 0 && (
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono font-semibold flex-shrink-0 ${
              isSelected ? 'bg-white/80 text-[#8300ca]' : 'bg-[#e2e8f0]/80 text-[#4f4255]'
            }`}
          >
            {fileCount}
          </span>
        )}
      </div>

      {/* Render Subfolders */}
      {isOpen && subfolders.length > 0 && (
        <div className="mt-0.5">
          {subfolders.map((sub) => (
            <FolderTreeNode
              key={sub.id}
              folder={sub}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              level={level + 1}
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

      <nav className={`space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 ${isMobileOpen ? 'block' : 'hidden lg:block'}`}>
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
