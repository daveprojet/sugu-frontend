import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDemandes, useUpdateDemande } from '@/hooks/useDemandes'
import { useArtisanAvis, useUpdateArtisan } from '@/hooks/useArtisans'
import { useRepondreAvis } from '@/hooks/useAvis'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import { STATUTS_DEMANDE } from '@/utils/constants'

export default function DashboardArtisanPage() {
  const { user } = useAuth()
  const { data: demandes = [], isLoading } = useDemandes({ artisan: user?.artisan_id })
  const { data: avis = [], isLoading: avisLoading } = useArtisanAvis(user?.artisan_id)
  const updateDemande  = useUpdateDemande()
  const updateArtisan  = useUpdateArtisan()
  const repondreAvis = useRepondreAvis()
  const [disponible, setDisponible] = useState(user?.disponible ?? true)
  const [replyOpen, setReplyOpen] = useState(null)
  const [replyText, setReplyText] = useState('')

  const toggleDispo = async () => {
    const next = !disponible
    setDisponible(next)
    await updateArtisan.mutateAsync({ id: user.artisan_id, data: { disponible: next } })
  }

  const stats = {
    total:    demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
    terminees: demandes.filter(d => d.statut === 'TERMINEE').length,
  }

  const openReply = (item) => {
    setReplyOpen(item.id)
    setReplyText(item.reponse_artisan || '')
  }

  const submitReply = async (e, item) => {
    e.preventDefault()
    await repondreAvis.mutateAsync({
      id: item.id,
      artisanId: user.artisan_id,
      data: { reponse_artisan: replyText },
    })
    setReplyOpen(null)
    setReplyText('')
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Voici un aperçu de votre activité</p>
        </div>
        <button
          onClick={toggleDispo}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            disponible ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${disponible ? 'bg-accent-500' : 'bg-gray-400'}`} />
          {disponible ? 'Disponible' : 'Indisponible'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total demandes', value: stats.total,     color: 'text-gray-900' },
          { label: 'En attente',     value: stats.enAttente, color: 'text-amber-600' },
          { label: 'Terminées',      value: stats.terminees, color: 'text-accent-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Demandes */}
      <h2 className="font-display font-semibold text-gray-900 mb-4">Demandes reçues</h2>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : demandes.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-medium">Aucune demande pour le moment</p>
          <p className="text-sm mt-1">Complétez votre profil pour être mieux visible</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {demandes.map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{d.client_nom}</span>
                    <span className={`badge ${STATUTS_DEMANDE[d.statut]?.color}`}>
                      {STATUTS_DEMANDE[d.statut]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{d.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {d.statut === 'EN_ATTENTE' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'ACCEPTEE' } })}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'ANNULEE' } })}
                      className="btn-secondary text-xs py-1.5 px-3 text-red-500"
                    >
                      Refuser
                    </button>
                  </div>
                )}
                {d.statut === 'ACCEPTEE' && (
                  <button
                    onClick={() => updateDemande.mutate({ id: d.id, data: { statut: 'TERMINEE' } })}
                    className="btn-secondary text-xs py-1.5 px-3 text-accent-600 flex-shrink-0"
                  >
                    Marquer terminé
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display font-semibold text-gray-900 mt-10 mb-4">Avis clients</h2>

      {avisLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : avis.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <p className="font-medium">Aucun avis pour le moment</p>
          <p className="text-sm mt-1">Les commentaires apparaitront apres les prestations terminees.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {avis.map(item => (
            <div key={item.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.client_nom}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <StarRating note={item.note} size="sm" showNote={false} />
                  </div>

                  {item.commentaire ? (
                    <p className="text-sm text-gray-600">{item.commentaire}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Aucun commentaire ajoute.</p>
                  )}

                  {item.reponse_artisan && replyOpen !== item.id && (
                    <div className="mt-4 rounded-xl bg-sand-50 border border-sand-100 p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Votre reponse</p>
                      <p className="text-sm text-gray-700">{item.reponse_artisan}</p>
                      {item.reponse_artisan_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.reponse_artisan_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  )}

                  {replyOpen === item.id && (
                    <form onSubmit={(e) => submitReply(e, item)} className="mt-4 flex flex-col gap-3">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        required
                        className="input-field resize-none"
                        placeholder="Ecrivez une reponse publique au client"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-sm" disabled={repondreAvis.isLoading}>
                          {repondreAvis.isLoading ? 'Envoi...' : 'Publier la reponse'}
                        </button>
                        <button type="button" onClick={() => setReplyOpen(null)} className="btn-secondary text-sm">
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
                    className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                  >
                    {item.reponse_artisan ? 'Modifier' : 'Repondre'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
