import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { authService, setAuthToken, clearAuthToken, setSessionExpiredHandler } from '@/services/api'
import { extractApiError, isTransientError } from '@/utils/errors'

const AuthContext = createContext(null)

// Seuls les clients et artisans ont accès à la plateforme Bricolibe ;
// l'équipe (directeur, assistance, admin) passe par le dashboard.
const PLATFORM_ROLES = ['client', 'artisan']

const RESTORE_RETRY_MAX_MS = 30 * 1000

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Renvoie le message d'erreur si l'échec est transitoire : l'utilisateur n'est alors pas déconnecté.
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authService.me()
      if (PLATFORM_ROLES.includes(data.role)) {
        setUser(data)
      } else {
        clearAuthToken()
        setUser(null)
      }
    } catch (err) {
      if (isTransientError(err)) return extractApiError(err)
      setUser(null)
    }
    setLoading(false)
    return null
  }, [])

  // Au chargement : le refresh token est dans un cookie httpOnly (invisible JS),
  // donc on tente toujours /me/ — un 401 déclenche un refresh silencieux dans
  // l'intercepteur ; s'il échoue, user reste null. Une erreur transitoire ne dit
  // rien de la session : on réessaie au lieu de renvoyer vers /connexion.
  useEffect(() => {
    let cancelled = false
    let timer = null
    let attempt = 0

    const restore = async () => {
      const transientError = await fetchMe()
      if (!transientError || cancelled) return
      if (attempt === 0) toast.error(transientError, { toastId: transientError })
      timer = setTimeout(restore, Math.min(1000 * 2 ** attempt, RESTORE_RETRY_MAX_MS))
      attempt += 1
    }
    restore()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [fetchMe])

  // Session réellement expirée (refresh refusé par le serveur) : l'intercepteur
  // vide l'access token et prévient ici → user passe à null et PrivateRoute
  // redirige vers /connexion (plus de hard reload brutal).
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null))
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setAuthToken(data.access)
    await fetchMe()
    return data
  }

  const logout = async () => {
    try {
      // Blacklist du refresh token côté serveur (cookie httpOnly) — best effort.
      await authService.logout()
    } catch {
      // On nettoie le client quoi qu'il arrive.
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }

  const register = async (formData) => {
    const { data } = await authService.register(formData)
    setAuthToken(data.access)
    await fetchMe()
    return data
  }

  const updateMe = async (formData) => {
    const { data } = await authService.updateMe(formData)
    setUser(data)
    return data
  }

  const isArtisan = user?.role === 'artisan'
  const isClient  = user?.role === 'client'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateMe, fetchMe, isArtisan, isClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
