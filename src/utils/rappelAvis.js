// Rappel d'avis après une prestation terminée, retenu dans ce navigateur (pas sur le serveur) :
// - une seule proposition par session de navigation ;
// - « Plus tard » (ou fermeture) : pas avant DELAI_RELANCE_MS pour cette prestation ;
// - au plus NB_MAX_RAPPELS propositions par prestation, puis on arrête ;
// - « Ne plus me demander » : arrêt immédiat pour cette prestation.
const CLE = 'bricolibe.rappelsAvis'
const CLE_SESSION = 'bricolibe.rappelAvisSession'

export const DELAI_APRES_FIN_MS = 60 * 60 * 1000 // 1 h après la fin de la prestation
export const FENETRE_MS = 30 * 24 * 60 * 60 * 1000 // prestations terminées il y a moins de 30 jours
export const DELAI_RELANCE_MS = 3 * 24 * 60 * 60 * 1000 // 3 jours entre deux propositions
export const NB_MAX_RAPPELS = 3

function lire() {
  try {
    return JSON.parse(localStorage.getItem(CLE) || '{}') || {}
  } catch {
    return {}
  }
}

function ecrire(etat) {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat))
  } catch {
    // Stockage indisponible : le rappel pourra revenir plus tôt, sans gravité.
  }
}

export function dejaProposeCetteSession() {
  try {
    return sessionStorage.getItem(CLE_SESSION) === '1'
  } catch {
    return false
  }
}

function marquerSession() {
  try {
    sessionStorage.setItem(CLE_SESSION, '1')
  } catch {
    // Stockage indisponible : rien à retenir.
  }
}

/** Prestation pour laquelle proposer un avis maintenant (la plus récemment terminée), ou null. */
export function prestationAEvaluer(demandes, maintenant = Date.now()) {
  if (dejaProposeCetteSession()) return null
  const etat = lire()
  const candidates = demandes.filter((demande) => {
    if (demande.statut !== 'TERMINEE' || demande.avis_id) return false
    const fin = new Date(demande.terminee_at || demande.updated_at).getTime()
    if (!fin || maintenant - fin < DELAI_APRES_FIN_MS || maintenant - fin > FENETRE_MS) return false
    const suivi = etat[demande.id]
    if (!suivi) return true
    return !suivi.stop && (suivi.nb || 0) < NB_MAX_RAPPELS && (suivi.prochain || 0) <= maintenant
  })
  candidates.sort((a, b) => new Date(b.terminee_at || b.updated_at) - new Date(a.terminee_at || a.updated_at))
  return candidates[0] || null
}

/** Le modal vient de s'afficher : compte la proposition et programme la suivante. */
export function noterProposition(demandeId, maintenant = Date.now()) {
  marquerSession()
  const etat = lire()
  const suivi = etat[demandeId] || {}
  etat[demandeId] = { ...suivi, nb: (suivi.nb || 0) + 1, prochain: maintenant + DELAI_RELANCE_MS }
  ecrire(etat)
}

export function nePlusDemander(demandeId) {
  const etat = lire()
  etat[demandeId] = { ...(etat[demandeId] || {}), stop: true }
  ecrire(etat)
}
