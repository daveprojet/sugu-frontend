import { useQuery, useMutation, useQueryClient } from 'react-query'
import { demandeService } from '@/services/api'
import { toast } from 'react-toastify'
import { extractApiError } from '@/utils/errors'

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

export function useFixerPrix() {
  const qc = useQueryClient()
  return useMutation(
    ({ id, prix }) => demandeService.fixerPrix(id, prix),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries(['demande', id])
        qc.invalidateQueries('demandes')
        toast.success('Prix fixé avec succès !')
      },
      onError: (e) => toast.error(
        extractApiError(e, 'Erreur lors de la fixation du prix')
      ),
    }
  )
}

export function useConfirmerPaiement() {
  const qc = useQueryClient()
  return useMutation(
    ({ id, montant }) => demandeService.confirmerPaiement(id, montant),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries(['demande', id])
        qc.invalidateQueries('demandes')
        toast.success('Paiement confirmé avec succès !')
      },
      onError: (e) => toast.error(
        e.response?.data?.montant?.[0] || 'Erreur lors de la confirmation du paiement'
      ),
    }
  )
}
