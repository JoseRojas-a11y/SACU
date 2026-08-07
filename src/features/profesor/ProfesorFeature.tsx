import React, { useState } from 'react'
import { useProfessors } from './hooks/useProfessors'
import { ProfessorCard } from './components/ProfessorCard'
import { ProfessorsModal } from './components/ProfessorsModal'
import { useUIStore } from '../../core/store/useUIStore'

export default function ProfesorFeature() {
  const { data: professors = [], isLoading } = useProfessors()
  const [filterQuery, setFilterQuery] = useState('')

  const showProfessorsModal = useUIStore((state) => state.showProfessorsModal)
  const setProfessorsModal = useUIStore((state) => state.setProfessorsModal)

  const filtered = professors.filter(
    (p) =>
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(filterQuery.toLowerCase()))
  )

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold uppercase tracking-wider">
                Directorio Académico
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                Profesores y Docentes
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Consulta y califica a los docentes universitarios según su desempeño, metodología y claridad académica.
              </p>
            </div>

            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Buscar docente o facultad..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Professors Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 font-medium mt-3">Cargando docentes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 max-w-md mx-auto">
            <p className="text-base font-bold text-gray-800">No se encontraron docentes</p>
            <p className="text-xs text-gray-500 mt-1">Prueba filtrando por otro nombre o departamento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prof) => (
              <ProfessorCard key={prof.id} professor={prof} />
            ))}
          </div>
        )}
      </div>

      <ProfessorsModal
        isOpen={showProfessorsModal}
        onClose={() => setProfessorsModal(false)}
        professors={professors}
      />
    </div>
  )
}
