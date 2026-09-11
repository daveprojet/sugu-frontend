import { useEffect, useCallback, useRef } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/firebase'
import { fcmTokenService } from '@/services/api'
import { toast } from 'react-toastify'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export function usePushNotifications(user) {
  const tokenSentRef = useRef(false)
  const silentCheckRef = useRef(false)

  // Vérifie auprès du backend si l'utilisateur possède déjà un token FCM actif.
  const hasRegisteredToken = useCallback(async () => {
    if (!user) return false
    try {
      const { data } = await fcmTokenService.check()
      return data.has_active_token === true
    } catch (err) {
      console.error('[Push] Erreur vérification token:', err)
      return false
    }
  }, [user])

  // Enregistre le token (sans dialogue navigateur, permission déjà accordée).
  const registerToken = useCallback(async () => {
    if (!user || !messaging) return false
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY })
      if (!token) {
        console.error('[Push] Impossible d\'obtenir le token FCM')
        return false
      }
      await fcmTokenService.register({
        token,
        device_info: navigator.userAgent,
      })
      tokenSentRef.current = true
      console.log('[Push] Token FCM enregistré en base')
      return true
    } catch (err) {
      console.error('[Push] Erreur enregistrement token:', err)
      tokenSentRef.current = false
      return false
    }
  }, [user])

  // Ré-enregistrement silencieux : permission déjà 'granted' mais token absent en BDD.
  const registerSilentlyIfGranted = useCallback(async () => {
    if (silentCheckRef.current) return
    silentCheckRef.current = true

    if (Notification.permission !== 'granted') return

    const already = await hasRegisteredToken()
    if (already) {
      tokenSentRef.current = true
      return
    }

    await registerToken()
  }, [hasRegisteredToken, registerToken])

  // Demande explicite via badge : ouvre le dialogue navigateur, puis enregistre.
  const requestPermissionAndRegister = useCallback(async () => {
    if (!user || !messaging) return 'unsupported'
    if (tokenSentRef.current) return 'already_registered'

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('[Push] Permission refusée:', permission)
        return permission
      }

      const ok = await registerToken()
      return ok ? 'granted' : 'token_error'
    } catch (err) {
      console.error('[Push] Erreur:', err)
      tokenSentRef.current = false
      return 'error'
    }
  }, [user, registerToken])

  // Au login : tente la ré-enregistrement silencieuse si permission déjà accordée.
  useEffect(() => {
    if (user) {
      registerSilentlyIfGranted()
    } else {
      tokenSentRef.current = false
      silentCheckRef.current = false
    }
  }, [user, registerSilentlyIfGranted])

  // Notifications reçues en premier plan (app ouverte et active)
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Push] Notification reçue en premier plan:', payload)
      const title = payload.data?.title || payload.notification?.title || 'Bricolibe'
      const body = payload.data?.body || payload.notification?.body || ''

      toast.info(`${title}\n${body}`, {
        position: 'top-right',
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      })
    })

    return () => unsubscribe()
  }, [])

  return { requestPermissionAndRegister, hasRegisteredToken }
}