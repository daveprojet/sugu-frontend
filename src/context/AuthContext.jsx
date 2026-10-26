import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService, setAuthToken, clearAuthToken, setSessionExpiredHandler } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authService.me()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Au chargement : le refresh token est dans un cookie httpOnly (invisible JS),
  // donc on tente toujours /me/ — un 401 déclenche un refresh silencieux dans
  // l'intercepteur ; s'il échoue, user reste null.
  useEffect(() => {
    fetchMe()
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
