import { useQuery } from 'react-query'
import { faqService } from '@/services/api'

export function useFaq() {
  return useQuery(
    'faq',
    () => faqService.list().then(r => r.data),
    { staleTime: 1000 * 60 * 10 }
  )
}
