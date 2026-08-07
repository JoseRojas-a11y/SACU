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
  const isSelected = selectedFolder?.id === folder.id

  const subfolders = folder.children.filter(
    (child): child is DriveFolderNode => child.type === 'folder'
  )
  const fileCount = folder.children.filter((child) => child.type === 'file').length

  const displayName = formatDisplayName(folder.name)

  return (
    <div className="select-none">
      <div
        onClick={() => onSelectFolder(folder)}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-semibold group ${
          isSelected
            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
            : 'text-slate-700 hover:bg-indigo-50/80 hover:text-indigo-600'
        }`}
        style={{ paddingLeft: `${Math.max(12, level * 16)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {subfolders.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
              className={`p-0.5 rounded-md transition-transform hover:bg-black/10 cursor-pointer ${
                isOpen ? 'rotate-90' : ''
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Folder Icon */}
          <svg
            className={`w-4 h-4 flex-shrink-0 transition-colors ${
              isSelected ? 'text-white' : 'text-amber-500 group-hover:text-indigo-600'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15zM1.5 10.125V6a3 3 0 0 1 3-3h5.25a3 3 0 0 1 2.25.975l1.83 2.15H19.5a3 3 0 0 1 3 3v1H1.5z" />
          </svg>

          <span className="truncate" title={displayName}>
            {displayName}
          </span>
        </div>

        {fileCount > 0 && (
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-medium flex-shrink-0 ${
              isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {fileCount}
          </span>
        )}
      </div>

      {/* Render nested subfolders */}
      {isOpen && subfolders.length > 0 && (
        <div className="mt-0.5 space-y-0.5 border-l border-slate-200/60 ml-4 pl-1">
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
  return (
    <aside className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 px-1">
        <span className="text-xl">📁</span>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Estructura del Curso
          </h3>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {formatDisplayName(rootFolder.name)}
          </p>
        </div>
      </div>

      <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
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
