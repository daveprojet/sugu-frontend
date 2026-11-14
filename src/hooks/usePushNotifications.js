import { useEffect, useCallback, useRef } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/firebase'
import { fcmTokenService } from '@/services/api'
import { toast } from 'react-toastify'
import { ecouterSonnerie } from '@/utils/sonnerie'
import { memoriserJetonPush } from '@/utils/jetonPush'

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
      memoriserJetonPush(token)
      tokenSentRef.current = true
      console.log('[Push] Token FCM enregistré en base')
      return true
    } catch (err) {
      console.error('[Push] Erreur enregistrement token:', err)
      tokenSentRef.current = false
      return false
    }
  }, [user])

  // Permission déjà accordée : le jeton de CE navigateur est (ré)attaché au compte
  // connecté à chaque connexion. Il ne suffit pas que le compte ait un jeton ailleurs :
  // ce navigateur a pu servir à un autre compte juste avant.
  const registerSilentlyIfGranted = useCallback(async () => {
    if (silentCheckRef.current) return
    silentCheckRef.current = true

    if (Notification.permission !== 'granted') return

    await registerToken()
  }, [registerToken])

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

  // Compte connecté, lu par les écouteurs (push destinées à un autre compte ignorées).
  const userRef = useRef(user)
  userRef.current = user
  const pourMoi = useCallback(
    (destinataire) => !!userRef.current && (!destinataire || String(userRef.current.id) === String(destinataire)),
    [],
  )

  // Sonnerie des nouvelles demandes, missions et devis (prévenue par le service worker).
  useEffect(() => ecouterSonnerie(pourMoi), [pourMoi])

  // Notifications reçues en premier plan (app ouverte et active)
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Push] Notification reçue en premier plan:', payload)
      if (!pourMoi(payload.data?.destinataire)) return
      const title = payload.data?.title || payload.notification?.title || 'Bricolibe'
      const body = payload.data?.body || payload.notification?.body || ''

      const sonne = payload.data?.sonnerie === '1'
      toast.info(`${title}\n${body}`, {
        position: 'top-right',
        // Nouvelle demande, mission, devis : reste affichée ; toucher la page
        // (le toast compris) coupe la sonnerie.
        autoClose: sonne ? false : 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      })
    })

    return () => unsubscribe()
  }, [pourMoi])

  return { requestPermissionAndRegister, hasRegisteredToken }
}