import { useState, useMemo } from 'react'
import { useMaterials } from './hooks/useMaterials'
import { useFaculties } from './hooks/useFaculties'
import { useUploadMaterial } from './hooks/useUploadMaterial'
import { useDriveCourses } from './hooks/useDriveCourses'
import { CourseDetailView } from './components/CourseDetailView'
import { CourseDriveViewer } from './components/CourseDriveViewer'
import { UploadMaterialModal } from './components/UploadMaterialModal'
import { formatDisplayName, DriveCourseInfo } from './services/courseDriveService'
import { Material } from '../../core/types'
import { useUIStore } from '../../core/store/useUIStore'

interface RepositorioFeatureProps {
  selectedFaculty: string
  searchQuery: string
  selectedCourse: string | null
  onSelectCourse: (course: string | null) => void
  onDownload: (m: Material) => void
}

interface CourseCardItemProps {
  dc: DriveCourseInfo
  variant: '1x1' | '1x2' | '2x2'
  onSelectCourse: (id: string) => void
}

function CourseCardItem({ dc, variant, onSelectCourse }: CourseCardItemProps) {
  const formattedName = formatDisplayName(dc.course_name)
  const totalFiles = dc.total_files ?? 0

  if (variant === '2x2') {
    return (
      <article
        onClick={() => onSelectCourse(dc.course_id)}
        className="bento-card bento-card-2x2 group"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="card-code-badge-hero">
                {dc.course_id}
              </span>
            </div>
            <svg
              className="w-6 h-6 text-[#8300ca] group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>

          <div>
            <h3 className="card-title-lg group-hover:text-[#8300ca]">
              {formattedName}
            </h3>
            <p className="text-xs sm:text-sm text-[#5c647a] line-clamp-3">
              Repositorio destacado con amplia colección de exámenes, prácticas calificadas, guías y laboratorios resueltos.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-[#e2e8f0] inline-block">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Archivos Escaneados
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#8300ca] font-mono">
              {totalFiles}
            </div>
          </div>
        </div>

        <div className="relative z-10 card-footer-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 5.25h16.5" />
            </svg>
            <span>Explorar Repositorio Completo</span>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">Drive</span>
        </div>

        <div className="card-glow-shape-lg group-hover:scale-125" />
      </article>
    )
  }

  if (variant === '1x2') {
    return (
      <article
        onClick={() => onSelectCourse(dc.course_id)}
        className="bento-card bento-card-1x2 group"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="card-code-badge">
                {dc.course_id}
              </span>
            </div>
            <svg
              className="w-5 h-5 text-slate-400 group-hover:text-[#8300ca] group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>

          <h3 className="card-title-md group-hover:text-[#8300ca] line-clamp-2">
            {formattedName}
          </h3>
        </div>

        <div className="relative z-10 card-footer-md">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 5.25h16.5" />
            </svg>
            <span>Ver contenido</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {totalFiles} archivos
          </span>
        </div>

        <div className="card-glow-shape-sm group-hover:scale-125" />
      </article>
    )
  }

  // Variant 1x1 (Default)
  return (
    <article
      onClick={() => onSelectCourse(dc.course_id)}
      className="bento-card bento-card-1x1 group"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2.5">
          <span className="card-code-badge">
            {dc.course_id}
          </span>
          <svg
            className="w-4 h-4 text-slate-400 group-hover:text-[#8300ca] group-hover:translate-x-1 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </div>

        <h3 className="card-title-sm group-hover:text-[#8300ca] line-clamp-2" title={formattedName}>
          {formattedName}
        </h3>
      </div>

      <div className="relative z-10 card-footer-sm">
        <span>Explorar</span>
        <span className="text-[10px] font-mono text-slate-500 font-normal">
          {totalFiles} files
        </span>
      </div>

      <div className="card-glow-shape-sm group-hover:scale-125" />
    </article>
  )
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

  // Filter drive courses by search query if present
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return driveCourses
    const q = searchQuery.toLowerCase()
    return driveCourses.filter(
      (dc) =>
        dc.course_id.toLowerCase().includes(q) ||
        dc.course_name.toLowerCase().includes(q) ||
        formatDisplayName(dc.course_name).toLowerCase().includes(q)
    )
  }, [driveCourses, searchQuery])

  // Calculate file count percentiles (P66 and P88) across all scanned courses
  const { p66Value, p88Value } = useMemo(() => {
    if (!driveCourses.length) return { p66Value: 0, p88Value: 0 }
    const sorted = driveCourses
      .map((c) => c.total_files ?? 0)
      .sort((a, b) => a - b)

    const p66Idx = Math.floor(sorted.length * 0.66)
    const p88Idx = Math.floor(sorted.length * 0.88)

    return {
      p66Value: sorted[p66Idx] ?? 0,
      p88Value: sorted[p88Idx] ?? 0,
    }
  }, [driveCourses])

  // Single course detail view: SPA Drive Viewer
  if (selectedCourse) {
    const matchedDrive = driveCourses.find(
      (dc) =>
        dc.course_id.toLowerCase() === selectedCourse.toLowerCase() ||
        dc.course_name.toLowerCase() === selectedCourse.toLowerCase() ||
        formatDisplayName(dc.course_name).toLowerCase() === selectedCourse.toLowerCase()
    )

    const targetCourseId = matchedDrive ? matchedDrive.course_id : selectedCourse

    return (
      <CourseDriveViewer
        courseId={targetCourseId}
        onBack={() => onSelectCourse(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Course Catalog Section */}
        <section id="cursos-disponibles" className="space-y-6 scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] tracking-tight">
                Cursos Disponibles
              </h2>
              <p className="text-xs sm:text-sm text-[#5c647a] mt-0.5 font-normal">
                Selecciona una materia para explorar sus carpetas, planchas y archivos.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#f2f4f6] text-[#5c647a] font-mono text-xs font-semibold rounded-full border border-[#e2e8f0] self-start sm:self-auto">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'materia' : 'materias'}
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#e2e8f0] shadow-xs">
              <span className="text-3xl mb-2 block">🔍</span>
              <h3 className="text-base font-bold text-slate-800">No se encontraron cursos</h3>
              <p className="text-xs text-slate-500 mt-1">
                Intenta buscar con otro nombre o código de materia.
              </p>
            </div>
          ) : (
            <div className="bento-catalog-grid">
              {filteredCourses.map((dc) => {
                const totalFiles = dc.total_files ?? 0
                let variant: '1x1' | '1x2' | '2x2' = '1x1'
                if (totalFiles > p88Value && p88Value > 0) {
                  variant = '2x2'
                } else if (totalFiles > p66Value && p66Value > 0) {
                  variant = '1x2'
                }

                return (
                  <CourseCardItem
                    key={dc.course_id}
                    dc={dc}
                    variant={variant}
                    onSelectCourse={onSelectCourse}
                  />
                )
              })}
            </div>
          )}
        </section>
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
