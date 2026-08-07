export interface DriveFileNode {
  name: string
  type: 'file'
  id: string
  mimeType?: string
  size?: number
}

export interface DriveFolderNode {
  name: string
  type: 'folder'
  id: string
  children: (DriveFolderNode | DriveFileNode)[]
}

export type DriveNode = DriveFolderNode | DriveFileNode

export interface DriveCourseInfo {
  course_id: string
  course_name: string
  id?: string
  scanned_at?: string
  total_files?: number
}

export interface DriveCatalogIndex {
  total_courses: number
  total_files: number
  scanned_at?: string
  courses: DriveCourseInfo[]
}

export interface DriveCourseData {
  course_id: string
  course_name: string
  id?: string
  scanned_at?: string
  tree: DriveFolderNode
}

// Memory cache to avoid re-fetching JSON of the same course in the same session
const courseCache: Record<string, DriveCourseData> = {}

export async function fetchDriveCourses(): Promise<DriveCourseInfo[]> {
  try {
    const res = await fetch('/data/courses/index.json')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data
      } else if (data && Array.isArray(data.courses)) {
        return data.courses
      }
    }
  } catch (e) {
    console.warn('[SACU Static Data] Error al cargar /data/courses/index.json', e)
  }
  return []
}

export async function fetchDriveCatalogIndex(): Promise<DriveCatalogIndex | null> {
  try {
    const res = await fetch('/data/courses/index.json')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const totalFiles = data.reduce((acc: number, c: DriveCourseInfo) => acc + (c.total_files || 0), 0)
        return {
          total_courses: data.length,
          total_files: totalFiles,
          courses: data
        }
      } else if (data && Array.isArray(data.courses)) {
        return data as DriveCatalogIndex
      }
    }
  } catch (e) {
    console.warn('[SACU Static Data] Error al cargar /data/courses/index.json', e)
  }
  return null
}

export async function fetchCourseDriveData(courseId: string): Promise<DriveCourseData> {
  if (courseCache[courseId]) {
    return courseCache[courseId]
  }

  try {
    const res = await fetch(`/data/courses/${encodeURIComponent(courseId)}.json`)
    if (res.ok) {
      const data = await res.json()
      courseCache[courseId] = data
      return data
    }
  } catch (e) {
    console.warn(`[SACU Static Data] Error al cargar /data/courses/${courseId}.json`, e)
  }

  // Fallback si no existe el archivo específico
  const fallbackData: DriveCourseData = {
    course_id: courseId,
    course_name: courseId,
    tree: {
      name: courseId,
      type: 'folder',
      id: `root_${courseId}`,
      children: []
    }
  }
  return fallbackData
}

export function formatDisplayName(rawName: string): string {
  if (!rawName) return ''
  return rawName.replace(/_/g, ' ').trim()
}


