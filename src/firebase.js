// Firebase (notifications push + statistiques), chargé à la demande : le SDK pèse lourd et
// un visiteur non connecté n'en a pas besoin pour afficher la page. Il est téléchargé
// à part, après l'affichage, au lieu d'alourdir le premier chargement du site.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let appPromise = null
let messagingPromise = null

function obtenirApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp }) => initializeApp(firebaseConfig))
  }
  return appPromise
}

/** Messagerie Firebase, ou null si le navigateur ne gère pas les notifications push. */
export function obtenirMessaging() {
  if (!messagingPromise) {
    messagingPromise = Promise.all([obtenirApp(), import('firebase/messaging')])
      .then(async ([app, { getMessaging, isSupported }]) => ((await isSupported()) ? getMessaging(app) : null))
      .catch((err) => {
        console.error('[Push] Firebase indisponible :', err)
        return null
      })
  }
  return messagingPromise
}

/** Statistiques Firebase (Google Analytics), démarrées quand le navigateur est libre. */
export function demarrerStatistiques() {
  const lancer = () => {
    Promise.all([obtenirApp(), import('firebase/analytics')])
      .then(async ([app, { getAnalytics, isSupported }]) => { if (await isSupported()) getAnalytics(app) })
      .catch(() => {})
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(lancer, { timeout: 5000 })
  else setTimeout(lancer, 3000)
}
