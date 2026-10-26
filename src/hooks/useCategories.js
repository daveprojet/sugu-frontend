import { useQuery } from 'react-query'
import { categorieService } from '@/services/api'

export function useCategories() {
  return useQuery(
    'categories',
    () => categorieService.list().then(r => r.data),
    { staleTime: 1000 * 60 * 10 }
  )
}

export function useCategorie(uid) {
  return useQuery(
    ['categorie', uid],
    () => categorieService.detail(uid).then(r => r.data),
    { enabled: !!uid }
  )
}
