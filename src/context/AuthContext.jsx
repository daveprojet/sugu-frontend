import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/api'

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

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) fetchMe()
    else setLoading(false)
  }, [fetchMe])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    await fetchMe()
    return data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const register = async (formData) => {
    const { data } = await authService.register(formData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
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
