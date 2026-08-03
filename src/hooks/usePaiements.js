import { useQuery, useMutation, useQueryClient } from 'react-query'
import { commissionService, paiementService, paytechService } from '@/services/api'
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

export function usePaytechInit() {
  const qc = useQueryClient()
  return useMutation(
    (data) => paytechService.init(data),
    {
      onSuccess: (res) => {
        const { redirect_url, token } = res.data || {}
        if (token) sessionStorage.setItem('paytech_token', token)
        if (redirect_url) {
          window.location.href = redirect_url
        } else {
          toast.error('Aucune URL de paiement retournée.')
        }
      },
      onError: (e) => {
        const msg = e.response?.data?.detail
          || e.response?.data?.commission?.[0]
          || 'Erreur lors de la création du paiement'
        toast.error(msg)
      },
    }
  )
}

export function usePaytechVerify() {
  const qc = useQueryClient()
  return useMutation(
    (token) => paytechService.verify(token),
    {
      onSuccess: (res) => {
        qc.invalidateQueries('commissions')
        qc.invalidateQueries('paiements')
        return res
      },
    }
  )
}
