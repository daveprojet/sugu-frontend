// Adresses publiques des artisans (référencement).
//   Profil : /artisans/<prenom-nom>-<uid>  (l'ancienne forme /artisans/<uid> reste valable)
//   Page métier : /artisans/<metier>[/<ville>]

const RE_UID = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

/** uid d'un segment « prenom-nom-<uid> » ou « <uid> », sinon null (c'est alors une page métier). */
export function extraireUid(segment) {
  const trouve = RE_UID.exec(segment || '')
  return trouve ? trouve[1].toLowerCase() : null
}

/** Lien vers le profil : l'adresse lisible fournie par l'API, sinon la forme courte. */
export function lienArtisan(artisan) {
  return artisan?.chemin || `/artisans/${artisan?.uid}`
}
