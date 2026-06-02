import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


// Refresh token automatique si 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/connexion'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authService = {
  login:    (data) => api.post('/auth/token/', data),
  register: (data) => api.post('/auth/register/', data),
  logout:   ()     => api.post('/auth/logout/'),
  me:       ()     => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
}

// ── Artisans ──────────────────────────────────────
export const artisanService = {
  list:        (params) => api.get('/artisans/', { params }),
  detail:      (id)     => api.get(`/artisans/${id}/`),
  create:      (data)   => api.post('/artisans/', data),
  update:      (id, d)  => api.patch(`/artisans/${id}/`, d),
  uploadPhoto: (id, f)  => {
    const fd = new FormData()
    fd.append('photo', f)
    return api.patch(`/artisans/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  avis:        (id)     => api.get(`/artisans/${id}/avis/`),
}

// ── Demandes ──────────────────────────────────────
export const demandeService = {
  list:   (params) => api.get('/demandes/', { params }),
  detail: (id)     => api.get(`/demandes/${id}/`),
  create: (data)   => api.post('/demandes/', data),
  update: (id, d)  => api.patch(`/demandes/${id}/`, d),
}

// ── Avis ──────────────────────────────────────────
export const avisService = {
  create: (data) => api.post('/avis/', data),
  repondre: (id, data) => api.patch(`/avis/${id}/reponse/`, data),
}

export default api
