import React from 'react'
import { ProfessorCourseCard } from './ProfessorCourseCard'
import { ProfessorCourseTuple } from '../types/profesor.types'

export { ProfessorCourseCard }
export const ProfessorCard: React.FC<{ tuple: ProfessorCourseTuple }> = ({ tuple }) => {
  return <ProfessorCourseCard tuple={tuple} />
}
