import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { clocheService } from '@/services/api'

const relatif = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })

function ilYa(date) {
  const secondes = Math.round((new Date(date).getTime() - Date.now()) / 1000)
  const pas = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [Infinity, 'week']]
  let valeur = secondes
  for (const [taille, unite] of pas) {
    if (Math.abs(valeur) < taille) return relatif.format(valeur, unite)
    valeur = Math.round(valeur / taille)
  }
  return ''
}

/**
 * Cloche des notifications (clients, artisans, entreprises) : ce que la plateforme
 * a envoyé à l'utilisateur, qu'il ait activé les push ou non.
 */
export default function NotificationBell({ className = '' }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useQuery('cloche', () => clocheService.liste().then((r) => r.data), {
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  })
  const nonLues = data?.non_lues || 0
  const notifications = data?.resultats || []

  const maj = (reponse, uid) => queryClient.setQueryData('cloche', (ancien) => ancien && {
    non_lues: reponse.data.non_lues,
    resultats: ancien.resultats.map((n) => (uid && n.uid !== uid ? n : { ...n, lue: true })),
  })
  const lire = useMutation((uid) => clocheService.lue(uid), { onSuccess: (r, uid) => maj(r, uid) })
  const toutLire = useMutation(() => clocheService.toutLire(), { onSuccess: (r) => maj(r) })

  useEffect(() => {
    if (!ouvert) return undefined
    const dehors = (e) => { if (!conteneur.current?.contains(e.target)) setOuvert(false) }
    const echap = (e) => { if (e.key === 'Escape') setOuvert(false) }
    document.addEventListener('mousedown', dehors)
    document.addEventListener('keydown', echap)
    return () => {
      document.removeEventListener('mousedown', dehors)
      document.removeEventListener('keydown', echap)
    }
  }, [ouvert])

  const ouvrir = (notification) => {
    if (!notification.lue) lire.mutate(notification.uid)
    setOuvert(false)
    if (notification.url) navigate(notification.url)
  }

  return (
    <div ref={conteneur} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-label={nonLues ? `Notifications : ${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Notifications'}
        aria-expanded={ouvert}
        className="relative w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary-600 hover:border-primary-200 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-5 text-center ring-2 ring-white">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed left-4 right-4 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
              <p className="font-display font-bold text-gray-900">Notifications</p>
              {nonLues > 0 && (
                <button
                  type="button"
                  onClick={() => toutLire.mutate()}
                  disabled={toutLire.isLoading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                <BellOff className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                Aucune notification pour le moment.
              </div>
            ) : (
              <ul className="max-h-[70vh] sm:max-h-[26rem] overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li key={n.uid}>
                    <button
                      type="button"
                      onClick={() => ouvrir(n)}
                      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-sand-50 transition-colors ${n.lue ? '' : 'bg-primary-50/40'}`}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.lue ? 'bg-transparent' : 'bg-primary-500'}`} aria-hidden="true" />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm ${n.lue ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{n.titre}</span>
                        {n.message && <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</span>}
                        <span className="block text-[11px] text-gray-400 mt-1">{ilYa(n.created_at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
