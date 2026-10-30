import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import { signalementService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

export function useCreateSignalement() {
  return useMutation(
    (data) => signalementService.create(data),
    {
      onSuccess: () => toast.success('Votre signalement a bien été transmis à notre équipe.'),
      onError: (e) => toast.error(extractApiError(e, "Impossible d'envoyer le signalement.")),
    }
  )
}
