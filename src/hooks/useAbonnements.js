import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { abonnementService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

export function useAbonnements() {
  return useQuery(
    'abonnements',
    () => abonnementService.get().then(r => r.data),
    { staleTime: 1000 * 30 }
  )
}

export function useBoostOffert() {
  const qc = useQueryClient()
  return useMutation(
    () => abonnementService.activerBoostOffert(),
    {
      onSuccess: () => {
        qc.invalidateQueries('abonnements')
        toast.success('Votre mois de Boost offert est activé !')
      },
      onError: (e) => toast.error(extractApiError(e, "Impossible d'activer l'offre.")),
    }
  )
}
