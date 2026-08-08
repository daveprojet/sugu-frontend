import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

// Access token gardé en mémoire uniquement (jamais persisté) : un XSS ne peut
// ni le lire durablement, ni obtenir un nouveau refresh (cookie httpOnly).
let accessToken = null

export const setAuthToken = (token) => { accessToken = token }
export const clearAuthToken = () => { accessToken = null }

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Le refresh token voyage dans un cookie httpOnly envoyé automatiquement.
  withCredentials: true,
})

// Injecter le token JWT (mémoire) automatiquement
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})


// Refresh silencieux si 401 (cookie httpOnly), avec garde anti-réentrance :
// un seul refresh en vol, les autres requêtes 401 attendent le même.
let refreshPromise = null
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        refreshPromise = refreshPromise || api.post('/auth/token/refresh/', null, { _retry: true })
        const { data } = await refreshPromise
        refreshPromise = null
        accessToken = data.access
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (refreshError) {
        refreshPromise = null
        // On ne redirige que si une session était active (évite de bouncer
        // les visiteurs de pages publiques au premier chargement).
        const hadSession = !!accessToken
        accessToken = null
        if (hadSession) window.location.href = '/connexion'
        return Promise.reject(refreshError)
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
  passwordResetRequest: (data) => api.post('/auth/password-reset/request/', data),
  passwordResetVerify:  (data) => api.post('/auth/password-reset/verify/', data),
  passwordResetConfirm: (data) => api.post('/auth/password-reset/confirm/', data),
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
  avis:        (id, params) => api.get(`/artisans/${id}/avis/`, { params }),
  estimerPrix: (id, data)   => api.post(`/artisans/${id}/estimer-prix/`, data),
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

// ── Identité ──────────────────────────────────────
export const identiteService = {
  get:    (uid) => api.get(`/artisans/${uid}/identite/`),
  upsert: (uid, formData) => api.put(`/artisans/${uid}/identite/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ── Contacts ──────────────────────────────────────────
export const contactService = {
  create: (data) => api.post('/contacts/', data),
}

// ── Catégories / Prestations ──────────────────────────
export const categorieService = {
  list:          ()      => api.get('/categories/'),
  detail:        (uid)   => api.get(`/categories/${uid}/`),
}

// ── Commissions / Paiements ──────────────────────────
export const commissionService = {
  list:          ()      => api.get('/commissions/'),
  detail:        (uid)   => api.get(`/commissions/${uid}/`),
}

export const paiementService = {
  list:          ()      => api.get('/commissions/paiements/'),
  create:        (data)  => api.post('/commissions/paiements/creer/', data),
}

// ── PayTech ──────────────────────────────────────────
export const paytechService = {
  init:   (data) => api.post('/commissions/paiements/paytech/init/', data),
  verify: (token) => api.post('/commissions/paiements/paytech/verify/', { token }),
  cancel: (token) => api.post('/commissions/paiements/paytech/cancel/', { token }),
}

export default api
