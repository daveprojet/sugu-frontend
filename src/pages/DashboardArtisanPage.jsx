import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDemandes, useUpdateDemande } from '@/hooks/useDemandes'
import { useArtisanAvis, useUpdateArtisan, useIdentite } from '@/hooks/useArtisans'
import { useCommissions } from '@/hooks/usePaiements'
import { useRepondreAvis } from '@/hooks/useAvis'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import { STATUTS_DEMANDE, STATUTS_IDENTITE } from '@/utils/constants'
import {
  Inbox,
  Clock,
  CheckCircle,
  ThumbsUp,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  IdCard,
  Phone,
  Filter,
  Tag,
  AlertTriangle,
  Wallet,
  BadgeDollarSign
} from 'lucide-react'

export default function DashboardArtisanPage() {
  const { user } = useAuth()
  const { data: identite } = useIdentite(user?.artisan_uid)
  const { data: demandes = [], isLoading } = useDemandes({ artisan: user?.artisan_uid })
  const { data: avisPage, isLoading: avisLoading } = useArtisanAvis(user?.artisan_uid)
  const avis = avisPage?.results || []
  const updateDemande = useUpdateDemande()
  const updateArtisan = useUpdateArtisan()
  const repondreAvis = useRepondreAvis()
  const { data: commissionsPage } = useCommissions()
  const commissions = commissionsPage?.results || []
  const [disponible, setDisponible] = useState(user?.disponible ?? true)
  const [replyOpen, setReplyOpen] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [statutFilter, setStatutFilter] = useState('all')

  const demandesFiltrees = statutFilter === 'all'
    ? demandes
    : demandes.filter((d) => d.statut === statutFilter)

  const statutCounts = demandes.reduce((acc, d) => {
    acc[d.statut] = (acc[d.statut] || 0) + 1
    return acc
  }, {})

  const toggleDispo = async () => {
    const next = !disponible
    setDisponible(next)
    await updateArtisan.mutateAsync({ uid: user.artisan_uid, data: { disponible: next } })
  }

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statut === 'EN_ATTENTE').length,
    terminees: demandes.filter((d) => d.statut === 'TERMINEE').length,
  }

  const commissionsEnAttente = commissions.filter(c => c.statut === 'EN_ATTENTE' || c.statut === 'EN_RETARD')
  const totalCommissionsDue = commissionsEnAttente.reduce((sum, c) => sum + c.montant_commission, 0)

  const openReply = (item) => {
    setReplyOpen(item.id)
    setReplyText(item.reponse_artisan || '')
  }

  const submitReply = async (e, item) => {
    e.preventDefault()
    await repondreAvis.mutateAsync({
      id: item.id,
      artisanId: user.artisan_uid,
      data: { reponse_artisan: replyText },
    })
    setReplyOpen(null)
    setReplyText('')
  }

  const statCards = [
    { label: 'Total demandes', value: stats.total, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Terminées', value: stats.terminees, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

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
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
              {user?.prenom?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
                Bonjour, {user?.prenom}
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Voici un aperçu de votre activité</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard-artisan/commissions"
              className="inline-flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-4 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm"
            >
              <Wallet className="w-4 h-4" /> Commissions
            </Link>
            <button
              onClick={toggleDispo}
              className={`group relative flex items-center gap-3 px-6 py-2.5 rounded-full border-2 font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md
                ${disponible
                  ? 'border-emerald-500 text-emerald-700 bg-white hover:bg-emerald-50'
                  : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
                }`}
            >
            <span className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  disponible ? 'bg-emerald-400' : 'bg-gray-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  disponible ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
            </span>
            {disponible ? 'Disponible' : 'Indisponible'}
          </button>
          </div>
        </motion.div>

        {/* Commission Alert */}
        {user?.bloque && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Votre profil est temporairement bloqué</p>
              <p className="text-xs text-red-700 mt-0.5">
                Une commission de {totalCommissionsDue.toLocaleString("fr-FR")} FCFA est due. Veuillez régulariser votre situation pour recevoir de nouvelles demandes.
              </p>
            </div>
            <Link
              to="/dashboard-artisan/commissions"
              className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-red-700 transition-colors flex-shrink-0"
            >
              <Wallet className="w-3.5 h-3.5" /> Payer
            </Link>
          </motion.div>
        )}

        {/* Identity Status */}
        {user?.artisan_uid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/mon-profil/identite"
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                !identite?.statut || identite.statut === 'EN_ATTENTE'
                  ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                  : identite.statut === 'REJETEE'
                  ? 'bg-red-50 border-red-200 hover:border-red-300'
                  : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                !identite?.statut || identite.statut === 'EN_ATTENTE'
                  ? 'bg-amber-100 text-amber-600'
                  : identite.statut === 'REJETEE'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                <IdCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Pièce d'identité</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {!identite?.statut
                    ? 'Aucune pièce d\'identité fournie'
                    : STATUTS_IDENTITE[identite.statut]?.label || identite.statut}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                !identite?.statut
                  ? 'bg-gray-100 text-gray-600'
                  : STATUTS_IDENTITE[identite.statut]?.color || 'bg-gray-100 text-gray-600'
              }`}>
                {!identite?.statut ? 'À faire' : STATUTS_IDENTITE[identite.statut]?.label?.split(' ')[0] || identite.statut}
              </span>
            </Link>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Demandes */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-xl font-bold text-gray-900">Demandes reçues</h2>
            {!isLoading && demandes.length > 0 && (
              <span className="inline-flex items-center justify-center bg-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {demandes.length}
              </span>
            )}
          </div>

          {!isLoading && demandes.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setStatutFilter('all')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${
                  statutFilter === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Filter className="w-3 h-3" />
                Toutes
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${statutFilter === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
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
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${
                      statutFilter === key
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statutFilter === key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : demandes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-medium text-gray-500">Aucune demande pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Complétez votre profil pour être mieux visible</p>
            </div>
          ) : demandesFiltrees.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-medium text-gray-500">Aucune demande avec ce statut</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {demandesFiltrees.map((d) => {
                const statusColor = STATUTS_DEMANDE[d.statut]?.color || 'bg-gray-100 text-gray-600';
                return (
                  <motion.div
                    key={d.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.005 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-5 md:p-6 transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900 text-base">{d.client_nom}</span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {STATUTS_DEMANDE[d.statut]?.label || d.statut}
                          </span>
                          {d.prix_affiche != null && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <BadgeDollarSign className="w-3 h-3" />
                              {d.prix_affiche.toLocaleString("fr-FR")} FCFA
                            </span>
                          )}
                        </div>
                        {d.client_telephone && d.statut !== 'EN_ATTENTE' && (
                          <a
                            href={`tel:${d.client_telephone}`}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {d.client_telephone}
                          </a>
                        )}
                        {d.service_element_nom && (
                          <p className="text-xs text-indigo-500 font-medium mt-1">
                            {d.categorie_nom} — {d.service_element_nom}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 leading-relaxed">{d.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(d.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          {d.distance_km != null && d.statut !== 'EN_ATTENTE' && (
                            <span>{d.distance_km} km</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 flex-shrink-0 mt-2 md:mt-0">
                        {d.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'ACCEPTEE' } })}
                              className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" /> Accepter
                            </button>
                            <button
                              onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'ANNULEE' } })}
                              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Refuser
                            </button>
                          </>
                        )}
                        {d.statut === 'ACCEPTEE' && (
                          <button
                            onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'EN_COURS' } })}
                            className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
                          >
                            <Clock className="w-3.5 h-3.5" /> En cours
                          </button>
                        )}
                        {(d.statut === 'ACCEPTEE' || d.statut === 'EN_COURS') && (
                          <button
                            onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'TERMINEE' } })}
                            className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Marquer terminé
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* Avis */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Avis clients</h2>
            {!avisLoading && avis.length > 0 && (
              <span className="inline-flex items-center justify-center bg-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {avis.length}
              </span>
            )}
          </div>

          {avisLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : avis.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-medium text-gray-500">Aucun avis pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">
                Les commentaires apparaîtront après les prestations terminées.
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {avis.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.005 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-5 md:p-6 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.client_nom}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <StarRating note={item.note} size="sm" showNote={false} />
                      </div>

                      {item.commentaire ? (
                        <p className="text-sm text-gray-600 leading-relaxed">{item.commentaire}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Aucun commentaire ajouté.</p>
                      )}

                      {item.reponse_artisan && replyOpen !== item.id && (
                        <div className="mt-4 bg-indigo-50 border border-indigo-200/60 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                            <p className="text-xs font-semibold text-indigo-600">Votre réponse</p>
                          </div>
                          <p className="text-sm text-gray-700">{item.reponse_artisan}</p>
                          {item.reponse_artisan_at && (
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(item.reponse_artisan_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      {replyOpen === item.id && (
                        <form onSubmit={(e) => submitReply(e, item)} className="mt-4 flex flex-col gap-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            required
                            className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm resize-none"
                            placeholder="Écrivez une réponse publique au client"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-full shadow-md shadow-indigo-500/30 transition-all duration-200 text-sm disabled:opacity-70"
                              disabled={repondreAvis.isLoading}
                            >
                              {repondreAvis.isLoading ? 'Envoi...' : 'Publier la réponse'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyOpen(null)}
                              className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {replyOpen !== item.id && (
                      <button
                        type="button"
                        onClick={() => openReply(item)}
                        className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-xs font-medium transition-colors flex-shrink-0 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {item.reponse_artisan ? 'Modifier' : 'Répondre'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </main>
  )
}
