import { useState } from 'react'
import { motion } from 'framer-motion'
import BackLink from '@/components/common/BackLink'
import { useAuth } from '@/context/AuthContext'
import { useCommissions, usePaiements, usePaytechInit, useReversements } from '@/hooks/usePaiements'
import Spinner from '@/components/common/Spinner'
import { METHODES_PAYTECH } from '@/utils/constants'
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
  Banknote,
  TrendingUp,
} from 'lucide-react'

const OBJETS_PAIEMENT = {
  commission: 'Commission',
  depannage: 'Dépannage',
  badge: 'Badge « Vérifié »',
  boost: 'Boost',
}

const MOYENS_PAIEMENT = [
  { value: 'wave', label: 'Wave', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'orange_money', label: 'Orange Money', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'paytech', label: 'PayTech', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'offert', label: 'Offert', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

const STATUTS_PAIEMENT = {
  EN_COURS: { label: 'En cours', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  VALIDE:   { label: 'Validé',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ANNULE:   { label: 'Annulé',   color: 'bg-canvas-soft text-ink border-line' },
  ECHEC:    { label: 'Échec',    color: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUTS_REVERSEMENT = {
  EN_ATTENTE: { label: 'En attente',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  REVERSE:    { label: 'Reversé',      color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ECHEC:      { label: 'Échec',        color: 'bg-red-50 text-red-700 border-red-200' },
}

export default function CommissionDashboardPage() {
  const { user } = useAuth()
  const { data: commissionsPage, isLoading } = useCommissions()
  const commissions = commissionsPage?.results || []
  const { data: paiementsPage, isLoading: paiementsLoading } = usePaiements()
  const paiements = paiementsPage?.results || []
  const paytechInit = usePaytechInit()
  const { data: reversementsPage, isLoading: reversementsLoading } = useReversements()
  const reversements = reversementsPage?.results || []

  const totalReverses = reversements
    .filter(r => r.statut === 'REVERSE')
    .reduce((sum, r) => sum + (r.montant_gain || 0), 0)

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
            <BackLink
              fallback="/dashboard-artisan"
              className="p-2 rounded-full border border-line bg-white hover:bg-canvas-soft text-muted hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </BackLink>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
                Mes commissions
              </h1>
              <p className="text-muted text-sm font-medium mt-0.5">
                Suivez et réglez vos commissions Bricolibe
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reversements (gains artisan) */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-line p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Mes gains</h2>
                <p className="text-xs text-muted">Reversements de vos dépannages payés en ligne</p>
              </div>
            </div>
            {totalReverses > 0 && (
              <div className="text-right">
                <p className="text-xs font-semibold text-muted">Total reversé</p>
                <p className="font-display text-lg font-bold text-emerald-600">
                  {totalReverses.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            )}
          </div>

          {reversementsLoading ? (
            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
          ) : reversements.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              Aucun gain pour le moment. Vos reversements apparaîtront après le paiement en ligne de vos dépannages.
            </p>
          ) : (
            <div className="space-y-3">
              {reversements.map((r) => {
                const st = STATUTS_REVERSEMENT[r.statut] || STATUTS_REVERSEMENT.EN_ATTENTE
                return (
                  <div
                    key={r.uid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-line-soft bg-canvas-soft px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-line flex items-center justify-center">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {r.montant_gain.toLocaleString("fr-FR")} FCFA
                        </p>
                        <p className="text-xs text-muted">
                          Demande #{r.demande_id || '—'} · Commandé {r.montant_commande.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.statut === 'REVERSE' && r.reference_wave && (
                        <span className="text-[10px] text-muted font-medium">
                          Wave : {r.reference_wave}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.section>

        {/* Total Due Banner */}
        {totalDue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-5 flex items-center gap-4 ${
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'border border-line bg-white text-muted hover:bg-canvas-soft hover:border-indigo-300'
                }`}
              >
                {key === 'all' && <Filter className="w-3 h-3" />}
                {label}
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-canvas text-muted'}`}>
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
          <div className="bg-white rounded-xl border border-line p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-indigo-700" />
            </div>
            <p className="font-medium text-muted">Aucune commission</p>
            <p className="text-sm text-muted mt-1">Elles apparaîtront après vos prestations terminées.</p>
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
                  className={`bg-white rounded-xl border p-5 md:p-6 hover:shadow-[0_6px_18px_rgba(22,48,91,.06)] transition-all duration-150 ${
                    isOverdue
                      ? 'border-red-200 hover:border-red-300'
                      : isPaid
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : 'border-line hover:border-indigo-300'
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
                        <span className="text-xs text-muted font-medium">
                          {new Date(c.created_at).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-muted font-medium mb-1">
                        Demande #{c.demande_id || '—'}
                      </p>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-display text-xl font-bold text-ink">
                          {c.montant_commission.toLocaleString("fr-FR")} FCFA
                        </span>
                        <span className="text-xs text-muted font-medium">
                          (10% de {c.montant_commande?.toLocaleString("fr-FR")} FCFA)
                        </span>
                      </div>

                      {c.date_echeance && (
                        <p className={`text-xs mt-2 font-medium ${isOverdue ? 'text-red-600' : 'text-muted'}`}>
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
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 transition-colors duration-150"
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
            <h2 className="text-lg font-bold text-ink mb-4">Historique des paiements</h2>
            <div className="bg-white rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-canvas-soft text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold">Date</th>
                      <th className="px-6 py-3.5 font-semibold">Objet</th>
                      <th className="px-6 py-3.5 font-semibold">Montant</th>
                      <th className="px-6 py-3.5 font-semibold">Moyen</th>
                      <th className="px-6 py-3.5 font-semibold">Statut</th>
                      <th className="px-6 py-3.5 font-semibold">Référence</th>
                      <th className="px-6 py-3.5 font-semibold">Numéro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {paiements.map((p) => {
                      const statut = STATUTS_PAIEMENT[p.statut] || STATUTS_PAIEMENT.EN_COURS
                      return (
                        <tr key={p.uid} className="hover:bg-canvas-soft transition-colors">
                          <td className="px-6 py-4 text-muted">
                            {new Date(p.date_paiement).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-muted">{OBJETS_PAIEMENT[p.type] || p.type}</td>
                          <td className="px-6 py-4 font-semibold text-ink">
                            {p.montant.toLocaleString("fr-FR")} FCFA
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              MOYENS_PAIEMENT.find(m => m.value === p.methode)?.color || 'bg-canvas-soft text-muted border-line'
                            }`}>
                              {MOYENS_PAIEMENT.find(m => m.value === p.methode)?.label || p.methode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statut.color}`}>
                              {statut.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted text-xs font-mono">
                            {p.reference_transaction || '—'}
                          </td>
                          <td className="px-6 py-4 text-muted font-mono text-xs">
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
              className="bg-white rounded-xl border border-line w-full max-w-md p-6 space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-ink">Payer une commission</h3>
                <p className="text-sm text-muted mt-1">
                  Montant dû : <span className="font-bold text-ink">{payModal.montant_commission.toLocaleString("fr-FR")} FCFA</span>
                </p>
              </div>

              <form onSubmit={submitPay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Moyen de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {METHODES_PAYTECH.map(({ value, label }) => (
                      <button
                        key={value || 'all'}
                        type="button"
                        onClick={() => setMethode(value)}
                        className={`px-4 py-3 rounded-lg border text-sm font-semibold transition-colors duration-150 ${
                          methode === value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-line bg-white text-muted hover:bg-canvas-soft'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg p-3.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    Vous serez redirigé vers la page sécurisée <strong>PayTech</strong> pour finaliser votre paiement
                    (Wave, Orange Money, Free Money, Carte bancaire…). Votre commission sera validée automatiquement.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-70"
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
                    className="px-6 py-3 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors"
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
