import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCommissions, usePaiements, usePaytechInit } from '@/hooks/usePaiements'
import Spinner from '@/components/common/Spinner'
import {
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ArrowUpRight,
  CreditCard,
  Filter,
  ShieldCheck,
} from 'lucide-react'

const METHODES_PAYTECH = [
  { value: 'Orange Money', label: 'Orange Money' },
  { value: 'Wave', label: 'Wave' },
  { value: 'Free Money', label: 'Free Money' },
  { value: 'Carte Bancaire', label: 'Carte Bancaire' },
]

const MOYENS_PAIEMENT = [
  { value: 'wave', label: 'Wave', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'orange_money', label: 'Orange Money', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'paytech', label: 'PayTech', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

const STATUTS_PAIEMENT = {
  EN_COURS: { label: 'En cours', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  VALIDE:   { label: 'Validé',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ANNULE:   { label: 'Annulé',   color: 'bg-gray-50 text-gray-700 border-gray-200' },
  ECHEC:    { label: 'Échec',    color: 'bg-red-50 text-red-700 border-red-200' },
}

export default function CommissionDashboardPage() {
  const { user } = useAuth()
  const { data: commissionsPage, isLoading } = useCommissions()
  const commissions = commissionsPage?.results || []
  const { data: paiementsPage, isLoading: paiementsLoading } = usePaiements()
  const paiements = paiementsPage?.results || []
  const paytechInit = usePaytechInit()

  const [filter, setFilter] = useState('all')
  const [payModal, setPayModal] = useState(null)
  const [methode, setMethode] = useState('Orange Money')

  const filtered = filter === 'all'
    ? commissions
    : commissions.filter(c => c.statut === filter)

  const totalDue = commissions
    .filter(c => c.statut === 'EN_ATTENTE' || c.statut === 'EN_RETARD')
    .reduce((sum, c) => sum + c.montant_commission, 0)

  const statutCounts = commissions.reduce((acc, c) => {
    acc[c.statut] = (acc[c.statut] || 0) + 1
    return acc
  }, {})

  const openPay = (commission) => {
    setPayModal(commission)
    setMethode('Orange Money')
  }

  const submitPay = async (e) => {
    e.preventDefault()
    await paytechInit.mutateAsync({
      commission: payModal.uid,
      target_payment: methode,
    })
    setPayModal(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard-artisan"
              className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
                Mes commissions
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">
                Suivez et réglez vos commissions Bricolibe
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Due Banner */}
        {totalDue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 flex items-center gap-4 ${
              user?.bloque
                ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              user?.bloque ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {user?.bloque ? <AlertTriangle className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${user?.bloque ? 'text-red-900' : 'text-amber-900'}`}>
                {user?.bloque ? 'Compte bloqué — Réglez votre solde' : 'Solde dû'}
              </p>
              <p className={`text-2xl font-display font-bold mt-0.5 ${user?.bloque ? 'text-red-700' : 'text-amber-700'}`}>
                {totalDue.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        {commissions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Toutes' },
              { key: 'EN_ATTENTE', label: 'En attente' },
              { key: 'EN_RETARD', label: 'En retard' },
              { key: 'PAYEE', label: 'Payées' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${
                  filter === key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {key === 'all' && <Filter className="w-3 h-3" />}
                {label}
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {key === 'all' ? commissions.length : (statutCounts[key] || 0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Commissions List */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : commissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="font-medium text-gray-500">Aucune commission</p>
            <p className="text-sm text-gray-400 mt-1">Elles apparaîtront après vos prestations terminées.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filtered.map((c) => {
              const isOverdue = c.statut === 'EN_RETARD'
              const isPaid = c.statut === 'PAYEE'
              return (
                <motion.div
                  key={c.uid}
                  variants={itemVariants}
                  whileHover={{ scale: 1.005 }}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-lg border p-5 md:p-6 transition-all duration-200 ${
                    isOverdue
                      ? 'border-red-200 hover:border-red-300'
                      : isPaid
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : 'border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700'
                            : isOverdue
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isPaid ? (
                            <><CheckCircle className="w-3 h-3" /> Payée</>
                          ) : isOverdue ? (
                            <><AlertTriangle className="w-3 h-3" /> En retard</>
                          ) : (
                            <><Clock className="w-3 h-3" /> En attente</>
                          )}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(c.created_at).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Demande #{c.demande_id || '—'}
                      </p>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-display text-xl font-bold text-gray-900">
                          {c.montant_commission.toLocaleString("fr-FR")} FCFA
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          (5% de {c.montant_commande?.toLocaleString("fr-FR")} FCFA)
                        </span>
                      </div>

                      {c.date_echeance && (
                        <p className={`text-xs mt-2 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          Échéance : {new Date(c.date_echeance).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {!isPaid && (
                        <button
                          onClick={() => openPay(c)}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-5 py-2.5 rounded-full shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm"
                        >
                          <CreditCard className="w-4 h-4" /> Payer
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Payment History */}
        {!paiementsLoading && paiements.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Historique des paiements</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">Date</th>
                      <th className="px-6 py-3.5 font-semibold">Montant</th>
                      <th className="px-6 py-3.5 font-semibold">Moyen</th>
                      <th className="px-6 py-3.5 font-semibold">Statut</th>
                      <th className="px-6 py-3.5 font-semibold">Référence</th>
                      <th className="px-6 py-3.5 font-semibold">Numéro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80">
                    {paiements.map((p) => {
                      const statut = STATUTS_PAIEMENT[p.statut] || STATUTS_PAIEMENT.EN_COURS
                      return (
                        <tr key={p.uid} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(p.date_paiement).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {p.montant.toLocaleString("fr-FR")} FCFA
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              MOYENS_PAIEMENT.find(m => m.value === p.methode)?.color || 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {MOYENS_PAIEMENT.find(m => m.value === p.methode)?.label || p.methode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statut.color}`}>
                              {statut.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                            {p.reference_transaction || '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                            {p.telephone || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Pay Modal — PayTech */}
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-6"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Payer une commission</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Montant dû : <span className="font-bold text-gray-900">{payModal.montant_commission.toLocaleString("fr-FR")} FCFA</span>
                </p>
              </div>

              <form onSubmit={submitPay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Moyen de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {METHODES_PAYTECH.map(({ value, label }) => (
                      <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setMethode(value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                          methode === value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    Vous serez redirigé vers la page sécurisée <strong>PayTech</strong> pour finaliser votre paiement
                    (Wave, Orange Money, Free Money, Carte bancaire…). Votre commission sera validée automatiquement.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                    disabled={paytechInit.isLoading}
                  >
                    {paytechInit.isLoading ? 'Redirection...' : (
                      <>
                        Payer avec PayTech <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayModal(null)}
                    className="px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
