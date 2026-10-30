const PHOTON_URL = 'https://photon.komoot.io/api/'

// Rectangle englobant le Sénégal, et priorité aux résultats proches de Dakar.
const BBOX_SENEGAL = '-17.7,12.2,-11.3,16.8'
const CENTRE_DAKAR = { lat: 14.7167, lon: -17.4677 }

const NB_DEMANDES = 15
const NB_AFFICHES = 6

// Quartiers et localités d'abord : c'est ce que cherchent les utilisateurs, avant les commerces.
const TYPES_LIEUX = new Set([
  'suburb', 'neighbourhood', 'quarter', 'city', 'town', 'village', 'hamlet', 'locality', 'district',
])

export function formaterResultats(reponse) {
  const vus = new Set()
  const resultats = []

  for (const { geometry, properties: p } of reponse?.features || []) {
    // Le rectangle déborde sur les pays voisins, comme la Gambie.
    if (p.countrycode !== 'SN' || !p.name || !geometry?.coordinates) continue

    const ville = p.city && p.city !== p.name ? p.city : p.state
    const zone = p.district && p.district !== p.name ? p.district : p.locality
    const cle = [p.name, zone, ville].join('|').toLowerCase()
    if (vus.has(cle)) continue
    vus.add(cle)

    const [longitude, latitude] = geometry.coordinates
    resultats.push({
      cle,
      nom: p.name,
      details: [zone, ville].filter((v) => v && v !== p.name).join(', '),
      latitude,
      longitude,
      estLieu: TYPES_LIEUX.has(p.osm_value),
    })
  }

  return [...resultats.filter((r) => r.estLieu), ...resultats.filter((r) => !r.estLieu)].slice(0, NB_AFFICHES)
}

export async function rechercherAdresses(texte, signal) {
  const params = new URLSearchParams({
    q: texte,
    limit: NB_DEMANDES,
    lang: 'fr',
    bbox: BBOX_SENEGAL,
    lat: CENTRE_DAKAR.lat,
    lon: CENTRE_DAKAR.lon,
  })
  const reponse = await fetch(`${PHOTON_URL}?${params}`, { signal })
  if (!reponse.ok) throw new Error(`Photon ${reponse.status}`)
  return formaterResultats(await reponse.json())
}
