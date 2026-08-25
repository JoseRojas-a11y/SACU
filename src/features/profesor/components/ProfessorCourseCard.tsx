import React from 'react'
import { ProfessorCourseTuple, RoleType } from '../types/profesor.types'
import { useProfesorStore } from '../store/useProfesorStore'
import '../styles/ProfessorCourseCard.css'
import { Star, MessageSquare, BookOpen, GraduationCap, Award, CheckCircle2 } from 'lucide-react'

interface Props {
  tuple: ProfessorCourseTuple
}

export const ProfessorCourseCard: React.FC<Props> = ({ tuple }) => {
  const setSelectedTuple = useProfesorStore((state) => state.setSelectedTuple)
  const setReviewsModalOpen = useProfesorStore((state) => state.setReviewsModalOpen)

  const handleOpenReviews = () => {
    setSelectedTuple(tuple)
    setReviewsModalOpen(true)
  }

  // Clases dinámicas para badges según RoleType
  const getRoleBadgeClass = (role: RoleType) => {
    switch (role) {
      case 'Teoria':
        return 'badge-role-teoria'
      case 'Practica':
        return 'badge-role-practica'
      case 'Laboratorio':
        return 'badge-role-laboratorio'
      case 'General':
      default:
        return 'badge-role-general'
    }
  }

  const rating = tuple.weightedRating || 4.0

  return (
    <div className="prof-bento-card p-5 sm:p-6 flex flex-col justify-between group shadow-xs">
      <div>
        {/* Top bar: RoleType badge & Dynamic Weighted Rating */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${getRoleBadgeClass(
              tuple.roleType
            )}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {tuple.roleType}
          </span>

          {/* Rating Badge - Ponderado */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-900 shadow-xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-semibold text-purple-700">Ponderado:</span>
            <span className="text-sm font-mono font-extrabold text-slate-900">{rating.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-medium">/ 5.0</span>
          </div>
        </div>

        {/* Professor Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[var(--theme-primary)] transition-colors">
          {tuple.professorName}
        </h3>

        {/* Course Info */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-[var(--theme-primary)] flex-shrink-0" />
          <span className="font-semibold text-slate-800">{tuple.courseName}</span>
          {tuple.courseCode && (
            <span className="text-[11px] font-mono text-slate-400">({tuple.courseCode})</span>
          )}
        </div>

        {/* Department */}
        <p className="text-[11px] text-slate-400 mt-1 truncate">
          {tuple.department || tuple.facultyName || 'Facultad de Ingeniería Industrial y de Sistemas'}
        </p>

        {/* Sub-metric breakdown bars: 3 Positive Attributes */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
          {/* Enseñanza */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-[var(--theme-primary)]" />
                Enseñanza & Didáctica
              </span>
              <span className="font-mono font-bold text-slate-700">
                {(tuple.scores.ensenanza || 4.0).toFixed(1)} / 5.0
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${((tuple.scores.ensenanza || 4.0) / 5) * 100}%` }}
                className="h-full bg-[var(--theme-primary)] rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Evaluación & Accesibilidad */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                Evaluación & Accesibilidad
              </span>
              <span className="font-mono font-bold text-slate-700">
                {(tuple.scores.evaluacion ?? tuple.scores.dificultad ?? 4.0).toFixed(1)} / 5.0
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(((tuple.scores.evaluacion ?? tuple.scores.dificultad ?? 4.0)) / 5) * 100}%` }}
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Dedicación */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Dedicación & Soporte
              </span>
              <span className="font-mono font-bold text-slate-700">
                {(tuple.scores.dedicacion || 4.0).toFixed(1)} / 5.0
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${((tuple.scores.dedicacion || 4.0) / 5) * 100}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{tuple.reviewCount} {tuple.reviewCount === 1 ? 'reseña' : 'reseñas'}</span>
        </div>

        <button
          type="button"
          onClick={handleOpenReviews}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-[var(--theme-primary)] text-[var(--theme-primary)] hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
        >
          <span>Ver Reseñas & Opinar</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  )
}
