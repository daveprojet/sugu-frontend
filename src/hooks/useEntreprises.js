import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { entrepriseService, missionService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const enListe = (d) => (Array.isArray(d) ? d : d?.results || [])
// Le suivi bouge (artisan affecté, arrivé…) : rafraîchi automatiquement.
const SUIVI_MS = 30 * 1000

// ── Entreprise ────────────────────────────────────────────

/** Profil de l'entreprise connectée (adresse, zone, position sur la carte). */
export function useMonEntreprise() {
  return useQuery('mon-entreprise', () => entrepriseService.moi().then((r) => r.data), { staleTime: 5 * 60 * 1000 })
}

/** Tableau de bord de l'entreprise : chiffres clés, actions en attente, délais, sites. */
export function useTableauEntreprise() {
  return useQuery('tableau-entreprise', () => entrepriseService.tableauDeBord().then((r) => r.data), {
    refetchInterval: SUIVI_MS, staleTime: 20 * 1000,
  })
}

/** Rapports mensuels (formules Pro et Premium). */
export function useRapportsMensuels() {
  return useQuery('rapports-entreprise', () => entrepriseService.rapports().then((r) => r.data))
}

/** Factures et relevés de l'entreprise (ceux de son site pour un responsable). */
export function useFacturesEntreprise() {
  return useQuery('factures-entreprise', () => entrepriseService.factures().then((r) => r.data), { refetchInterval: SUIVI_MS })
}

/** Paiement en ligne d'une facture : redirection vers PayTech. */
export function usePayerFacture() {
  return useMutation((uid) => entrepriseService.payerFacture(uid).then((r) => r.data), {
    onSuccess: (data) => {
      if (data.token) sessionStorage.setItem('paytech_token', data.token)
      if (data.redirect_url) window.location.href = data.redirect_url
    },
    onError: (e) => toast.error(extractApiError(e, 'Paiement impossible')),
  })
}

/** Abonnement : formule en vigueur, mois à payer, catalogue des formules. */
export function useAbonnementEntreprise() {
  return useQuery('abonnement-entreprise', () => entrepriseService.abonnement().then((r) => r.data))
}

/** Actions sur l'abonnement (compte principal) ; « payer » redirige vers PayTech. */
export function useActionAbonnement() {
  const qc = useQueryClient()
  return useMutation(({ action, ...data }) => entrepriseService.actionAbonnement(action, data).then((r) => r.data), {
    onSuccess: (data, { action }) => {
      // Quelque chose à payer (abonnement, formule supérieure) : direction la page de paiement PayTech.
      if (data.redirect_url) {
        if (data.token) sessionStorage.setItem('paytech_token', data.token)
        window.location.href = data.redirect_url
        return
      }
      qc.setQueryData('abonnement-entreprise', data.etat)
      qc.invalidateQueries('tableau-entreprise')
      toast.success({
        changer: 'Changement enregistré : il prend effet au mois suivant.',
        resilier: 'Résiliation enregistrée.',
        'annuler-resiliation': 'Résiliation annulée : votre abonnement continue.',
        'annuler-paiement': 'Paiement abandonné.',
      }[action] || 'C’est enregistré.')
    },
    onError: (e) => toast.error(extractApiError(e, 'Action impossible')),
  })
}

/** Sites de l'entreprise visibles par le compte (tous, ou le sien pour un responsable de site). */
export function useSitesEntreprise() {
  return useQuery('sites-entreprise', () => entrepriseService.sites().then((r) => r.data), { staleTime: 60 * 1000 })
}

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
    qc.invalidateQueries('tableau-entreprise')
  }
  const onError = (e) => toast.error(extractApiError(e, 'Action impossible'))
  return {
    annuler: useMutation((motif) => entrepriseService.annuler(uid, motif), {
      onSuccess: () => { rafraichir(); toast.success('Demande annulée.') }, onError,
    }),
    ajouterPhotos: useMutation((photos) => entrepriseService.ajouterPhotos(uid, photos), { onSuccess: rafraichir, onError }),
    supprimerPhoto: useMutation((photoUid) => entrepriseService.supprimerPhoto(uid, photoUid), { onSuccess: rafraichir, onError }),
    accordPortfolio: useMutation((accord) => entrepriseService.accordPortfolio(uid, accord), {
      onSuccess: rafraichir, onError,
    }),
    discuterDevis: useMutation(({ devisUid, message }) => entrepriseService.discuterDevis(uid, devisUid, message), {
      onSuccess: () => { rafraichir(); toast.success('Message envoyé : l’inspecteur Bricolibe revient vers vous.') }, onError,
    }),
    signerPv: useMutation(() => entrepriseService.signerPv(uid), {
      onSuccess: () => { rafraichir(); toast.success('Procès-verbal signé.') }, onError,
    }),
    noter: useMutation(({ note, commentaire }) => entrepriseService.noter(uid, note, commentaire), {
      onSuccess: () => { rafraichir(); toast.success('Merci pour votre note.') }, onError,
    }),
    reclamer: useMutation((donnees) => entrepriseService.reclamer(uid, donnees), {
      onSuccess: () => { rafraichir(); toast.success('Réclamation envoyée : l’inspecteur l’examine sous 72 heures.') }, onError,
    }),
    garantie: useMutation((donnees) => entrepriseService.garantie(uid, donnees).then((r) => r.data), {
      onSuccess: () => { rafraichir(); toast.success('Retour sous garantie ouvert : intervention offerte.') }, onError,
    }),
    replanifier: useMutation((donnees) => entrepriseService.replanifier(uid, donnees), {
      onSuccess: () => { rafraichir(); toast.success('Visite replanifiée.') }, onError,
    }),
    repondreDevis: useMutation(
      ({ devisUid, action, motif }) => entrepriseService.repondreDevis(uid, devisUid, action, motif),
      {
        onSuccess: (_, { action }) => {
          rafraichir()
          toast.success(action === 'accepter'
            ? 'Devis accepté : l’intervention peut commencer.'
            : 'Devis refusé : l’inspecteur Bricolibe en est informé.')
        },
        onError,
      },
    ),
  }
}

/** Enregistre un PDF reçu de l'API (réponse axios en blob). */
export async function telechargerPdf(promesse, nom) {
  try {
    const { data } = await promesse
    const url = URL.createObjectURL(data)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nom
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    toast.error(extractApiError(e, 'Téléchargement impossible'))
  }
}

export const fcfa = (montant) => (montant == null ? '—' : `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA`)

export const STATUTS_DEVIS = {
  PROPOSE:  { label: 'En cours de validation', classe: 'bg-amber-50 text-amber-700' },
  VALIDE:   { label: 'À accepter', classe: 'bg-sky-50 text-sky-700' },
  REFUSE:   { label: 'Refusé par l’inspecteur', classe: 'bg-red-50 text-red-700' },
  ACCEPTE:  { label: 'Accepté', classe: 'bg-emerald-50 text-emerald-700' },
  REJETE:   { label: 'Refusé par l’entreprise', classe: 'bg-red-50 text-red-700' },
  REMPLACE: { label: 'Remplacé', classe: 'bg-gray-100 text-gray-600' },
}

// ── Artisan : missions entreprises ───────────────────────

export function useMissions(etat = 'en_cours', options = {}) {
  return useQuery(
    ['missions-entreprises', etat],
    () => missionService.list(etat).then((r) => enListe(r.data)),
    { refetchInterval: SUIVI_MS, ...options },
  )
}

/** Résultats de l'ouvrier sur les missions entreprises (interventions, ponctualité, notes). */
export function useMesResultats() {
  return useQuery('mes-resultats-entreprises', () => missionService.mesResultats().then((r) => r.data), { staleTime: 60 * 1000 })
}

/** Zone de l'ouvrier partenaire et son référent (ou s'il est lui-même référent). */
export function useMaZone() {
  return useQuery(['ma-zone-entreprises'], () => missionService.maZone().then((r) => r.data), { staleTime: 5 * 60 * 1000 })
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
    publierPortfolio: useMutation((publier) => missionService.publierPortfolio(uid, publier), {
      onSuccess: (reponse) => rafraichir(reponse), onError,
    }),
    proposerDevis: useMutation((data) => missionService.proposerDevis(uid, data), {
      onSuccess: (reponse) => {
        rafraichir(reponse)
        toast.success('Devis envoyé à l’inspecteur pour validation.', { position: 'top-center' })
      },
      onError,
    }),
  }
}

export const STATUTS_DEMANDE_ENTREPRISE = {
  NOUVELLE:        { label: 'Reçue · recherche d’un ouvrier', classe: 'bg-amber-50 text-amber-700' },
  ARTISAN_AFFECTE: { label: 'Ouvrier affecté', classe: 'bg-sky-50 text-sky-700' },
  EN_COURS:        { label: 'Intervention en cours', classe: 'bg-indigo-50 text-indigo-700' },
  A_INSPECTER:     { label: 'Terminée · contrôle qualité', classe: 'bg-orange-50 text-orange-700' },
  CLOTUREE:        { label: 'Clôturée', classe: 'bg-emerald-50 text-emerald-700' },
  ANNULEE:         { label: 'Annulée', classe: 'bg-gray-100 text-gray-600' },
  INSPECTION_REFUSEE: { label: 'Contrôle qualité : en cours de règlement', classe: 'bg-red-50 text-red-700' },
}

/** Niveaux d'urgence de la charte (article 6) ; délais pour la formule à la prestation. */
export const URGENCES = [
  ['URGENCE', 'Urgence', 'Coupure de courant, fuite d’eau, climatisation de salle serveur en panne… Intervention sous 24 h.'],
  ['NORMAL', 'Normal', 'Prise défectueuse, robinet qui fuit, porte qui ferme mal… Intervention sous 48 h.'],
  ['PLANIFIE', 'Planifié', 'Installation, entretien, petits travaux : à la date que vous choisissez.'],
]

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
