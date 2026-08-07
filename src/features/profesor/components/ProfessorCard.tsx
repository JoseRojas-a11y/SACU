import React, { useState } from 'react'
import { Professor } from '../../../core/types'
import { useRateProfessor } from '../hooks/useRateProfessor'

interface Props {
  professor: Professor
}

export const ProfessorCard: React.FC<Props> = ({ professor }) => {
  const [userRating, setUserRating] = useState<number | null>(null)
  const rateMutation = useRateProfessor()

  const handleRating = (stars: number) => {
    setUserRating(stars)
    rateMutation.mutate({ profId: professor.id, rating: stars })
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            {professor.name.charAt(0)}
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-mono font-bold">
            <span>⭐</span>
            <span>{professor.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug">{professor.name}</h3>
        <p className="text-xs text-indigo-600 font-semibold mt-1">{professor.department || 'Docente Universitario'}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{professor.email || 'contacto@sacu.edu.pe'}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Valorar:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              disabled={rateMutation.isPending}
              className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                (userRating !== null && star <= userRating) ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
