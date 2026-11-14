// Où envoyer un utilisateur après connexion ou inscription.

/** Chemin interne sûr passé en ?redirect= (jamais un autre site), sinon null. */
export function redirectionDemandee(searchParams) {
  const redirect = searchParams.get('redirect')
  return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : null
}

/** Espace de chacun : ses demandes (client, artisan), ses missions (artisan
 * uniquement partenaire) ou l'espace entreprise. */
export function espaceParDefaut(user) {
  if (user?.role === 'artisan') {
    return user.independant === false ? '/dashboard-artisan/missions-entreprises' : '/dashboard-artisan'
  }
  if (user?.role === 'entreprise') return '/espace-entreprise'
  return '/dashboard-client'
}

/** Garde ?redirect= d'une page de connexion à l'autre (connexion ↔ inscription). */
export function avecRedirection(chemin, searchParams) {
  const redirect = redirectionDemandee(searchParams)
  return redirect ? `${chemin}?redirect=${encodeURIComponent(redirect)}` : chemin
}
