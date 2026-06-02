import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useDemandes } from '@/hooks/useDemandes'
import { useCreateAvis } from '@/hooks/useAvis'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import { STATUTS_DEMANDE } from '@/utils/constants'

const defaultAvis = { note: 5, commentaire: '' }

export default function DashboardClientPage() {
  const { user, loading } = useAuth()
  const { data: demandes = [], isLoading } = useDemandes()
  const createAvis = useCreateAvis()
  const [avisOpen, setAvisOpen] = useState(null)
  const [avisForm, setAvisForm] = useState(defaultAvis)

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

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Bonjour, {user?.prenom}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Suivez vos demandes et laissez un avis apres une prestation terminee.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Demandes envoyees', value: stats.total, color: 'text-gray-900' },
          { label: 'En attente', value: stats.enAttente, color: 'text-amber-600' },
          { label: 'Terminees', value: stats.terminees, color: 'text-accent-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-sand-100 flex items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-gray-900">Mes demandes</h2>
          <Link to="/artisans" className="btn-primary text-sm py-2 px-3">
            Trouver un artisan
          </Link>
        </div>

        {demandes.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="font-medium">Aucune demande envoyee</p>
            <p className="text-sm mt-1">Choisissez un artisan et envoyez votre premiere demande.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-sand-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Artisan</th>
                  <th className="px-5 py-3 font-semibold">Demande</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Avis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {demandes.map(demande => (
                  <tr key={demande.id} className="align-top">
                    <td className="px-5 py-4">
                      <Link to={`/artisans/${demande.artisan}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {demande.artisan_nom}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{demande.artisan_metier}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2">{demande.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${STATUTS_DEMANDE[demande.statut]?.color}`}>
                        {STATUTS_DEMANDE[demande.statut]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {demande.statut !== 'TERMINEE' ? (
                        <span className="text-xs text-gray-400">Disponible apres fin</span>
                      ) : demande.avis_id ? (
                        <span className="text-xs font-medium text-accent-600">Avis envoye</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAvis(demande)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Laisser un avis
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {avisOpen && (
        <section className="card p-5 mt-5">
          {demandes.filter(d => d.id === avisOpen).map(demande => (
            <form key={demande.id} onSubmit={(e) => submitAvis(e, demande)} className="grid md:grid-cols-[180px_1fr_auto] gap-4 items-start">
              <div>
                <p className="text-xs text-gray-400 mb-1">Note</p>
                <select
                  value={avisForm.note}
                  onChange={e => setAvisForm(f => ({ ...f, note: e.target.value }))}
                  className="input-field"
                >
                  {[5, 4, 3, 2, 1].map(note => (
                    <option key={note} value={note}>{note} / 5</option>
                  ))}
                </select>
                <div className="mt-2">
                  <StarRating note={Number(avisForm.note)} size="sm" showNote={false} />
                </div>
              </div>

              <textarea
                value={avisForm.commentaire}
                onChange={e => setAvisForm(f => ({ ...f, commentaire: e.target.value }))}
                placeholder={`Votre retour sur ${demande.artisan_nom}`}
                rows={4}
                className="input-field resize-none"
              />

              <div className="flex md:flex-col gap-2">
                <button type="submit" className="btn-primary text-sm" disabled={createAvis.isLoading}>
                  {createAvis.isLoading ? 'Envoi...' : 'Publier'}
                </button>
                <button type="button" onClick={() => setAvisOpen(null)} className="btn-secondary text-sm">
                  Annuler
                </button>
              </div>
            </form>
          ))}
        </section>
      )}
    </main>
  )
}
