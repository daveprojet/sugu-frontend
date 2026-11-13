// Sonnerie des notifications importantes (nouvelle demande, mission, devis).
//
// Le backend marque ces push avec data.sonnerie = '1'. Le service worker les
// reçoit toujours (onglet actif, en arrière-plan ou réduit) et prévient UNE
// fenêtre ouverte du site, qui joue le son en boucle jusqu'à ce que
// l'utilisateur touche la page (ou au bout d'une quinzaine de secondes).
// Site fermé : la notification système s'affiche avec le son du téléphone.
//
// Son : « Happy bells notification », Mixkit (licence Mixkit Sound Effects,
// usage commercial autorisé sans attribution) — https://mixkit.co/free-sound-effects/notification/

const SON = '/sons/sonnerie.mp3'
const REPETITIONS = 8
const INTERVALLE_MS = 2000
const VIBRATION = [400, 150, 400, 150, 400]

let audio = null
let minuteur = null

const lecteur = () => {
  if (!audio) {
    audio = new Audio(SON)
    audio.preload = 'auto'
  }
  return audio
}

export function arreterSonnerie() {
  if (minuteur) {
    clearInterval(minuteur)
    minuteur = null
  }
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

export function jouerSonnerie() {
  arreterSonnerie()
  let restantes = REPETITIONS
  const jouer = () => {
    if (restantes-- <= 0) {
      arreterSonnerie()
      return
    }
    const son = lecteur()
    son.currentTime = 0
    // Refus possible si la page n'a encore reçu aucun geste de l'utilisateur.
    son.play().catch(() => {})
  }
  jouer()
  minuteur = setInterval(jouer, INTERVALLE_MS)
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
    const son = lecteur()
    son.muted = true
    son.play()
      .then(() => { son.pause(); son.currentTime = 0 })
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
