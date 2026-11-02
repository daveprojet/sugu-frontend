// Le rappel de pièce d'identité revient à chaque connexion. Une fois fermé, il reste
// masqué le temps de la session du navigateur, pour ne pas revenir à chaque page.
const CLE = 'bricolibe.rappelIdentiteVu'

export function rappelIdentiteVu() {
  try {
    return sessionStorage.getItem(CLE) === '1'
  } catch {
    return false
  }
}

export function marquerRappelIdentiteVu() {
  try {
    sessionStorage.setItem(CLE, '1')
  } catch {
    // Stockage indisponible : le rappel reviendra au prochain chargement.
  }
}

export function reinitialiserRappelIdentite() {
  try {
    sessionStorage.removeItem(CLE)
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}
