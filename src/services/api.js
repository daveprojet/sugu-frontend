import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

// Access token gardé en mémoire uniquement (jamais persisté) : un XSS ne peut
// ni le lire durablement, ni obtenir un nouveau refresh (cookie httpOnly).
let accessToken = null
let refreshTimer = null
let onSessionExpired = null

// L'access est renouvelé 60 s avant son expiration : il n'expire donc jamais
// en pleine navigation (la déconnexion « à 15 min » disparaît).
const ACCESS_REFRESH_LEAD_MS = 60 * 1000
// Délai avant une nouvelle tentative après une erreur transitoire (réseau).
const ACCESS_RETRY_DELAY_MS = 15 * 1000

// Handler appelé quand la session est réellement morte (refresh refusé).
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn }

export const clearAuthToken = () => {
  accessToken = null
  clearTimeout(refreshTimer)
}

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Le refresh token voyage dans un cookie httpOnly envoyé automatiquement.
  withCredentials: true,
})

// Refresh silencieux partagé (garde anti-réentrance) : en cas de 401 ou juste
// avant l'expiration, une seule requête de refresh est en vol à la fois, les
// autres appels attendent le même résultat.
let refreshPromise = null
const silentRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/token/refresh/', null, { _retry: true })
      .then(({ data }) => {
        accessToken = data.access
        scheduleRefresh()
        return data.access
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

// Planifie le prochain renouvellement juste avant l'expiration de l'access.
const scheduleRefresh = () => {
  clearTimeout(refreshTimer)
  const exp = getTokenExpiry(accessToken)
  if (!exp) return
  let delay = exp - Date.now() - ACCESS_REFRESH_LEAD_MS
  if (delay < 0) delay = ACCESS_RETRY_DELAY_MS // déjà dans la fenêtre : réessaie
  refreshTimer = setTimeout(() => {
    silentRefresh().catch(handleRefreshFailure)
  }, delay)
}

// Onglet de retour au premier plan : on renouvelle si l'access est sur le point
// d'expirer (les setTimeout sont throttlés dans les onglets en arrière-plan).
const onWindowVisible = () => {
  const exp = getTokenExpiry(accessToken)
  if (exp && exp - Date.now() < ACCESS_REFRESH_LEAD_MS * 2) {
    silentRefresh().catch(handleRefreshFailure)
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('focus', onWindowVisible)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) onWindowVisible()
  })
}

// Échec du refresh : une vraie session morte (401) est nettoyée sans hard
// reload (PrivateRoute redirige) ; une erreur réseau transitoire ne détruit
// pas la session et relance le refresh un peu plus tard.
const handleRefreshFailure = (err) => {
  if (err?.response?.status === 401) {
    clearAuthToken()
    if (onSessionExpired) onSessionExpired()
  } else {
    scheduleRefresh()
  }
}

export const setAuthToken = (token) => {
  accessToken = token
  scheduleRefresh()
}

// Injecter le token JWT (mémoire) automatiquement
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Refresh silencieux si 401 (cookie httpOnly), avec garde anti-réentrance.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await silentRefresh()
        return api(original)
      } catch (refreshError) {
        handleRefreshFailure(refreshError)
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
}

// ── Demandes ──────────────────────────────────────
export const demandeService = {
  list:   (params) => api.get('/demandes/', { params }),
  detail: (id)     => api.get(`/demandes/${id}/`),
  create: (data)   => api.post('/demandes/', data),
  update: (id, d)  => api.patch(`/demandes/${id}/`, d),
  fixerPrix: (id, prix) => api.patch(`/demandes/${id}/fixer-prix/`, { prix_total: prix }),
  confirmerPaiement: (id, montant) => api.post(`/demandes/${id}/confirmer-paiement/`, { montant_confirme: montant }),
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

// ── Reversements (gain artisan) ───────────────────────
export const reversementService = {
  list:   () => api.get('/commissions/reversements/'),
  detail: (uid) => api.get(`/commissions/reversements/${uid}/`),
}

// ── FCM Push Notifications ─────────────────────────────
export const fcmTokenService = {
  check:     () => api.get('/fcm-tokens/'),
  register:  (data) => api.post('/fcm-tokens/', data),
  unregister: (id) => api.delete(`/fcm-tokens/${id}/`),
}

export default api
