import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { ArrowLeft, Crown, UserMinus, UserPlus } from 'lucide-react'
import Spinner from '@/components/common/Spinner'
import PhoneField from '@/components/common/PhoneField'
import { entrepriseService } from '@/services/api'
import { extractApiError } from '@/utils/errors'

const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-colors'

/** Comptes de l'entreprise : jusqu'à 5. Le compte principal ajoute et retire ses collègues. */
export default function EquipeEntreprisePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery('membres-entreprise', () => entrepriseService.membres().then((r) => r.data))
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '' })
  const rafraichir = () => qc.invalidateQueries('membres-entreprise')
  const ajouter = useMutation((donnees) => entrepriseService.ajouterMembre(donnees), {
    onSuccess: () => {
      rafraichir()
      setForm({ prenom: '', nom: '', telephone: '' })
      toast.success('Compte créé : votre collègue reçoit un SMS pour choisir son mot de passe.')
    },
    onError: (e) => toast.error(extractApiError(e, 'Impossible d’ajouter ce compte')),
  })
  const retirer = useMutation((uid) => entrepriseService.retirerMembre(uid), {
    onSuccess: () => { rafraichir(); toast.success('Compte retiré.') },
    onError: (e) => toast.error(extractApiError(e, 'Impossible de retirer ce compte')),
  })

  if (isLoading || !data) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  const { membres, max, est_gestionnaire: estGestionnaire } = data
  const placesLibres = max - membres.length

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/espace-entreprise" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Mes demandes
      </Link>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Mon équipe</h1>
      <p className="text-sm text-muted mt-1 mb-6">
        {membres.length} compte(s) sur {max}. Tous les comptes voient et créent les demandes de l’entreprise.
      </p>

      <ul className="grid gap-3 mb-6">
        {membres.map((membre) => (
          <li key={membre.uid} className="flex items-center gap-3 bg-white border border-line rounded-2xl p-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink flex items-center gap-1.5">
                {membre.prenom} {membre.nom}
                {membre.est_gestionnaire && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" /> Compte principal
                  </span>
                )}
              </p>
              <p className="text-sm text-muted">{membre.telephone}</p>
            </div>
            {estGestionnaire && !membre.est_gestionnaire && (
              <button
                type="button"
                disabled={retirer.isLoading}
                onClick={() => window.confirm(`Retirer le compte de ${membre.prenom} ${membre.nom} ? Il ne pourra plus se connecter.`) && retirer.mutate(membre.uid)}
                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline"
              >
                <UserMinus className="w-4 h-4" /> Retirer
              </button>
            )}
          </li>
        ))}
      </ul>

      {estGestionnaire ? (
        placesLibres > 0 ? (
          <form
            onSubmit={(e) => { e.preventDefault(); ajouter.mutate(form) }}
            className="bg-white border border-line rounded-2xl p-5 grid gap-4"
          >
            <h2 className="font-semibold text-ink flex items-center gap-2"><UserPlus className="w-4 h-4" /> Ajouter un collègue</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className={champ} />
              <input required placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className={champ} />
            </div>
            <PhoneField value={form.telephone} onChange={(v) => setForm({ ...form, telephone: v || '' })} required />
            <p className="text-xs text-muted">Il recevra un SMS et choisira son mot de passe avec « Mot de passe oublié ».</p>
            <button
              type="submit"
              disabled={ajouter.isLoading}
              className="justify-self-start px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold"
            >
              {ajouter.isLoading ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-muted">Limite de {max} comptes atteinte : retirez un compte pour en ajouter un autre.</p>
        )
      ) : (
        <p className="text-sm text-muted">Seul le compte principal de l’entreprise peut ajouter ou retirer des comptes.</p>
      )}
    </main>
  )
}
