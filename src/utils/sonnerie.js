// Sonnerie des notifications importantes (nouvelle demande, mission, devis).
//
// Le backend marque ces push avec data.sonnerie = '1'. Le service worker les
// reçoit toujours (onglet actif, en arrière-plan ou réduit) et prévient UNE
// fenêtre ouverte du site, qui joue le son jusqu'à ce que l'utilisateur touche
// la page, pendant DUREE_MAX_MS au plus : un son long joue une fois, un son
// court est rejoué (pause de PAUSE_MS entre deux lectures).
// Site fermé : la notification système s'affiche avec le son du téléphone.

const SON = '/sons/sonnerie.mp3'
const DUREE_MAX_MS = 30000
const PAUSE_MS = 1000
const VIBRATION = [400, 150, 400, 150, 400]

let audio = null
let minuteurFin = null // coupe la sonnerie au bout de DUREE_MAX_MS
let minuteurPause = null // relance un son court après la pause
let finSonnerie = 0 // 0 : aucune sonnerie en cours

function relancerApresPause() {
  if (!finSonnerie || Date.now() + PAUSE_MS >= finSonnerie) {
    arreterSonnerie()
    return
  }
  minuteurPause = setTimeout(() => {
    minuteurPause = null
    if (!finSonnerie) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, PAUSE_MS)
}

const lecteur = () => {
  if (!audio) {
    audio = new Audio(SON)
    audio.preload = 'auto'
    audio.addEventListener('ended', () => {
      if (finSonnerie) relancerApresPause()
    })
  }
  return audio
}

export function arreterSonnerie() {
  finSonnerie = 0
  clearTimeout(minuteurFin)
  clearTimeout(minuteurPause)
  minuteurFin = minuteurPause = null
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function jouerSonnerie() {
  arreterSonnerie()
  finSonnerie = Date.now() + DUREE_MAX_MS
  minuteurFin = setTimeout(arreterSonnerie, DUREE_MAX_MS)
  const son = lecteur()
  son.currentTime = 0
  // Refus possible si la page n'a encore reçu aucun geste de l'utilisateur.
  son.play().catch(() => {})
  try {
    navigator.vibrate?.(VIBRATION)
  } catch {
    // vibration non disponible
  }
  // Le premier geste de l'utilisateur coupe la sonnerie.
  setTimeout(() => {
    ;['pointerdown', 'keydown'].forEach((evenement) =>
      window.addEventListener(evenement, arreterSonnerie, { once: true, capture: true }))
  }, 300)
}

/** À appeler une fois au démarrage : écoute le service worker. Retourne le nettoyage. */
export function ecouterSonnerie() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return () => {}

  // Safari n'autorise un son qu'après un premier son joué lors d'un geste :
  // on « débloque » le lecteur, en silence, au premier contact avec la page.
  const debloquer = () => {
    if (finSonnerie) return
    const son = lecteur()
    son.muted = true
    son.play()
      .then(() => { if (!finSonnerie) { son.pause(); son.currentTime = 0 } })
      .catch(() => {})
      .finally(() => { son.muted = false })
  }
  window.addEventListener('pointerdown', debloquer, { once: true, capture: true })

  const surMessage = (event) => {
    if (event.data?.type === 'bricolibe-sonnerie') jouerSonnerie()
  }
  navigator.serviceWorker.addEventListener('message', surMessage)
  navigator.serviceWorker.startMessages?.()

  return () => {
    navigator.serviceWorker.removeEventListener('message', surMessage)
    window.removeEventListener('pointerdown', debloquer, { capture: true })
  }
}
