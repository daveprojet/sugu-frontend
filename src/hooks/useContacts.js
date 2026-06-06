import {useMutation} from 'react-query'
import {contactService} from '@/services/api'
import {toast} from 'react-toastify'


export function useCreateContact() {
    return useMutation(
        (data) => contactService.create(data),
        {
            onSuccess: () => {
                toast.success('Message envoyé avec succès !')
            },
            onError: () => toast.error('Erreur lors de l\'envoi'),
        }
    )
}