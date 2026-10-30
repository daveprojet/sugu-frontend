import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, BadgeCheck, ChevronLeft, Gift, Rocket, ShieldCheck } from 'lucide-react'
import BackLink from '@/components/common/BackLink'
import { useAuth } from '@/context/AuthContext'
import { useAbonnements, useBoostOffert } from '@/hooks/useAbonnements'
import { useDossierPro } from '@/hooks/useArtisans'
import { usePaytechInit } from '@/hooks/usePaiements'
import Spinner from '@/components/common/Spinner'
import { METHODES_PAYTECH } from '@/utils/constants'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const formatPrix = (prix) => `${prix.toLocaleString('fr-FR')} FCFA`

function StatutPill({ actif, expireLe }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
        actif ? 'bg-[#dff3e8] text-[#1f6b45]' : 'bg-canvas text-muted'
      }`}
    >
      {actif ? `Actif jusqu'au ${formatDate(expireLe)}` : 'Inactif'}
    </span>
  )
}

function OffreBloc({ offre, actif, onChoisir }) {
  const duree = offre.duree_jours >= 365 ? 'par an' : offre.duree_jours >= 90 ? 'par trimestre' : 'par mois'
  return (
    <div className="rounded-lg border border-line-soft bg-canvas-soft p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-ink">{offre.label}</p>
        <p className="mt-1">
          <span className="font-display text-xl font-bold text-ink">{formatPrix(offre.prix)}</span>{' '}
          <span className="text-xs text-muted">{duree}</span>
        </p>
      </div>
      {offre.raison_indisponible ? (
        <p className="text-xs text-muted">{offre.raison_indisponible}</p>
      ) : (
        <button
          type="button"
          onClick={() => onChoisir(offre)}
          className="mt-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 transition-colors duration-150"
        >
          {actif ? 'Prolonger' : 'Souscrire'}
        </button>
      )}
    </div>
  )
}

function MessageDossier({ dossier }) {
  if (!dossier) {
    return (
      <>
        Commencez par constituer votre{' '}
        <Link to="/mon-profil/dossier" className="font-semibold text-indigo-700 underline">dossier professionnel</Link>.
        Vous ne payez qu'une fois celui-ci validé par notre équipe.
      </>
    )
  }
  if (dossier.statut === 'EN_ATTENTE') {
    return <>Votre dossier est en cours de vérification. Vous pourrez activer le badge dès sa validation.</>
  }
  if (dossier.statut === 'REJETEE') {
    return (
      <>
        Votre dossier a été rejeté{dossier.motif_rejet ? ` : ${dossier.motif_rejet}` : ''}.{' '}
        <Link to="/mon-profil/dossier" className="font-semibold text-indigo-700 underline">Modifier mon dossier</Link>
      </>
    )
  }
  return <>Votre dossier est validé : il ne reste plus qu'à activer le badge pour l'afficher sur votre profil.</>
}

export default function AbonnementsPage() {
  const { user } = useAuth()
  const { data, isLoading, isError } = useAbonnements()
  const { data: dossier } = useDossierPro(user?.artisan_uid)
  const boostOffert = useBoostOffert()
  const paytechInit = usePaytechInit()
  const [offreChoisie, setOffreChoisie] = useState(null)
  const [methode, setMethode] = useState('Orange Money')

  const choisirOffre = (offre) => {
    setOffreChoisie(offre)
    setMethode('Orange Money')
  }

  const payer = async (e) => {
    e.preventDefault()
    await paytechInit.mutateAsync({ offre: offreChoisie.code, target_payment: methode })
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }
  if (isError || !data) {
    return <div className="text-center py-24 text-muted">Impossible de charger vos abonnements pour le moment.</div>
  }

  const offresBoost = data.offres.filter((o) => o.type === 'boost')
  const offreBadge = data.offres.find((o) => o.type === 'badge')
  const boostPossible = !offresBoost[0]?.raison_indisponible

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <BackLink
            fallback="/dashboard-artisan"
            aria-label="Retour au tableau de bord"
            className="p-2 rounded-full border border-line bg-white hover:bg-canvas-soft text-muted hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </BackLink>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Mes abonnements</h1>
            <p className="text-muted text-sm font-medium mt-0.5">Gagnez en visibilité et en crédibilité auprès des clients</p>
          </div>
        </motion.div>

        {data.boost_offert.disponible && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <Gift className="w-6 h-6 text-indigo-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">Votre premier mois de Boost est offert</p>
              <p className="text-xs text-muted mt-0.5">
                Offre de lancement réservée aux 50 premiers artisans, sans carte ni paiement.
                {!boostPossible && ` ${offresBoost[0].raison_indisponible}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => boostOffert.mutate()}
              disabled={!boostPossible || boostOffert.isLoading}
              className="flex-shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {boostOffert.isLoading ? 'Activation…' : 'Activer mon mois offert'}
            </button>
          </div>
        )}

        <section className="bg-white rounded-xl border border-line p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Boost visibilité</h2>
                <p className="text-xs text-muted">Apparaissez en tête des résultats sur votre métier et votre quartier.</p>
              </div>
            </div>
            <StatutPill actif={data.boost.actif} expireLe={data.boost.expire_le} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {offresBoost.map((offre) => (
              <OffreBloc key={offre.code} offre={offre} actif={data.boost.actif} onChoisir={choisirOffre} />
            ))}
          </div>
          <p className="text-xs text-muted mt-3">Sans engagement : aucun renouvellement automatique. Une prolongation s'ajoute au temps restant.</p>
        </section>

        <section className="bg-white rounded-xl border border-line p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Badge « Vérifié »</h2>
                <p className="text-xs text-muted">Rassurez les clients avec un statut professionnel contrôlé par notre équipe.</p>
              </div>
            </div>
            <StatutPill actif={data.badge.actif} expireLe={data.badge.expire_le} />
          </div>
          <p className="text-sm text-muted mb-4">
            <MessageDossier dossier={dossier} />
          </p>
          {offreBadge && !offreBadge.raison_indisponible && (
            <div className="sm:max-w-sm">
              <OffreBloc offre={offreBadge} actif={data.badge.actif} onChoisir={choisirOffre} />
            </div>
          )}
        </section>
      </div>

      {offreChoisie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-xl border border-line w-full max-w-md p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-ink">{offreChoisie.label}</h3>
              <p className="text-sm text-muted mt-1">
                Montant : <span className="font-bold text-ink">{formatPrix(offreChoisie.prix)}</span>
              </p>
            </div>

            <form onSubmit={payer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Moyen de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  {METHODES_PAYTECH.map(({ value, label }) => (
                    <button
                      key={value}
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
                  Vous serez redirigé vers la page sécurisée <strong>PayTech</strong>. Votre abonnement est activé
                  automatiquement dès la confirmation du paiement.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={paytechInit.isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-70"
                >
                  {paytechInit.isLoading ? 'Redirection...' : (
                    <>
                      Payer avec PayTech <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOffreChoisie(null)}
                  className="px-6 py-3 rounded-lg border border-line text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  )
}
