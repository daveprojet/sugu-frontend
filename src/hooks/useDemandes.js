import { useQuery, useMutation, useQueryClient } from 'react-query'
import { demandeService } from '@/services/api'
import { toast } from 'react-toastify'

export function useDemandes(params = {}) {
  return useQuery(
    ['demandes', params],
    () => demandeService.list(params).then(r => {
      const d = r.data
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.results)) return d.results
      return []
    }),
    { staleTime: 1000 * 30 }
  )
}

export function useDemande(id) {
  return useQuery(
    ['demande', id],
    () => demandeService.detail(id).then(r => r.data),
    { enabled: !!id }
  )
}

export function useCreateDemande() {
  const qc = useQueryClient()
  return useMutation(
    (data) => demandeService.create(data),
    {
      onSuccess: () => {
        qc.invalidateQueries('demandes')
        toast.success('Demande envoyée avec succès !')
      },
      onError: (e) => toast.error('Erreur lors de l\'envoi de la demande '),
    }
  )
}

export function useUpdateDemande() {
  const qc = useQueryClient()
  return useMutation(
    ({ id, data }) => demandeService.update(id, data),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries(['demande', id])
        qc.invalidateQueries('demandes')
      },
    }
  )
}
