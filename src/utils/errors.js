const NETWORK_ERROR_MESSAGE =
  "Impossible de joindre le serveur. Vérifiez votre connexion internet ou réessayez dans quelques instants."
const SERVER_UNAVAILABLE_MESSAGE =
  "Nos serveurs sont momentanément indisponibles. Veuillez réessayer dans quelques instants."
const SERVER_ERROR_MESSAGE =
  "Le serveur a rencontré un problème et n'a pas pu traiter votre demande. Veuillez réessayer dans quelques instants."

/**
 * Message à afficher quand l'échec vient du réseau ou du serveur, et non de ce
 * que l'utilisateur a saisi. Renvoie null dans les autres cas.
 *
 * Une 502 du proxy arrive sans en-têtes CORS : le navigateur la présente comme
 * une erreur réseau, d'où un message qui couvre aussi la panne du serveur.
 */
export function getServerErrorMessage(error) {
  if (!error?.isAxiosError) return null
  if (error.code === "ERR_CANCELED") return null

  const status = error.response?.status
  if (!status) return NETWORK_ERROR_MESSAGE
  if ([502, 503, 504].includes(status)) return SERVER_UNAVAILABLE_MESSAGE
  if (status >= 500) return SERVER_ERROR_MESSAGE
  return null
}

// Serveur injoignable, en erreur ou saturé : la session reste peut-être valide.
export function isTransientError(error) {
  const status = error?.response?.status
  return !status || status >= 500 || status === 429
}

/**
 * Extrait un message d'erreur lisible depuis une réponse API DRF.
 *
 * Formats gérés :
 *  - { detail: "..." }
 *  - { non_field_errors: ["..."] }
 *  - { telephone: ["..."], password: ["..."], ... }  (erreurs par champ)
 *
 * Les pannes réseau et serveur ont leur propre message, et une réponse qui n'est
 * pas un objet JSON (page HTML d'un proxy) n'est jamais affichée telle quelle.
 */
export function extractApiError(error, fallback = "Une erreur est survenue") {
  const serverMessage = getServerErrorMessage(error)
  if (serverMessage) return serverMessage

  const data = error?.response?.data
  if (!data || typeof data !== "object") return fallback

  if (data.detail) return data.detail

  if (data.non_field_errors) {
    const msgs = Array.isArray(data.non_field_errors)
      ? data.non_field_errors
      : [data.non_field_errors]
    return msgs.join(". ")
  }

  const fieldMessages = Object.entries(data)
    .filter(([, val]) => val != null && val !== "")
    .map(([field, msgs]) => {
      const list = Array.isArray(msgs) ? msgs : [msgs]
      const label = field.charAt(0).toUpperCase() + field.slice(1)
      return `${label} : ${list.join(", ")}`
    })

  if (fieldMessages.length > 0) return fieldMessages.join(". ")

  return fallback
}
