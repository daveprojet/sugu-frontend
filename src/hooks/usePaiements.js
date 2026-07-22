import { useQuery, useMutation, useQueryClient } from 'react-query'
import { commissionService, paiementService } from '@/services/api'
import { toast } from 'react-toastify'

export function useCommissions() {
  return useQuery(
    'commissions',
    () => commissionService.list().then(r => r.data),
    { staleTime: 1000 * 60 * 2 }
  )
}

export function useCommission(uid) {
  return useQuery(
    ['commission', uid],
    () => commissionService.detail(uid).then(r => r.data),
    { enabled: !!uid }
  )
}

export function usePaiements() {
  return useQuery(
    'paiements',
    () => paiementService.list().then(r => r.data),
    { staleTime: 1000 * 60 * 2 }
  )
}

export function useCreatePaiement() {
  const qc = useQueryClient()
  return useMutation(
    (data) => paiementService.create(data),
    {
      onSuccess: () => {
        qc.invalidateQueries('commissions')
        qc.invalidateQueries('paiements')
        toast.success('Paiement enregistré avec succès !')
      },
      onError: (e) => {
        const msg = e.response?.data?.detail
          || e.response?.data?.montant?.[0]
          || 'Erreur lors du paiement'
        toast.error(msg)
      },
    }
  )
}
