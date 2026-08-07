import { useState, useEffect } from 'react'
import {
  DriveCourseData,
  DriveFolderNode,
  fetchCourseDriveData,
  formatDisplayName
} from '../services/courseDriveService'
import { FolderSidebar } from './FolderSidebar'
import { FileGrid } from './FileGrid'

interface CourseDriveViewerProps {
  courseId: string
  driveFolderId?: string
  onBack: () => void
}

export function CourseDriveViewer({ courseId, onBack }: CourseDriveViewerProps) {
  const [data, setData] = useState<DriveCourseData | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<DriveFolderNode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchCourseDriveData(courseId).then((res) => {
      if (isMounted) {
        setData(res)
        if (res.tree) {
          // Preselect first subfolder if available, otherwise root folder
          const firstSub = res.tree.children.find(
            (child): child is DriveFolderNode => child.type === 'folder'
          )
          setSelectedFolder(firstSub || res.tree)
        }
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [courseId])

  const formattedCourseTitle = data ? formatDisplayName(data.course_name) : courseId

  return (
    <div className="animate-fade-in min-h-screen bg-slate-50 pb-16">
      {/* Sub-Hero Header */}
      <section
        className="pt-16 pb-8 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(155deg, #080e22 0%, #0f1b3d 50%, #172651 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 mb-3 text-gray-400 text-xs font-semibold hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Volver a la selección de cursos
          </button>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-mono font-bold">
              {courseId}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formattedCourseTitle}
            </h1>
          </div>

          <p className="mt-2 text-slate-300 text-xs font-medium">
            Visualizador de contenido académico sincronizado desde Google Drive
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              Cargando estructura del curso {courseId}...
            </p>
          </div>
        ) : !data || !data.tree ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <p className="text-sm font-semibold text-slate-600">
              No se pudo cargar la información para este curso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Left: Folder Tree (~25-30%) */}
            <div className="lg:col-span-1">
              <FolderSidebar
                rootFolder={data.tree}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
              />
            </div>

            {/* Main Content Right: File Grid (~70-75%) */}
            <div className="lg:col-span-3">
              <FileGrid folder={selectedFolder} courseName={data.course_name} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
