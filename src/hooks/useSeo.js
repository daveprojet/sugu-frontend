import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Référencement : titre, description, lien canonique, robots et balises de partage
 * (Open Graph / Twitter) de chaque page.
 *
 * GestionSeo (dans App) pose les valeurs de la route à chaque changement d'adresse,
 * dans un useLayoutEffect ; une page dynamique (profil d'artisan) les précise ensuite
 * avec useSeo, dans un useEffect : les effets de mise en page passent toujours avant,
 * la page a donc le dernier mot.
 */

export const SITE_URL = 'https://bricolibe.com'
const NOM = 'Bricolibe'
const TITRE_DEFAUT = 'Trouver un artisan au Sénégal | Bricolibe'
const DESCRIPTION_DEFAUT =
  'Trouver un artisan au Sénégal : plombiers, électriciens, menuisiers et autres artisans vérifiés près de chez vous.'
const IMAGE_DEFAUT = `${SITE_URL}/images/logo-512.png`
// Seul le site de production est indexé : l'UAT et le poste local restent hors des moteurs.
const HOTES_INDEXES = ['bricolibe.com']

// Pages publiques : titre et description propres.
const PAGES = {
  '/': {
    titre: TITRE_DEFAUT,
    description: 'Trouver un artisan au Sénégal : plombiers, électriciens, menuisiers, maçons vérifiés près de chez vous. Comparez les avis et demandez une intervention.',
  },
  '/artisans': {
    titre: 'Trouver les artisans près de chez vous au Sénégal | Bricolibe',
    description: 'Trouver les artisans près de chez vous à Dakar et au Sénégal : métiers, quartiers, avis clients et disponibilités.',
  },
  '/a-propos': {
    titre: 'À propos de Bricolibe',
    description: 'Bricolibe met en relation particuliers, entreprises et artisans qualifiés au Sénégal.',
  },
  '/contact': {
    titre: 'Contact | Bricolibe',
    description: 'Une question, un souci avec une intervention ? Contactez l’équipe Bricolibe.',
  },
  '/devenir-partenaire': {
    titre: 'Devenir partenaire | Bricolibe',
    description: 'Entreprise ou artisan : rejoignez le réseau de partenaires Bricolibe.',
  },
  '/inscription-artisan': {
    titre: 'Inscription artisan | Bricolibe',
    description: 'Artisan au Sénégal ? Créez votre profil Bricolibe gratuitement et recevez des demandes de clients près de chez vous.',
  },
  '/marketplace': {
    titre: 'Acheter des œuvres d’art au Sénégal | Marketplace Bricolibe',
    description: 'Peintures, sculptures, bijoux, céramiques : achetez des œuvres uniques directement auprès d’artistes sénégalais vérifiés, sans intermédiaire.',
  },
  '/marketplace/devenir-artiste': {
    titre: 'Vendre vos œuvres d’art au Sénégal | Marketplace Bricolibe',
    description: 'Peintres, sculpteurs, bijoutiers, céramistes : exposez et vendez vos œuvres sur la Marketplace Bricolibe. Les acheteurs vous contactent directement, sans commission.',
  },
  '/cgu': { titre: 'Conditions générales d’utilisation | Bricolibe' },
  '/confidentialite': { titre: 'Politique de confidentialité | Bricolibe' },
  '/connexion': { titre: 'Connexion | Bricolibe', noindex: true },
  '/inscription': { titre: 'Inscription | Bricolibe', noindex: true },
}

// Pages publiques à motif (le contenu précis est posé par la page elle-même).
const MOTIFS = [
  [/^\/marketplace\/oeuvres\/[^/]+$/, { titre: 'Œuvre | Marketplace Bricolibe' }],
  [/^\/marketplace\/artistes\/[^/]+$/, { titre: 'Artiste | Marketplace Bricolibe' }],
  [/^\/artisans\/[^/]+\/avis$/, { titre: 'Avis clients | Bricolibe' }],
  [/^\/artisans\/[^/]+$/, { titre: 'Artisans | Bricolibe' }],
  [/^\/artisans\/[^/]+\/[^/]+$/, { titre: 'Artisans | Bricolibe' }],
]

const PUBLIQUES = new Set(Object.keys(PAGES))

/** Valeurs d'une adresse ; toute page non publique (espaces privés, paiement, 404…) est en noindex. */
export function seoDeLaRoute(pathname) {
  const chemin = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (PUBLIQUES.has(chemin)) return { chemin, ...PAGES[chemin] }
  const motif = MOTIFS.find(([regex]) => regex.test(chemin))
  if (motif) return { chemin, ...motif[1] }
  return { chemin, titre: NOM, noindex: true }
}

function meta(attribut, cle, valeur) {
  let balise = document.head.querySelector(`meta[${attribut}="${cle}"]`)
  if (!balise) {
    balise = document.createElement('meta')
    balise.setAttribute(attribut, cle)
    document.head.appendChild(balise)
  }
  balise.setAttribute('content', valeur)
}

function canonique(href) {
  let lien = document.head.querySelector('link[rel="canonical"]')
  if (!lien) {
    lien = document.createElement('link')
    lien.setAttribute('rel', 'canonical')
    document.head.appendChild(lien)
  }
  lien.setAttribute('href', href)
}

export function appliquerSeo({ chemin, titre, description, image, noindex, type = 'website' }) {
  const t = titre || TITRE_DEFAUT
  const d = description || DESCRIPTION_DEFAUT
  const img = image || IMAGE_DEFAUT
  const url = `${SITE_URL}${chemin}`
  const indexable = !noindex && HOTES_INDEXES.includes(window.location.hostname)

  document.title = t
  meta('name', 'description', d)
  meta('name', 'robots', indexable ? 'index, follow' : 'noindex, nofollow')
  canonique(url)
  meta('property', 'og:site_name', NOM)
  meta('property', 'og:locale', 'fr_SN')
  meta('property', 'og:type', type)
  meta('property', 'og:title', t)
  meta('property', 'og:description', d)
  meta('property', 'og:url', url)
  meta('property', 'og:image', img)
  meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  meta('name', 'twitter:title', t)
  meta('name', 'twitter:description', d)
  meta('name', 'twitter:image', img)
}

/** Dans App : valeurs de la route à chaque changement d'adresse. */
export function GestionSeo() {
  const { pathname } = useLocation()
  useLayoutEffect(() => { appliquerSeo(seoDeLaRoute(pathname)) }, [pathname])
  return null
}

/** Dans une page dynamique : précise les valeurs une fois les données chargées (rien si `seo` est nul). */
export function useSeo(seo) {
  const { pathname } = useLocation()
  const cle = seo ? JSON.stringify(seo) : null
  useEffect(() => {
    if (!cle) return
    appliquerSeo({ ...seoDeLaRoute(pathname), ...JSON.parse(cle) })
  }, [cle, pathname])
}
