import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { entrepriseService, missionService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const enListe = (d) => (Array.isArray(d) ? d : d?.results || [])
// Le suivi bouge (artisan affecté, arrivé…) : rafraîchi automatiquement.
const SUIVI_MS = 30 * 1000

// ── Entreprise ────────────────────────────────────────────

export function useDemandesEntreprise(params = {}) {
  return useQuery(
    ['demandes-entreprise', params],
    () => entrepriseService.demandes(params).then((r) => enListe(r.data)),
    { refetchInterval: SUIVI_MS },
  )
}

export function useDemandeEntreprise(uid) {
  return useQuery(
    ['demande-entreprise', uid],
    () => entrepriseService.demande(uid).then((r) => r.data),
    { enabled: !!uid, refetchInterval: SUIVI_MS },
  )
}

export function useCreerDemandeEntreprise() {
  const qc = useQueryClient()
  return useMutation((data) => entrepriseService.creer(data).then((r) => r.data), {
    onSuccess: () => {
      qc.invalidateQueries('demandes-entreprise')
      toast.success('Demande envoyée : un inspecteur Bricolibe va la prendre en charge.')
    },
    onError: (e) => toast.error(extractApiError(e, "Erreur lors de l'envoi de la demande")),
  })
}

export function useActionDemandeEntreprise(uid) {
  const qc = useQueryClient()
  const rafraichir = () => {
    qc.invalidateQueries(['demande-entreprise', uid])
    qc.invalidateQueries('demandes-entreprise')
  }
  const onError = (e) => toast.error(extractApiError(e, 'Action impossible'))
  return {
    annuler: useMutation((motif) => entrepriseService.annuler(uid, motif), {
      onSuccess: () => { rafraichir(); toast.success('Demande annulée.') }, onError,
    }),
    ajouterPhotos: useMutation((photos) => entrepriseService.ajouterPhotos(uid, photos), { onSuccess: rafraichir, onError }),
    supprimerPhoto: useMutation((photoUid) => entrepriseService.supprimerPhoto(uid, photoUid), { onSuccess: rafraichir, onError }),
  }
}

// ── Artisan : missions entreprises ───────────────────────

export function useMissions(etat = 'en_cours') {
  return useQuery(
    ['missions-entreprises', etat],
    () => missionService.list(etat).then((r) => enListe(r.data)),
    { refetchInterval: SUIVI_MS },
  )
}

export function useMission(uid) {
  return useQuery(['mission-entreprise', uid], () => missionService.detail(uid).then((r) => r.data), {
    enabled: !!uid, refetchInterval: SUIVI_MS,
  })
}

export function useActionMission(uid) {
  const qc = useQueryClient()
  // En haut d'écran : en bas, le message masquerait la barre d'actions du chantier.
  const onError = (e) => toast.error(extractApiError(e, 'Action impossible'), { position: 'top-center' })
  const rafraichir = (data) => {
    if (data?.data?.uid) qc.setQueryData(['mission-entreprise', uid], data.data)
    qc.invalidateQueries(['mission-entreprise', uid])
    qc.invalidateQueries('missions-entreprises')
  }
  return {
    action: useMutation(({ action, data }) => missionService.action(uid, action, data), { onSuccess: rafraichir, onError }),
    ajouterPhotos: useMutation(({ type, photos }) => missionService.ajouterPhotos(uid, type, photos), {
      onSuccess: () => rafraichir(), onError,
    }),
    supprimerPhoto: useMutation((photoUid) => missionService.supprimerPhoto(uid, photoUid), {
      onSuccess: () => rafraichir(), onError,
    }),
  }
}

export const STATUTS_DEMANDE_ENTREPRISE = {
  NOUVELLE:        { label: 'Reçue · recherche d’un artisan', classe: 'bg-amber-50 text-amber-700' },
  ARTISAN_AFFECTE: { label: 'Artisan affecté', classe: 'bg-sky-50 text-sky-700' },
  EN_COURS:        { label: 'Intervention en cours', classe: 'bg-indigo-50 text-indigo-700' },
  A_INSPECTER:     { label: 'Terminée · contrôle qualité', classe: 'bg-violet-50 text-violet-700' },
  CLOTUREE:        { label: 'Clôturée', classe: 'bg-emerald-50 text-emerald-700' },
  ANNULEE:         { label: 'Annulée', classe: 'bg-gray-100 text-gray-600' },
}

export const STATUTS_MISSION = {
  PROPOSEE: { label: 'À accepter', classe: 'bg-amber-50 text-amber-700' },
  ACCEPTEE: { label: 'Acceptée', classe: 'bg-sky-50 text-sky-700' },
  SUR_SITE: { label: 'Sur site', classe: 'bg-indigo-50 text-indigo-700' },
  TERMINEE: { label: 'Terminée', classe: 'bg-emerald-50 text-emerald-700' },
  REFUSEE:  { label: 'Refusée', classe: 'bg-gray-100 text-gray-600' },
  RETIREE:  { label: 'Annulée', classe: 'bg-gray-100 text-gray-600' },
}

export const dateHeure = (value) => (value
  ? new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : '—')
