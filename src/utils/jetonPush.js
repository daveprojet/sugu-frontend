// Jeton push de ce navigateur, gardé pour le retirer du compte à la déconnexion.
const CLE = 'bricolibe-jeton-push'

export function memoriserJetonPush(token) {
  try {
    localStorage.setItem(CLE, token)
  } catch {
    // stockage indisponible : le jeton sera réattaché à la prochaine connexion
  }
}

export function oublierJetonPush() {
  try {
    const token = localStorage.getItem(CLE)
    localStorage.removeItem(CLE)
    return token
  } catch {
    return null
  }
}
