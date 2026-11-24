import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { motion } from 'framer-motion'

// Le navigateur envoie « beforeinstallprompt » une seule fois, parfois avant que
// React affiche la bannière : on le garde ici dès le chargement du module.
let invitationDiffere = null
const abonnes = new Set()
const prevenir = () => abonnes.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // on affiche notre bannière à la place de celle du navigateur
    invitationDiffere = e
    prevenir()
  })
  window.addEventListener('appinstalled', () => {
    invitationDiffere = null
    prevenir()
  })
}

const CLE_FERMEE = 'install_app_fermee'

function estInstallee() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// Safari sur iPhone / iPad n'envoie pas « beforeinstallprompt » : l'installation
// passe par le menu Partager.
function estIOS() {
  const ua = window.navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
}

function lireFermee() {
  try { return sessionStorage.getItem(CLE_FERMEE) === '1' } catch { return false }
}

/**
 * Invite à installer l'appli Bricolibe sur l'écran d'accueil.
 * Revient à chaque visite tant que l'appli n'est pas installée ; la croix la
 * masque seulement jusqu'à la fermeture de l'onglet.
 */
export default function InstallAppBanner() {
  const [, rafraichir] = useState(0)
  const [fermee, setFermee] = useState(lireFermee)
  const [aideIOS, setAideIOS] = useState(false)
  const [installee, setInstallee] = useState(estInstallee)

  useEffect(() => {
    const maj = () => { setInstallee(estInstallee()); rafraichir((n) => n + 1) }
    abonnes.add(maj)
    const media = window.matchMedia?.('(display-mode: standalone)')
    media?.addEventListener?.('change', maj)
    return () => {
      abonnes.delete(maj)
      media?.removeEventListener?.('change', maj)
    }
  }, [])

  const ios = estIOS()
  if (installee || fermee || (!invitationDiffere && !ios)) return null

  const installer = async () => {
    if (!invitationDiffere) { setAideIOS(true); return }
    const invitation = invitationDiffere
    invitation.prompt()
    try {
      const { outcome } = await invitation.userChoice
      if (outcome === 'accepted') setInstallee(true)
    } finally {
      // Une invitation ne sert qu'une fois ; le navigateur en renverra une autre.
      invitationDiffere = null
      rafraichir((n) => n + 1)
    }
  }

  const fermer = () => {
    setFermee(true)
    try { sessionStorage.setItem(CLE_FERMEE, '1') } catch { /* navigation privée */ }
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      role="region"
      aria-label="Installer l'appli Bricolibe"
      className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-primary-100 p-3 sm:p-4 flex items-center gap-3"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
        <Download className="w-5 h-5 text-primary-500" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-bold text-gray-900">Installez l'appli Bricolibe</p>
        {aideIOS ? (
          <p className="text-xs text-gray-600 mt-0.5">
            Touchez <Share className="inline w-3.5 h-3.5 -mt-0.5 text-primary-500" aria-label="Partager" /> puis
            {' '}« Sur l'écran d'accueil ».
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">Accès rapide, plein écran, sur votre écran d'accueil.</p>
        )}
      </div>
      {!aideIOS && (
        <button
          type="button"
          onClick={installer}
          className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          Installer
        </button>
      )}
      <button
        type="button"
        onClick={fermer}
        aria-label="Masquer"
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
