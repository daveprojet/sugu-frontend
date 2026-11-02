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
export async function chercherZoneProche(latitude, longitude, nom) {
  try {
    const { data } = await zoneService.proche(latitude, longitude, nom)
    return data
  } catch {
    return { ville: null, quartier: null }
  }
}
