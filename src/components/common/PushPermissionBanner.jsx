import { useState, useEffect } from 'react'
import { Bell, X, Loader2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'

export default function PushPermissionBanner({ onAllow, hasRegisteredToken }) {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Clé localStorage par utilisateur (évite les doublons entre comptes)
  const dismissKey = user ? `push_dismissed_${user.id || user.telephone}` : null

  useEffect(() => {
    if (dismissed) return
    if (!user) return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    if (dismissKey && localStorage.getItem(dismissKey) === 'true') return

    let cancelled = false
    let timer = null

    const checkAndShow = async () => {
      // Vérifier le backend : si token déjà actif → ne pas afficher le badge
      if (hasRegisteredToken) {
        try {
          const already = await hasRegisteredToken()
          if (cancelled || already) return
        } catch {
          return
        }
      }

      // Tout est OK : afficher le badge après 5s
      timer = setTimeout(() => {
        if (!cancelled) setVisible(true)
      }, 5000)
    }

    checkAndShow()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [dismissed, hasRegisteredToken, user, dismissKey])

  const handleAllow = async () => {
    setLoading(true)
    try {
      const result = await onAllow()

      if (result === 'granted') {
        toast.success('Notifications activées !')
        if (dismissKey) localStorage.setItem(dismissKey, 'true')
      } else if (result === 'denied') {
        toast.info('Notifications bloquées. Vous pouvez les activer dans les paramètres de votre navigateur.')
      } else if (result === 'already_registered') {
        toast.info('Notifications déjà configurées.')
        if (dismissKey) localStorage.setItem(dismissKey, 'true')
      } else {
        toast.error('Impossible d\'activer les notifications pour le moment.')
      }
    } catch {
      toast.error('Erreur lors de l\'activation des notifications.')
    } finally {
      setLoading(false)
      setVisible(false)
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    if (dismissKey) localStorage.setItem(dismissKey, 'true')
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Activez les notifications
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Recevez des alertes pour vos demandes, paiements et avis.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-500/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Activation...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Activer
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Plus tard
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
