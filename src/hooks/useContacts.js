import {useMutation} from 'react-query'
import {contactService} from '@/services/api'
import {toast} from 'react-toastify'
import {extractApiError} from '@/utils/errors'


export function useCreateContact() {
    return useMutation(
        (data) => contactService.create(data),
        {
            onSuccess: () => {
                toast.success('Message envoyé avec succès !')
            },
            onError: (error) => toast.error(extractApiError(error, 'Erreur lors de l\'envoi')),
        }
    )
}