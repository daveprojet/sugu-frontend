import { useQuery, useMutation, useQueryClient } from 'react-query'
import { artisanService, identiteService } from '@/services/api'
import { toast } from 'react-toastify'

export function useArtisans(filters = {}) {
  return useQuery(
    ['artisans', filters],
    () => artisanService.list(filters).then(r => r.data),
    { keepPreviousData: true, staleTime: 1000 * 60 * 2 }
  )
}

export function useArtisan(uid) {
  return useQuery(
    ['artisan', uid],
    () => artisanService.detail(uid).then(r => r.data),
    { enabled: !!uid }
  )
}

export function useArtisanAvis(uid, params = {}) {
  return useQuery(
    ['artisan-avis', uid, params],
    () => artisanService.avis(uid, params).then(r => r.data),
    { enabled: !!uid }
  )
}

export function useUpdateArtisan() {
  const qc = useQueryClient()
  return useMutation(
    ({ uid, data }) => artisanService.update(uid, data),
    {
      onSuccess: (_, { uid }) => {
        qc.invalidateQueries(['artisan', uid])
        toast.success('Profil mis à jour !')
      },
      onError: () => toast.error('Erreur lors de la mise à jour'),
    }
  )
}

export function useIdentite(uid) {
  return useQuery(
    ['artisan-identite', uid],
    () => identiteService.get(uid).then(r => r.data),
    { enabled: !!uid }
  )
}

export function useUploadIdentite() {
  const qc = useQueryClient()
  return useMutation(
    ({ uid, formData }) => identiteService.upsert(uid, formData),
    {
      onSuccess: (_, { uid }) => {
        qc.invalidateQueries(['artisan-identite', uid])
        qc.invalidateQueries(['artisan', uid])
        toast.success('Pièce d\'identité mise à jour !')
      },
      onError: (error) => {
        const msg = error.response?.data?.detail
          || error.response?.data?.recto?.[0]
          || error.response?.data?.verso?.[0]
          || error.response?.data?.type_piece?.[0]
          || 'Erreur lors du téléchargement'
        toast.error(msg)
      },
    }
  )
}

export function useUploadArtisanPhoto() {
  const qc = useQueryClient()
  return useMutation(
    ({ uid, file }) => artisanService.uploadPhoto(uid, file),
    {
      onSuccess: (_, { uid }) => {
        qc.invalidateQueries(['artisan', uid])
        toast.success('Photo de profil mise à jour !')
      },
      onError: () => toast.error('Erreur lors du téléchargement'),
    }
  )
}
