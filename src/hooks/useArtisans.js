import { useQuery, useMutation, useQueryClient } from 'react-query'
import { artisanService, dossierProService, identiteService } from '@/services/api'
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
          || error.response?.data?.selfie?.[0]
          || error.response?.data?.type_piece?.[0]
          || 'Erreur lors du téléchargement'
        toast.error(msg)
      },
    }
  )
}

export function useDossierPro(uid) {
  return useQuery(
    ['artisan-dossier', uid],
    () => dossierProService.get(uid).then(r => r.data).catch((error) => {
      // Pas encore de dossier : on affiche un formulaire vide.
      if (error.response?.status === 404) return null
      throw error
    }),
    { enabled: !!uid }
  )
}

function useDossierMutation(fn, successMessage) {
  const qc = useQueryClient()
  return useMutation(fn, {
    onSuccess: (response, { uid }) => {
      qc.setQueryData(['artisan-dossier', uid], response.data)
      qc.invalidateQueries(['artisan', uid])
      toast.success(successMessage)
    },
    onError: (error) => {
      const data = error.response?.data || {}
      const first = Object.values(data).flat()[0]
      toast.error(data.detail || data.non_field_errors?.[0] || (typeof first === 'string' ? first : 'Erreur lors de l\'envoi'))
    },
  })
}

export function useSaveDossierPro() {
  return useDossierMutation(({ uid, data }) => dossierProService.save(uid, data), 'Dossier enregistré !')
}

export function useAjouterDocumentPro() {
  return useDossierMutation(({ uid, formData }) => dossierProService.addDocument(uid, formData), 'Justificatif ajouté !')
}

export function useSupprimerDocumentPro() {
  return useDossierMutation(({ uid, docUid }) => dossierProService.removeDocument(uid, docUid), 'Justificatif supprimé')
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
