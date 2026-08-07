import { useState, useMemo } from 'react'
import { useMaterials } from './hooks/useMaterials'
import { useFaculties } from './hooks/useFaculties'
import { useUploadMaterial } from './hooks/useUploadMaterial'
import { useDriveCourses } from './hooks/useDriveCourses'
import { CourseDetailView } from './components/CourseDetailView'
import { CourseDriveViewer } from './components/CourseDriveViewer'
import { UploadMaterialModal } from './components/UploadMaterialModal'
import { formatDisplayName } from './services/courseDriveService'
import { Material } from '../../core/types'
import { useUIStore } from '../../core/store/useUIStore'

interface RepositorioFeatureProps {
  selectedFaculty: string
  searchQuery: string
  selectedCourse: string | null
  onSelectCourse: (course: string | null) => void
  onDownload: (m: Material) => void
}

export default function RepositorioFeature({
  selectedFaculty,
  searchQuery,
  selectedCourse,
  onSelectCourse,
  onDownload,
}: RepositorioFeatureProps) {
  const showUploadModal = useUIStore((state) => state.showUploadModal)
  const setUploadModal = useUIStore((state) => state.setUploadModal)

  const { data: faculties = [] } = useFaculties()
  const { driveCourses } = useDriveCourses()
  const { data: materials = [] } = useMaterials({
    faculty: selectedFaculty,
    search: searchQuery,
  })

  const uploadMutation = useUploadMaterial()

  // Single course detail view: SPA Drive Viewer
  if (selectedCourse) {
    // Find matching drive course by course_id or course_name
    const matchedDrive = driveCourses.find(
      (dc) =>
        dc.course_id.toLowerCase() === selectedCourse.toLowerCase() ||
        dc.course_name.toLowerCase() === selectedCourse.toLowerCase() ||
        formatDisplayName(dc.course_name).toLowerCase() === selectedCourse.toLowerCase()
    )

    const targetCourseId = matchedDrive ? matchedDrive.course_id : selectedCourse

    if (matchedDrive) {
      return (
        <CourseDriveViewer
          courseId={targetCourseId}
          onBack={() => onSelectCourse(null)}
        />
      )
    }

    return (
      <CourseDetailView
        course={selectedCourse}
        allMaterials={materials}
        faculties={faculties}
        onBack={() => onSelectCourse(null)}
        onDownload={onDownload}
      />
    )
  }


  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Main course listings */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Google Drive Scanned Courses Banner / Cards */}
        {driveCourses.length > 0 && (
          <section className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-indigo-800/60 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-mono font-bold tracking-wider uppercase">
                  Google Drive Repositories
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Cursos Disponibles
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Selecciona un curso para explorar su árbol de carpetas y cuadrícula de archivos estandarizados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {driveCourses.map((dc) => {
                const formattedName = formatDisplayName(dc.course_name)
                return (
                  <button
                    key={dc.course_id}
                    onClick={() => onSelectCourse(dc.course_id)}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-indigo-400/50 rounded-2xl p-4 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 font-mono text-[10px] font-bold border border-indigo-400/30">
                          {dc.course_id}
                        </span>
                        <span className="text-lg">📚</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-2">
                        {formattedName}
                      </h3>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300 font-semibold">
                      <span>Ver estructura</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={showUploadModal}
        onClose={() => setUploadModal(false)}
        faculties={faculties}
        onSubmit={async (newMat) => {
          await uploadMutation.mutateAsync(newMat)
        }}
      />
    </div>
  )
}
