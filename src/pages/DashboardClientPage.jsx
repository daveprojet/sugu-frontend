import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useDemandes, useUpdateDemande, useConfirmerPaiement } from '@/hooks/useDemandes'
import { useCreateAvis } from '@/hooks/useAvis'
import { usePaytechInit } from '@/hooks/usePaiements'
import { extractApiError } from '@/utils/errors'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import SignalementModal from '@/components/common/SignalementModal'
import PhotosDemande, { peutModifierPhotos } from '@/components/demande/PhotosDemande'
import DescriptionDepliable from '@/components/demande/DescriptionDepliable'
import { STATUTS_DEMANDE, STATUTS_DEMANDE_SIGNALABLE } from '@/utils/constants'
import {
  Inbox,
  Clock,
  CheckCircle,
  User,
  Search,
  MessageSquare,
  Send,
  X,
  ChevronRight,
  Phone,
  MessageCircle,
  Filter,
  Tag,
  BadgeDollarSign,
  Lock,
  Check,
  Ban,
  Wallet,
  HandCoins,
  Camera,
} from 'lucide-react'

const defaultAvis = { note: 5, commentaire: '' }

export default function DashboardClientPage() {
  const { user, loading } = useAuth()
  const { data: demandes = [], isLoading } = useDemandes()
  const updateDemande = useUpdateDemande()
  const createAvis = useCreateAvis()
  const confirmerPaiement = useConfirmerPaiement()
  const paytechInit = usePaytechInit()
  const [avisOpen, setAvisOpen] = useState(null)
  const [avisForm, setAvisForm] = useState(defaultAvis)
  const [statutFilter, setStatutFilter] = useState('all')
  const [cancelDemande, setCancelDemande] = useState(null)
  const [especesModal, setEspecesModal] = useState(null)
  const [montantEspeces, setMontantEspeces] = useState('')
  const [payingDemandeId, setPayingDemandeId] = useState(null)
  const [demandeSignalee, setDemandeSignalee] = useState(null)
  // Id plutôt que l'objet : la fenêtre suit les données rafraîchies après un ajout.
  const [photosDemandeId, setPhotosDemandeId] = useState(null)
  const photosDemande = demandes.find((d) => d.id === photosDemandeId)
  const avisRef = useRef(null)

  useEffect(() => {
    if (avisOpen) {
      avisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [avisOpen])

  const demandesFiltrees = statutFilter === 'all'
    ? demandes
    : demandes.filter(d => d.statut === statutFilter)

  const statutCounts = demandes.reduce((acc, d) => {
    acc[d.statut] = (acc[d.statut] || 0) + 1
    return acc
  }, {})

  if (loading || isLoading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
    terminees: demandes.filter(d => d.statut === 'TERMINEE').length,
  }

  const openAvis = (demande) => {
    setAvisOpen(demande.id)
    setAvisForm(defaultAvis)
  }

  const submitAvis = async (e, demande) => {
    e.preventDefault()
    await createAvis.mutateAsync({
      artisan: demande.artisan,
      demande: demande.id,
      note: Number(avisForm.note),
      commentaire: avisForm.commentaire,
    })
    setAvisOpen(null)
    setAvisForm(defaultAvis)
  }

  const openCancel = (demande) => {
    setCancelDemande(demande)
  }

  const submitCancel = async () => {
    if (!cancelDemande) return
    try {
      await updateDemande.mutateAsync({
        id: cancelDemande.id,
        data: { statut: 'ANNULEE' },
      })
      toast.success('Demande annulée')
    } catch (err) {
      toast.error(extractApiError(err, "Impossible d'annuler la demande"))
    } finally {
      setCancelDemande(null)
    }
  }

  // Paiement du dépannage en ligne (PayTech)
  const payerEnLigne = async (demande) => {
    setPayingDemandeId(demande.id)
    try {
      await paytechInit.mutateAsync({
        demande: demande.id,
        target_payment: 'Orange Money, Wave, Free Money, Carte Bancaire',
      })
    } catch {
      // Message déjà affiché par usePaytechInit (onError) : pas de second toast.
    } finally {
      setPayingDemandeId(null)
    }
  }

  // Confirmation du montant payé en espèces
  const ouvrirEspeces = (demande) => {
    setEspecesModal(demande)
    setMontantEspeces(demande.prix_total != null ? String(demande.prix_total) : '')
  }

  const submitEspeces = async (e) => {
    e.preventDefault()
    if (!especesModal) return
    const montant = parseInt(montantEspeces, 10)
    if (!montant || montant <= 0) {
      toast.error('Veuillez saisir un montant valide')
      return
    }
    try {
      await confirmerPaiement.mutateAsync({ id: especesModal.id, montant })
      setEspecesModal(null)
    } catch {
      // Message déjà affiché par useConfirmerPaiement (onError) : pas de second toast.
    }
  }

  // ── Morceaux d'une demande, partagés par le tableau (ordinateur) et les cartes (téléphone) ──
  const categoriesArtisan = (d) => (Array.isArray(d.artisan_categories) ? d.artisan_categories.join(', ') : d.artisan_categories)

  const badgeStatut = (d) => {
    const config = STATUTS_DEMANDE[d.statut] || { color: 'bg-canvas text-muted', label: d.statut }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const badgePrix = (d) => (
    d.prix_affiche != null ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1f6b45] bg-[#dff3e8] px-2.5 py-1 rounded-full whitespace-nowrap">
        <BadgeDollarSign className="w-4 h-4" />
        {d.prix_affiche.toLocaleString("fr-FR")} FCFA
      </span>
    ) : d.statut === 'ACCEPTEE' ? (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" />
        Prix en attente de l'artisan
      </span>
    ) : null
  )

  const boutonPhotos = (d) => (
    (d.photos?.length > 0 || peutModifierPhotos('PANNE', 'client', d.statut)) && (
      <button
        type="button"
        onClick={() => setPhotosDemandeId(d.id)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800 hover:underline"
      >
        <Camera className="w-3.5 h-3.5" />
        {d.photos?.length ? `Photos (${d.photos.length})` : 'Ajouter des photos'}
      </button>
    )
  )

  // Paiement une fois la prestation terminée. grand : bouton pleine largeur (téléphone).
  const actionPaiement = (d, grand = false) => {
    if (d.statut !== 'TERMINEE') return null
    if (d.est_payee) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f6b45] bg-[#dff3e8] px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3.5 h-3.5" /> Payée
        </span>
      )
    }
    // Sans montant fixé, il n'y a rien à payer (le serveur répondrait « Aucun montant à payer »).
    if (d.prix_total == null) {
      return <span className="text-[11px] text-muted">Montant non fixé par l'artisan</span>
    }
    const taille = grand ? 'w-full justify-center text-sm px-4 py-3' : 'text-[11px] px-3 py-1.5 whitespace-nowrap'
    return d.mode_paiement === 'en_ligne' ? (
      <button
        onClick={() => payerEnLigne(d)}
        disabled={payingDemandeId === d.id}
        className={`inline-flex items-center gap-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors duration-150 disabled:opacity-60 ${taille}`}
      >
        <Wallet className="w-4 h-4" />
        {payingDemandeId === d.id ? 'Paiement...' : 'Payer en ligne'}
      </button>
    ) : (
      <button
        onClick={() => ouvrirEspeces(d)}
        disabled={confirmerPaiement.isLoading}
        className={`inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors duration-150 ${taille}`}
      >
        <HandCoins className="w-4 h-4" />
        Confirmer le paiement
      </button>
    )
  }

  const boutonAnnuler = (d) => (
    d.statut === 'EN_ATTENTE' && (
      <button
        onClick={() => openCancel(d)}
        disabled={updateDemande.isLoading}
        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:underline transition-colors whitespace-nowrap"
      >
        <Ban className="w-3.5 h-3.5" />
        Annuler la demande
      </button>
    )
  )

  const boutonSignaler = (d) => (
    STATUTS_DEMANDE_SIGNALABLE.includes(d.statut) && (
      <button
        type="button"
        onClick={() => setDemandeSignalee(d)}
        className="text-xs font-medium text-muted hover:text-red-600 hover:underline transition-colors"
      >
        Signaler
      </button>
    )
  )

  // grand : bouton pleine largeur (téléphone).
  const actionAvis = (d, grand = false) => (
    d.statut !== 'TERMINEE' ? (
      grand ? null : <span className="text-xs text-muted font-medium">Après fin de prestation</span>
    ) : d.avis_id ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1f6b45] bg-[#dff3e8] px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3 h-3" /> Avis envoyé
      </span>
    ) : (
      <button
        type="button"
        onClick={() => openAvis(d)}
        className={`inline-flex items-center gap-1.5 border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors duration-150 ${grand ? 'w-full justify-center text-sm px-4 py-3' : 'text-xs px-3 py-1.5 whitespace-nowrap'}`}
      >
        <MessageSquare className="w-4 h-4" /> Laisser un avis
      </button>
    )
  )

  const dateDemande = (d) => new Date(d.created_at).toLocaleDateString('fr-FR')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
            Bonjour, {user?.prenom}
          </h1>
          <p className="text-muted text-sm mt-1 font-medium">
            Suivez vos demandes et laissez un avis après une prestation terminée.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-2.5 md:gap-6 mb-6 md:mb-8"
        >
          {[
            { label: 'Demandes envoyées', value: stats.total, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Terminées', value: stats.terminees, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="bg-white rounded-xl border border-line px-2 py-4 md:p-6 text-center hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(22,48,91,.06)] transition-all duration-150"
            >
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full ${bg} flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
              </div>
              <p className={`font-display text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] md:text-xs text-muted mt-1 font-medium leading-tight">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mes demandes */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-line overflow-hidden"
        >
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-line-soft flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              Mes demandes
              {demandes.length > 0 && (
                <span className="bg-canvas text-muted text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {demandes.length}
                </span>
              )}
            </h2>
            <Link
              to="/artisans"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 transition-colors duration-150"
            >
              <Search className="w-4 h-4" />
              Trouver un artisan
            </Link>
          </div>

          {demandes.length > 0 && (
            <div className="px-4 md:px-6 py-3 border-b border-line-soft flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStatutFilter('all')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                  statutFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-line bg-white text-muted hover:bg-canvas-soft hover:border-indigo-300'
                }`}
              >
                <Filter className="w-3 h-3" />
                Toutes
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${statutFilter === 'all' ? 'bg-white/20' : 'bg-canvas text-muted'}`}>
                  {demandes.length}
                </span>
              </button>
              {Object.entries(STATUTS_DEMANDE).map(([key, { label }]) => {
                const count = statutCounts[key] || 0
                if (count === 0) return null
                return (
                  <button
                    key={key}
                    onClick={() => setStatutFilter(key)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                      statutFilter === key
                        ? 'bg-indigo-600 text-white'
                        : 'border border-line bg-white text-muted hover:bg-canvas-soft hover:border-indigo-300'
                    }`}
                  >
                    {label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statutFilter === key ? 'bg-white/20' : 'bg-canvas text-muted'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {demandes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="font-medium text-muted">Aucune demande envoyée</p>
              <p className="text-sm text-muted mt-1">Choisissez un artisan et envoyez votre première demande.</p>
              <Link
                to="/artisans"
                className="inline-flex items-center gap-1 mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Parcourir les artisans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {demandesFiltrees.length === 0 && (
                <p className="px-6 py-12 text-center font-medium text-muted">Aucune demande avec ce statut</p>
              )}

              {/* Téléphone : une carte par demande, sans défilement horizontal */}
              {demandesFiltrees.length > 0 && (
                <ul className="md:hidden flex flex-col gap-3 p-3 bg-canvas-soft">
                  {demandesFiltrees.map((demande) => {
                    const prix = badgePrix(demande)
                    const paiement = actionPaiement(demande, true)
                    const avis = actionAvis(demande, true)
                    const annuler = boutonAnnuler(demande)
                    const signaler = boutonSignaler(demande)
                    const photos = boutonPhotos(demande)
                    return (
                      <li key={demande.id} className="bg-white rounded-xl border border-line shadow-[0_2px_10px_rgba(22,48,91,.06)] px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <Link to={`/artisans/${demande.artisan_uid}`} className="min-w-0">
                            <span className="block font-bold text-ink truncate">{demande.artisan_nom}</span>
                            <span className="block text-xs text-muted truncate">{categoriesArtisan(demande)}</span>
                          </Link>
                          {badgeStatut(demande)}
                        </div>

                        {demande.service_element_nom && (
                          <p className="text-xs text-indigo-700 font-semibold mt-3">{demande.service_element_nom}</p>
                        )}
                        <DescriptionDepliable
                          texte={demande.description}
                          className={demande.service_element_nom ? 'mt-1' : 'mt-3'}
                        />

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
                          {prix}
                          <span className="text-xs text-muted">Envoyée le {dateDemande(demande)}</span>
                        </div>

                        {(demande.artisan_telephone || demande.artisan_whatsapp) && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {demande.artisan_telephone && (
                              <a
                                href={`tel:${demande.artisan_telephone}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-ink text-sm font-semibold px-3 py-2.5 hover:bg-canvas-soft transition-colors"
                              >
                                <Phone className="w-4 h-4" /> Appeler
                              </a>
                            )}
                            {demande.artisan_whatsapp && (
                              <a
                                href={`https://wa.me/${demande.artisan_whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-2.5 hover:bg-emerald-100 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" /> WhatsApp
                              </a>
                            )}
                          </div>
                        )}

                        {(paiement || avis) && (
                          <div className="flex flex-col items-start gap-2 mt-3">
                            {paiement}
                            {avis}
                          </div>
                        )}

                        {(photos || annuler || signaler) && (
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
                            {photos}
                            {annuler}
                            {signaler}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* Ordinateur : tableau */}
              {demandesFiltrees.length > 0 && (
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[750px] text-sm text-left">
                    <thead className="bg-canvas-soft text-xs uppercase tracking-wider text-muted">
                      <tr>
                        <th className="px-6 py-3.5 font-semibold">Artisan</th>
                        <th className="px-6 py-3.5 font-semibold">Contact</th>
                        <th className="px-6 py-3.5 font-semibold">Demande</th>
                        <th className="px-6 py-3.5 font-semibold">Prix</th>
                        <th className="px-6 py-3.5 font-semibold">Statut</th>
                        <th className="px-6 py-3.5 font-semibold">Date</th>
                        <th className="px-6 py-3.5 font-semibold text-right">Avis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft">
                      {demandesFiltrees.map((demande) => (
                        <tr key={demande.id} className="group hover:bg-canvas-soft transition-colors">
                          <td className="px-6 py-4 align-middle">
                            <Link to={`/artisans/${demande.artisan_uid}`} className="block group/link">
                              <span className="font-bold text-ink group-hover/link:text-indigo-700 transition-colors">
                                {demande.artisan_nom}
                              </span>
                              <p className="text-xs text-muted mt-0.5">{categoriesArtisan(demande)}</p>
                            </Link>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex flex-col gap-1">
                              {demande.artisan_telephone && (
                                <a
                                  href={`tel:${demande.artisan_telephone}`}
                                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-indigo-700 transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  {demande.artisan_telephone}
                                </a>
                              )}
                              {demande.artisan_whatsapp && (
                                <a
                                  href={`https://wa.me/${demande.artisan_whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {demande.artisan_whatsapp}
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted max-w-xs align-middle">
                            <p className="line-clamp-2 leading-relaxed">{demande.description}</p>
                            {demande.service_element_nom && (
                              <p className="text-xs text-indigo-700 font-semibold mt-1">
                                {demande.service_element_nom}
                              </p>
                            )}
                            <div className="mt-1.5">{boutonPhotos(demande)}</div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {badgePrix(demande) || <span className="text-xs text-muted">—</span>}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {badgeStatut(demande)}
                            {actionPaiement(demande) && <div className="mt-1.5">{actionPaiement(demande)}</div>}
                            {boutonAnnuler(demande) && <div className="mt-1.5">{boutonAnnuler(demande)}</div>}
                          </td>
                          <td className="px-6 py-4 text-muted text-xs align-middle">
                            {dateDemande(demande)}
                            {boutonSignaler(demande) && <div className="mt-1">{boutonSignaler(demande)}</div>}
                          </td>
                          <td className="px-6 py-4 text-right align-middle">
                            {actionAvis(demande)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Formulaire Avis */}
        <AnimatePresence>
          {avisOpen && (
            <motion.section
              ref={avisRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="mt-6 bg-white rounded-xl border border-indigo-300 p-6"
            >
              {demandes.filter(d => d.id === avisOpen).map(demande => (
                <form key={demande.id} onSubmit={(e) => submitAvis(e, demande)} className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-ink">
                      Avis pour {demande.artisan_nom}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAvisOpen(null)}
                      className="p-2 rounded-full hover:bg-canvas text-muted hover:text-ink transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-[200px_1fr_auto] gap-6 items-start">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted">
                        Note
                      </label>
                      <select
                        value={avisForm.note}
                        onChange={e => setAvisForm(f => ({ ...f, note: e.target.value }))}
                        className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 appearance-none"
                      >
                        {[5, 4, 3, 2, 1].map(note => (
                          <option key={note} value={note}>{note} / 5</option>
                        ))}
                      </select>
                      <div className="mt-2 pl-1">
                        <StarRating note={Number(avisForm.note)} size="sm" showNote={false} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted mb-2 block">
                        Commentaire
                      </label>
                      <textarea
                        value={avisForm.commentaire}
                        onChange={e => setAvisForm(f => ({ ...f, commentaire: e.target.value }))}
                        placeholder={`Votre retour sur ${demande.artisan_nom}`}
                        rows={4}
                        className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 resize-none"
                      />
                    </div>

                    <div className="flex md:flex-col gap-2 pt-6 md:pt-0">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-70"
                        disabled={createAvis.isLoading}
                      >
                        {createAvis.isLoading ? 'Envoi...' : (
                          <>
                            Publier <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvisOpen(null)}
                        className="inline-flex items-center justify-center border border-line bg-white text-ink text-sm font-semibold px-6 py-3 rounded-lg hover:bg-canvas-soft transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </motion.section>
          )}
        </AnimatePresence>

        {demandeSignalee && (
          <SignalementModal
            demandeId={demandeSignalee.id}
            cibleNom={demandeSignalee.artisan_nom}
            cible="artisan"
            onClose={() => setDemandeSignalee(null)}
          />
        )}

        {/* Photos de la demande : panne (client), avant / après (artisan) */}
        <AnimatePresence>
          {photosDemande && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setPhotosDemandeId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl border border-line w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-bold text-ink">Photos de la demande</h3>
                  <button
                    type="button"
                    onClick={() => setPhotosDemandeId(null)}
                    className="p-2 -mt-1 -mr-2 rounded-full hover:bg-canvas text-muted hover:text-ink transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted mb-5">
                  {peutModifierPhotos('PANNE', 'client', photosDemande.statut)
                    ? `Montrez la panne à ${photosDemande.artisan_nom} : les photos l'aident à estimer le travail et à fixer son prix.`
                    : `Avec ${photosDemande.artisan_nom}. Les photos avant / après sont ajoutées par l'artisan pendant son intervention.`}
                </p>
                <PhotosDemande demande={photosDemande} role="client" className="flex-col" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation d'annulation */}
        <AnimatePresence>
          {cancelDemande && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-xl border border-line w-full max-w-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <Ban className="w-6 h-6 text-red-500" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCancelDemande(null)}
                    className="p-2 rounded-full hover:bg-canvas text-muted hover:text-ink transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-ink mb-2">
                  Annuler cette demande ?
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Votre demande à <strong>{cancelDemande.artisan_nom}</strong> sera annulée et
                  l'artisan en sera prévenu. Cette action est irréversible.
                </p>

                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelDemande(null)}
                    className="inline-flex items-center justify-center flex-1 border border-line bg-white text-ink text-sm font-semibold px-4 py-3 rounded-lg hover:bg-canvas-soft transition-colors"
                  >
                    Garder ma demande
                  </button>
                  <button
                    type="button"
                    onClick={submitCancel}
                    disabled={updateDemande.isLoading}
                    className="inline-flex items-center justify-center flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-3 rounded-lg transition-colors duration-150 disabled:opacity-70"
                  >
                    {updateDemande.isLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation paiement espèces */}
        <AnimatePresence>
          {especesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-xl border border-line w-full max-w-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <HandCoins className="w-6 h-6 text-emerald-500" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEspecesModal(null)}
                    className="p-2 rounded-full hover:bg-canvas text-muted hover:text-ink transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-ink mb-2">
                  Confirmer le paiement en espèces
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Vous avez payé <strong>{especesModal.artisan_nom}</strong> en espèces. Indiquez le
                  montant payé pour confirmer la transaction et libérer la commission de l'artisan.
                </p>

                <form onSubmit={submitEspeces} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Montant payé (FCFA)
                    </label>
                    <input
                      type="number"
                      value={montantEspeces}
                      onChange={e => setMontantEspeces(e.target.value)}
                      min={0}
                      required
                      placeholder="Montant en FCFA"
                      className="w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors duration-150"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setEspecesModal(null)}
                      className="inline-flex items-center justify-center flex-1 border border-line bg-white text-ink text-sm font-semibold px-4 py-3 rounded-lg hover:bg-canvas-soft transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={confirmerPaiement.isLoading}
                      className="inline-flex items-center justify-center flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-lg transition-colors duration-150 disabled:opacity-70"
                    >
                      {confirmerPaiement.isLoading ? 'Confirmation...' : 'Confirmer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
