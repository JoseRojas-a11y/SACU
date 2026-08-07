import { useState, useEffect } from 'react'
import { DriveCourseInfo, fetchDriveCourses } from '../services/courseDriveService'

export function useDriveCourses() {
  const [driveCourses, setDriveCourses] = useState<DriveCourseInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchDriveCourses().then((data) => {
      if (isMounted) {
        setDriveCourses(data)
        setLoading(false)
      }
    }).catch((err) => {
      console.error('Error fetching drive courses:', err)
      if (isMounted) {
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return { driveCourses, loading }
}
