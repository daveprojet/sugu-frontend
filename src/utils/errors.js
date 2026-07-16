/**
 * Extrait un message d'erreur lisible depuis une réponse API DRF.
 *
 * Formats gérés :
 *  - { detail: "..." }
 *  - { non_field_errors: ["..."] }
 *  - { telephone: ["..."], password: ["..."], ... }  (erreurs par champ)
 */
export function extractApiError(error, fallback = "Une erreur est survenue") {
  const data = error?.response?.data
  if (!data) return fallback

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
