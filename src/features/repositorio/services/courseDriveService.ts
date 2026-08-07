export interface DriveFileNode {
  name: string
  type: 'file'
  id: string
  mimeType?: string
  size?: number
  thumbnail_url?: string
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
      }
    }
  } catch (e) {
    console.warn('[SACU Static Data] Error al cargar /data/courses/index.json', e)
  }
  return []
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


