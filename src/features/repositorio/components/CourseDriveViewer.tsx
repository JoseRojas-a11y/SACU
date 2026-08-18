import { useState, useEffect } from 'react'
import {
  DriveCourseData,
  DriveFolderNode,
  DriveFileNode,
  fetchCourseDriveData,
  formatDisplayName
} from '../services/courseDriveService'
import { FolderSidebar } from './FolderSidebar'
import { FileGrid } from './FileGrid'
import { CourseSmartSearch } from './CourseSmartSearch'
import { FilePreviewModal } from './FilePreviewModal'
import Astronauta from '../../../core/public/astronauta.png'

interface CourseDriveViewerProps {
  courseId: string
  driveFolderId?: string
  onBack: () => void
}

type CourseViewMode = 'explorer' | 'search'

function countTreeFiles(node: any): number {
  if (!node) return 0
  if (node.type === 'file') return 1
  let sum = 0
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      sum += countTreeFiles(child)
    }
  }
  return sum
}

export function CourseDriveViewer({ courseId, onBack }: CourseDriveViewerProps) {
  const [data, setData] = useState<DriveCourseData | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<DriveFolderNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<CourseViewMode>('explorer')
  const [previewFile, setPreviewFile] = useState<DriveFileNode | null>(null)
  const [previewPage, setPreviewPage] = useState<number | undefined>(undefined)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    let isMounted = true
    setLoading(true)

    fetchCourseDriveData(courseId)
      .then((res) => {
        if (isMounted) {
          setData(res)
          if (res && res.tree) {
            setSelectedFolder(res.tree)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error al cargar datos del curso:', err)
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [courseId])

  const formattedCourseTitle = data ? formatDisplayName(data.course_name) : courseId
  const totalCourseFiles = data?.tree ? countTreeFiles(data.tree) : 0

  function handlePreviewFromSearch(file: DriveFileNode, pageNumber?: number) {
    setPreviewFile(file)
    setPreviewPage(pageNumber)
  }

  return (
    <div className="animate-fade-in min-h-screen bg-[var(--theme-bg-main)] text-[var(--theme-text-main)]">
      {/* Course Hero Banner Header (Integrates seamlessly with absolute floating Navbar) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b0222] via-[#3c0066] to-[#8300ca] text-white pt-20 sm:pt-24 pb-8 sm:pb-10 shadow-md">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#cc6dfe]/20 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Flying Astronaut (Fixed relative to section, centered vertically, responsive positioning, behind text z-10) */}
        <div className="absolute top-1/2 right-[5%] sm:right-[20%] md:right-[30%] z-0 pointer-events-none opacity-30 sm:opacity-85 w-32 sm:w-56 md:w-72 astronaut-rotated">
          <img src={Astronauta} alt="" className="w-full h-auto drop-shadow-[0_12px_24px_rgba(204,109,254,0.35)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Navigation & Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#cbd5e1] mb-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#cc6dfe] hover:text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border border-white/10"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span>Volver a Cursos</span>
            </button>
            <span className="opacity-40">/</span>
            <span className="text-white font-semibold truncate max-w-[260px] sm:max-w-md">{courseId}</span>
            <span>-</span>
            <span className="text-white font-semibold truncate max-w-[260px] sm:max-w-md">{formattedCourseTitle}</span>
          </div>

          {/* Title & Statistics */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {formattedCourseTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 self-start md:self-auto">
              <div className="text-right">
                <div className="text-[10px] font-mono text-[#cbd5e1] uppercase font-bold tracking-wider">
                  Archivos Disponibles
                </div>
                <div className="text-lg font-extrabold font-mono text-[#cc6dfe]">
                  {loading ? '...' : totalCourseFiles}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs (Explorador de Carpetas vs Buscador Inteligente) */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 backdrop-blur-[4px]">
            <button
              onClick={() => setViewMode('explorer')}
              className={`course-mode-tab ${viewMode === 'explorer' ? 'course-mode-tab-active' : 'course-mode-tab-idle'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
              <span>Explorador de Carpetas</span>
            </button>

            <button
              onClick={() => setViewMode('search')}
              className={`course-mode-tab ${viewMode === 'search' ? 'course-mode-tab-active' : 'course-mode-tab-idle'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span>Búsqueda Especializada</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[var(--theme-border)] shadow-xs">
            <div className="w-9 h-9 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              Cargando estructura del curso {courseId}...
            </p>
          </div>
        ) : !data || !data.tree ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--theme-border)] shadow-xs">
            <p className="text-xs font-semibold text-slate-600">
              No se pudo cargar la información para este curso.
            </p>
          </div>
        ) : viewMode === 'search' ? (
          /* Smart Search View */
          <CourseSmartSearch
            courseId={courseId}
            courseName={data.course_name}
            rootFolder={data.tree}
            onPreviewFile={handlePreviewFromSearch}
            onBackToExplorer={() => setViewMode('explorer')}
          />
        ) : (
          /* Classic Folder & File Explorer View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Left: Folder Tree (~25%) */}
            <div className="lg:col-span-1">
              <FolderSidebar
                rootFolder={data.tree}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
              />
            </div>

            {/* Main Content Right: File Grid (~75%) */}
            <div className="lg:col-span-3">
              <FileGrid
                folder={selectedFolder}
                rootFolder={data.tree}
                courseName={data.course_name}
                onSelectFolder={setSelectedFolder}
              />
            </div>
          </div>
        )}
      </main>

      {/* File Preview Modal for Search View Actions */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          pageNumber={previewPage}
          onClose={() => {
            setPreviewFile(null)
            setPreviewPage(undefined)
          }}
        />
      )}
    </div>
  )
}

