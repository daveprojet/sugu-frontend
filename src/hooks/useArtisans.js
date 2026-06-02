import { useQuery, useMutation, useQueryClient } from 'react-query'
import { artisanService } from '@/services/api'
import { toast } from 'react-toastify'

export function useArtisans(filters = {}) {
  return useQuery(
    ['artisans', filters],
    () => artisanService.list(filters).then(r => r.data),
    { keepPreviousData: true, staleTime: 1000 * 60 * 2 }
  )
}

export function useArtisan(id) {
  return useQuery(
    ['artisan', id],
    () => artisanService.detail(id).then(r => r.data),
    { enabled: !!id }
  )
}

export function useArtisanAvis(id) {
  return useQuery(
    ['artisan-avis', id],
    () => artisanService.avis(id).then(r => r.data),
    { enabled: !!id }
  )
}

export function useUpdateArtisan() {
  const qc = useQueryClient()
  return useMutation(
    ({ id, data }) => artisanService.update(id, data),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries(['artisan', id])
        toast.success('Profil mis à jour !')
      },
      onError: () => toast.error('Erreur lors de la mise à jour'),
    }
  )
}
