import { createClient, SupabaseClient, Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const userEmail =
  import.meta.env.VITE_SUPABASE_USER_EMAIL ||
  import.meta.env.VITE_SUPABASE_EMAIL ||
  import.meta.env.SUPABASE_USER_EMAIL ||
  import.meta.env.SUPABASE_EMAIL ||
  ''

const userPassword =
  import.meta.env.VITE_SUPABASE_USER_PASSWORD ||
  import.meta.env.VITE_SUPABASE_PASSWORD ||
  import.meta.env.SUPABASE_USER_PASSWORD ||
  import.meta.env.SUPABASE_PASSWORD ||
  ''

const isValidConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
)

export const supabase: SupabaseClient | null = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = (): boolean => {
  return isValidConfig && supabase !== null
}

let authPromise: Promise<Session | null> | null = null

/**
 * Garantiza que el cliente de Supabase esté autenticado con las credenciales
 * configuradas en las variables de entorno para cumplir con las políticas RLS.
 */
export async function ensureAuthenticated(): Promise<Session | null> {
  if (!supabase) return null

  try {
    // 1. Verificar si ya se cuenta con una sesión activa
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session) {
      return sessionData.session
    }

    // 2. Reutilizar promesa en curso si ya hay una petición de login activa
    if (authPromise) {
      return await authPromise
    }

    // 3. Autenticar si hay credenciales definidas en variables de entorno
    if (userEmail && userPassword) {
      authPromise = (async () => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: userPassword,
          })

          if (error) {
            console.error('[SACU Supabase Auth] Error al autenticar usuario con credenciales de entorno:', error.message)
            return null
          }

          if (data.session) {
            console.log(`[SACU Supabase Auth] Sesión iniciada correctamente como usuario autenticado (${userEmail}).`)
            return data.session
          }
        } catch (authErr) {
          console.error('[SACU Supabase Auth] Excepción durante inicio de sesión:', authErr)
        } finally {
          authPromise = null
        }
        return null
      })()

      return await authPromise
    } else {
      console.warn(
        '[SACU Supabase Auth] Aviso: No se encontraron credenciales de usuario (VITE_SUPABASE_USER_EMAIL / VITE_SUPABASE_USER_PASSWORD) en las variables de entorno.'
      )
    }
  } catch (err) {
    console.error('[SACU Supabase Auth] Error en ensureAuthenticated:', err)
  }

  return null
}

// Iniciar auto-autenticación asíncrona al importar el cliente
if (isValidConfig && userEmail && userPassword) {
  ensureAuthenticated().catch((err) => {
    console.warn('[SACU Supabase Auth] Aviso en auto-autenticación inicial:', err)
  })
}

