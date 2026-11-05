import { useQuery } from 'react-query'
import { zoneService } from '@/services/api'

export function useZones() {
  return useQuery(
    'zones',
    () => zoneService.list().then(r => r.data),
    { staleTime: 1000 * 60 * 60 }
  )
}

/** Ville et quartier d'un point de la carte ; une panne laisse simplement le choix à l'utilisateur. */
// `noms` : lieu choisi ou quartier précis ; `communes` : zone plus large, essayée en repli.
export async function chercherZoneProche(latitude, longitude, noms = [], communes = []) {
  try {
    const { data } = await zoneService.proche(latitude, longitude, noms, communes)
    return data
  } catch {
    return { ville: null, quartier: null }
  }
}
