import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { avisService } from '@/services/api'

export function useCreateAvis() {
  const qc = useQueryClient()

  return useMutation(
    (data) => avisService.create(data),
    {
      onSuccess: (_, data) => {
        qc.invalidateQueries('demandes')
        qc.invalidateQueries(['artisan-avis', String(data.artisan)])
        qc.invalidateQueries(['artisan-avis', data.artisan])
        toast.success('Avis publie avec succes.')
      },
      onError: (error) => {
        const detail = error.response?.data?.non_field_errors?.[0]
          || error.response?.data?.detail
          || 'Impossible de publier cet avis.'
        toast.error(detail)
      },
    }
  )
}

export function useRepondreAvis() {
  const qc = useQueryClient()

  return useMutation(
    ({ id, artisanId, data }) => avisService.repondre(id, data),
    {
      onSuccess: (_, { artisanId }) => {
        qc.invalidateQueries('demandes')
        qc.invalidateQueries(['artisan-avis', String(artisanId)])
        qc.invalidateQueries(['artisan-avis', artisanId])
        toast.success('Reponse publiee.')
      },
      onError: (error) => {
        const detail = error.response?.data?.reponse_artisan?.[0]
          || error.response?.data?.detail
          || 'Impossible de publier la reponse.'
        toast.error(detail)
      },
    }
  )
}
