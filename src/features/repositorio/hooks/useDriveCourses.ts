import { useState, useEffect } from 'react'
import { DriveCourseInfo, fetchDriveCatalogIndex } from '../services/courseDriveService'

export function useDriveCourses() {
  const [driveCourses, setDriveCourses] = useState<DriveCourseInfo[]>([])
  const [totalCourses, setTotalCourses] = useState<number>(0)
  const [totalFiles, setTotalFiles] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchDriveCatalogIndex()
      .then((indexData) => {
        if (isMounted && indexData) {
          setDriveCourses(indexData.courses || [])
          setTotalCourses(indexData.total_courses || 0)
          setTotalFiles(indexData.total_files || 0)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error fetching drive catalog index:', err)
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  return { driveCourses, totalCourses, totalFiles, loading }
}
