import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useDemandes } from '@/hooks/useDemandes'
import { useCreateAvis } from '@/hooks/useAvis'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import { STATUTS_DEMANDE } from '@/utils/constants'
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
} from 'lucide-react'

const defaultAvis = { note: 5, commentaire: '' }

export default function DashboardClientPage() {
  const { user, loading } = useAuth()
  const { data: demandes = [], isLoading } = useDemandes()
  const createAvis = useCreateAvis()
  const [avisOpen, setAvisOpen] = useState(null)
  const [avisForm, setAvisForm] = useState(defaultAvis)
  const [statutFilter, setStatutFilter] = useState('all')

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
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Bonjour, {user?.prenom}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Suivez vos demandes et laissez un avis après une prestation terminée.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 md:gap-6 mb-8"
        >
          {[
            { label: 'Demandes envoyées', value: stats.total, icon: Inbox, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Terminées', value: stats.terminees, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6 text-center hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mes demandes */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100/80 flex items-center justify-between gap-3">
            <h2 className="font-display font-semibold text-lg text-gray-900 flex items-center gap-2">
              Mes demandes
              {demandes.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {demandes.length}
                </span>
              )}
            </h2>
            <Link
              to="/artisans"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md shadow-indigo-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Trouver un artisan
            </Link>
          </div>

          {demandes.length > 0 && (
            <div className="px-6 py-3 border-b border-gray-100/80 flex items-center gap-2 flex-wrap">
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

          {demandes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="font-medium text-gray-500">Aucune demande envoyée</p>
              <p className="text-sm text-gray-400 mt-1">Choisissez un artisan et envoyez votre première demande.</p>
              <Link
                to="/artisans"
                className="inline-flex items-center gap-1 mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Parcourir les artisans <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-sm text-left">
                <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
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
                <tbody className="divide-y divide-gray-100/80">
                  {demandesFiltrees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="font-medium text-gray-500">Aucune demande avec ce statut</p>
                      </td>
                    </tr>
                  ) : demandesFiltrees.map((demande) => {
                    const statusConfig = STATUTS_DEMANDE[demande.statut] || { color: 'bg-gray-100 text-gray-600', label: demande.statut };
                    const isContactRevealed = ['ACCEPTEE', 'EN_COURS', 'TERMINEE'].includes(demande.statut);
                    return (
                      <tr key={demande.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 align-middle">
                          <Link to={`/artisans/${demande.artisan_uid}`} className="block group/link">
                            <span className="font-medium text-gray-900 group-hover/link:text-indigo-600 transition-colors">
                              {demande.artisan_nom}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{Array.isArray(demande.artisan_categories) ? demande.artisan_categories.join(', ') : demande.artisan_categories}</p>
                          </Link>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {isContactRevealed ? (
                            <div className="flex flex-col gap-1">
                              {demande.artisan_telephone && (
                                <a
                                  href={`tel:${demande.artisan_telephone}`}
                                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  {demande.artisan_telephone}
                                </a>
                              )}
                              {demande.artisan_whatsapp && (
                                <a
                                  href={`https://wa.me/${demande.artisan_whatsapp}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {demande.artisan_whatsapp}
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 italic">
                              <Lock className="w-3.5 h-3.5" />
                              Après acceptation
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs align-middle">
                          <p className="line-clamp-2 leading-relaxed">{demande.description}</p>
                          {demande.service_element_nom && (
                            <p className="text-xs text-indigo-500 font-medium mt-1">
                              {demande.service_element_nom}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {demande.prix_affiche != null ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <BadgeDollarSign className="w-4 h-4" />
                              {demande.prix_affiche.toLocaleString("fr-FR")} FCFA
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs align-middle">
                          {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          {demande.statut !== 'TERMINEE' ? (
                            <span className="text-xs text-gray-400 font-medium italic">
                              Après fin de prestation
                            </span>
                          ) : demande.avis_id ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Avis envoyé
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAvis(demande)}
                              className="inline-flex items-center gap-1.5 border border-indigo-200 bg-indigo-50/80 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                            >
                              <MessageSquare className="w-3 h-3" /> Laisser un avis
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Formulaire Avis */}
        <AnimatePresence>
          {avisOpen && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="mt-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-indigo-300/50 shadow-2xl shadow-indigo-200/40 p-6"
            >
              {demandes.filter(d => d.id === avisOpen).map(demande => (
                <form key={demande.id} onSubmit={(e) => submitAvis(e, demande)} className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-gray-900 text-lg">
                      Avis pour {demande.artisan_nom}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAvisOpen(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-[200px_1fr_auto] gap-6 items-start">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                        Note
                      </label>
                      <select
                        value={avisForm.note}
                        onChange={e => setAvisForm(f => ({ ...f, note: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm appearance-none"
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
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">
                        Commentaire
                      </label>
                      <textarea
                        value={avisForm.commentaire}
                        onChange={e => setAvisForm(f => ({ ...f, commentaire: e.target.value }))}
                        placeholder={`Votre retour sur ${demande.artisan_nom}`}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 shadow-sm resize-none"
                      />
                    </div>

                    <div className="flex md:flex-col gap-2 pt-6 md:pt-0">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-6 py-3 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200 disabled:opacity-70"
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
                        className="inline-flex items-center justify-center border border-gray-200 bg-white/80 text-gray-700 font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
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
      </div>
    </main>
  )
}
