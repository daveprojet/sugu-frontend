// Photos envoyées avec les demandes : réduites dans le navigateur avant envoi.
// Une photo de téléphone pèse 3 à 8 Mo ; réduite à 1600 px elle tombe vers
// 200-400 Ko — moins de data mobile, et l'envoi reste sous la limite serveur.

export const MAX_PHOTOS_PAR_ETAPE = 5
export const TYPES_PHOTO_ACCEPTES = 'image/jpeg,image/png,image/webp'

const COTE_MAX = 1600
const QUALITE = 0.8
const TAILLE_MAX_OCTETS = 5 * 1024 * 1024

const chargerImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('illisible')) }
    img.src = url
  })

/**
 * Réduit une image (JPEG, PNG, WEBP) et la renvoie en JPEG.
 * Lève une Error au message lisible si le fichier n'est pas utilisable.
 */
export async function compresserImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`« ${file.name} » n'est pas une image.`)
  }
  let img
  try {
    img = await chargerImage(file)
  } catch {
    // Format que le navigateur ne sait pas lire (ex. HEIC sur certains Android/PC).
    throw new Error(`« ${file.name} » : format non pris en charge. Utilisez une photo JPG ou PNG.`)
  }

  const ratio = Math.min(1, COTE_MAX / Math.max(img.naturalWidth, img.naturalHeight))
  const largeur = Math.round(img.naturalWidth * ratio)
  const hauteur = Math.round(img.naturalHeight * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = largeur
  canvas.height = hauteur
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, largeur, hauteur)
  ctx.drawImage(img, 0, 0, largeur, hauteur)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITE))
  if (!blob) throw new Error(`« ${file.name} » n'a pas pu être préparée.`)
  if (blob.size > TAILLE_MAX_OCTETS) throw new Error(`« ${file.name} » est trop lourde (5 Mo maximum).`)

  const nom = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${nom}.jpg`, { type: 'image/jpeg' })
}
