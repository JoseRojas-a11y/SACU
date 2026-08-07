import { useState, useEffect } from 'react'
import { Faculty } from '../types'
import HeroImage from '../public/hero-image.png'
import Astronauta from '../public/astronauta.png'

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  faculties: Faculty[]
  selectedFaculty: string
  onFacultySelect: (id: string) => void
  totalMaterials: number
  totalCourses: number
}

function useAnimatedCount(targetValue: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!targetValue || targetValue <= 0) {
      setCount(0)
      return
    }

    let startTime: number | null = null
    let animationFrameId: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * targetValue))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount)
      } else {
        setCount(targetValue)
      }
    }

    animationFrameId = requestAnimationFrame(updateCount)
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [targetValue, duration])

  return count
}

export function Hero({
  searchQuery,
  onSearchChange,
  faculties,
  selectedFaculty,
  onFacultySelect,
  totalMaterials,
  totalCourses,
}: Props) {
  const animatedMaterials = useAnimatedCount(totalMaterials, 1800)
  const animatedCourses = useAnimatedCount(totalCourses, 1400)

  return (
    <section className="hero-card-container">
      <img className="hero-image" src={HeroImage} alt="" />
      <div className="hero-content">
        <div className="hero-body">
          <h1 className="hero-title">
            Repositorio Académico
          </h1>
          <p className="hero-subtitle">
            Accede y contribuye a una colección unificada de recursos académicos y planchas de evaluación.
          </p>

          {/* Search Input inside Hero */}
          <div className="hero-search-wrapper">
            <div className="hero-search-bar">
              <svg className="w-4 h-4 text-[#cbd5e1] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar curso por nombre o código (ej. BMA01, Algorítmica)..."
                className="hero-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-xs text-[#cbd5e1] hover:text-white px-2 py-0.5 rounded bg-white/10"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="hero-stats-group">
            <div className="hero-stat-card">
              <div className="hero-stat-label">
                Total Archivos
              </div>
              <div className="hero-stat-value">
                {animatedMaterials.toLocaleString()}
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-label">
                Total Cursos
              </div>
              <div className="hero-stat-value">
                {animatedCourses.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative abstract background element */}
        <div className="hero-astronauta-container">
          <img className="animate-astronaut-float" src={Astronauta} alt="" />
        </div>
      </div>

      <div className="hero-glow-bg" />
    </section>
  )
}
