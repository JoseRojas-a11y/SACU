import { useState, useEffect, lazy, Suspense } from 'react'
import { Navbar } from './core/components/Navbar'
import { Hero } from './core/components/Hero'
import { Footer } from './core/components/Footer'
import { NotificationToast } from './core/components/NotificationToast'
import { LoadingFallback } from './core/components/LoadingFallback'
import { useFaculties } from './features/repositorio/hooks/useFaculties'
import { useMaterials } from './features/repositorio/hooks/useMaterials'
import { useUIStore } from './core/store/useUIStore'
import { Material } from './core/types'

// Code splitting & Lazy Loading of feature modules
const RepositorioFeature = lazy(() => import('./features/repositorio/RepositorioFeature'))
const ProfesorFeature = lazy(() => import('./features/profesor/ProfesorFeature'))

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  // Default faculty selected is always 'sistemas' (FIIS)
  const [selectedFaculty, setSelectedFaculty] = useState<string>('sistemas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  const activeView = useUIStore((state) => state.activeView)
  const setUploadModal = useUIStore((state) => state.setUploadModal)
  const setToast = useUIStore((state) => state.setToast)

  const { data: faculties = [] } = useFaculties()
  const { data: materials = [] } = useMaterials({ faculty: selectedFaculty })

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleDownload(m: Material) {
    setToast(`Iniciando descarga: ${m.title}`)
    if (m.file_url) {
      window.open(m.file_url, '_blank')
    }
  }

  // System stats summary
  const totalMaterials = materials.length
  const totalCourses = new Set(materials.map(m => m.course)).size
  const totalAuthors = new Set(materials.map(m => m.author)).size

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        faculties={faculties}
        selectedFaculty={selectedFaculty}
        onFacultySelect={(id) => {
          setSelectedFaculty(id)
          setSelectedCourse(null)
        }}
        onOpenUpload={() => setUploadModal(true)}
        scrolled={scrolled}
      />

      {/* Hero section on Repositorio view when no specific course selected */}
      {activeView === 'repositorio' && !selectedCourse && (
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          faculties={faculties}
          selectedFaculty={selectedFaculty}
          onFacultySelect={(id) => {
            setSelectedFaculty(id)
            setSelectedCourse(null)
          }}
          totalMaterials={totalMaterials}
          totalCourses={totalCourses}
          totalAuthors={totalAuthors}
        />
      )}

      {/* Lazy Loaded Feature Views inside Suspense */}
      <div className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          {activeView === 'repositorio' && (
            <RepositorioFeature
              selectedFaculty={selectedFaculty}
              searchQuery={searchQuery}
              selectedCourse={selectedCourse}
              onSelectCourse={setSelectedCourse}
              onDownload={handleDownload}
            />
          )}

          {activeView === 'profesor' && <ProfesorFeature />}
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />

      {/* Global Notification Toast */}
      <NotificationToast />
    </div>
  )
}
