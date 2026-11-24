// Numéro WhatsApp de l'assistance Bricolibe : les artisans y envoient leurs
// photos, vidéos et pièce d'identité, et l'équipe les dépose sur leur profil.
export const WHATSAPP_BRICOLIBE = '+221 77 865 65 62'
const NUMERO_WA = '221778656562'

/** Lien WhatsApp avec un message prérempli : nom et téléphone, pour retrouver le profil. */
export function lienWhatsappProfil(user) {
  const nom = [user?.prenom, user?.nom].filter(Boolean).join(' ')
  const message = [
    'Bonjour Bricolibe,',
    `je suis ${nom || 'artisan'}${user?.telephone ? ` (${user.telephone})` : ''}.`,
    'Je vous envoie mes photos et vidéos pour mon profil :',
  ].join('\n')
  return `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(message)}`
}
