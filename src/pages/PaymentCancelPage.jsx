import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, RotateCcw, ChevronLeft, Loader2 } from 'lucide-react'
import { usePaytechCancel } from '@/hooks/usePaiements'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const cancel = usePaytechCancel()

  const token = useMemo(() => {
    return searchParams.get('token') || sessionStorage.getItem('paytech_token') || ''
  }, [searchParams])

  useEffect(() => {
    if (token) {
      cancel.mutate(token)
      sessionStorage.removeItem('paytech_token')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const cancelling = cancel.isLoading

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-indigo-50/40 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          {cancelling ? <Loader2 className="w-10 h-10 animate-spin" /> : <XCircle className="w-10 h-10" />}
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {cancelling ? 'Annulation en cours…' : 'Paiement annulé'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {cancelling
              ? 'Nous enregistrons l\'annulation de votre paiement.'
              : 'Vous avez annulé le paiement de votre commission. Aucun montant n\'a été débité.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            to="/dashboard-artisan/commissions"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" /> Réessayer le paiement
          </Link>
          <Link
            to="/dashboard-artisan"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
