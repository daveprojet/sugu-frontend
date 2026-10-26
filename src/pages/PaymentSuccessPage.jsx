import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ShieldCheck, ChevronLeft, Loader2 } from 'lucide-react'
import { usePaytechVerify } from '@/hooks/usePaiements'
import { useAuth } from '@/context/AuthContext'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const verify = usePaytechVerify()
  const { user } = useAuth()

  const isArtisan = user?.role === 'artisan'
  const token = useMemo(() => {
    return searchParams.get('token') || sessionStorage.getItem('paytech_token') || ''
  }, [searchParams])

  useEffect(() => {
    if (token) {
      verify.mutate(token)
      sessionStorage.removeItem('paytech_token')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const verifying = verify.isLoading
  const error = verify.isError
    ? verify.error?.response?.data?.detail || 'Impossible de confirmer le paiement.'
    : ''

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-indigo-50/40 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 text-center space-y-6"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
          error ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {verifying ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : error ? (
            <ShieldCheck className="w-10 h-10" />
          ) : (
            <CheckCircle className="w-10 h-10" />
          )}
        </div>

        {verifying ? (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900">Confirmation en cours…</h1>
            <p className="text-sm text-gray-500">
              Nous vérifions le statut de votre paiement auprès de PayTech.
            </p>
          </>
        ) : error ? (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900">Paiement à confirmer</h1>
            <p className="text-sm text-gray-500">{error}</p>
            <p className="text-xs text-gray-400">
              La notification PayTech peut prendre quelques instants. Vérifiez le statut depuis votre tableau de bord.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-gray-900">Paiement effectué !</h1>
            <p className="text-sm text-gray-500">
              {isArtisan
                ? 'Votre commission a été réglée avec succès. Merci pour votre confiance.'
                : 'Votre dépannage a été réglé avec succès. Merci pour votre confiance.'}
            </p>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {isArtisan ? (
            <Link
              to="/dashboard-artisan/commissions"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
            >
              Mes commissions
            </Link>
          ) : (
            <Link
              to="/dashboard-client"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
            >
              Mes demandes
            </Link>
          )}
          <Link
            to={isArtisan ? '/dashboard-artisan' : '/dashboard-client'}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
