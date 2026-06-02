import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { useArtisan, useUpdateArtisan } from '@/hooks/useArtisans'
import Spinner from '@/components/common/Spinner'
import StarRating from '@/components/common/StarRating'
import { METIERS, QUARTIERS_DAKAR, VILLES } from '@/utils/constants'

export default function MonProfil() {
  const { user, loading, updateMe, fetchMe } = useAuth()
  const isArtisan = user?.role === 'artisan'
  const { data: artisan, isLoading: artisanLoading } = useArtisan(isArtisan ? user?.artisan_id : null)
  const updateArtisan = useUpdateArtisan()

  const [accountForm, setAccountForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
  })
  const [artisanForm, setArtisanForm] = useState({
    metier: '',
    ville: 'Dakar',
    quartier: '',
    bio: '',
    telephone: '',
    whatsapp: '',
    disponible: true,
  })
  const [savingAccount, setSavingAccount] = useState(false)

  useEffect(() => {
    if (!user) return
    setAccountForm({
      prenom: user.prenom || '',
      nom: user.nom || '',
      telephone: user.telephone || '',
    })
  }, [user])

  useEffect(() => {
    if (!artisan) return
    setArtisanForm({
      metier: artisan.metier || '',
      ville: artisan.ville || 'Dakar',
      quartier: artisan.quartier || '',
      bio: artisan.bio || '',
      telephone: artisan.telephone || '',
      whatsapp: artisan.whatsapp || '',
      disponible: artisan.disponible ?? true,
    })
  }, [artisan])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/connexion" replace />

  const setAccount = (key, value) => {
    setAccountForm(form => ({ ...form, [key]: value }))
  }

  const setArtisan = (key, value) => {
    setArtisanForm(form => ({ ...form, [key]: value }))
  }

  const saveAccount = async (e) => {
    e.preventDefault()
    setSavingAccount(true)
    try {
      await updateMe(accountForm)
      toast.success('Profil mis a jour.')
    } catch (error) {
      const detail = error.response?.data?.telephone?.[0]
        || error.response?.data?.detail
        || 'Impossible de mettre a jour le profil.'
      toast.error(detail)
    } finally {
      setSavingAccount(false)
    }
  }

  const saveArtisan = async (e) => {
    e.preventDefault()
    await updateArtisan.mutateAsync({
      id: user.artisan_id,
      data: artisanForm,
    })
    await fetchMe()
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-primary-600 font-medium mb-1">
            {isArtisan ? 'Profil artisan' : 'Profil client'}
          </p>
          <h1 className="font-display text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500 text-sm mt-1">Consultez et modifiez vos informations personnelles.</p>
        </div>

        {isArtisan && user.artisan_id && (
          <Link to={`/artisans/${user.artisan_id}`} className="btn-secondary text-sm">
            Voir mon profil public
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="card p-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-display font-bold text-2xl uppercase mb-4">
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <h2 className="font-display font-semibold text-gray-900">{user.prenom} {user.nom}</h2>
          <p className="text-sm text-gray-500 mt-1">{user.telephone}</p>
          <span className="badge bg-sand-100 text-gray-700 mt-4">
            {isArtisan ? 'Artisan' : 'Client'}
          </span>

          {isArtisan && artisan && (
            <div className="mt-5 pt-5 border-t border-sand-100">
              <p className="text-sm font-medium text-gray-900">{artisan.metier_label}</p>
              <p className="text-sm text-gray-500 mt-1">{artisan.quartier}, {artisan.ville}</p>
              <div className="mt-3">
                <StarRating note={artisan.note_moyenne || 0} size="sm" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{artisan.nb_avis || 0} avis</p>
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-5">
          <section className="card p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">Informations du compte</h2>
            <form onSubmit={saveAccount} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom</label>
                <input
                  value={accountForm.prenom}
                  onChange={e => setAccount('prenom', e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input
                  value={accountForm.nom}
                  onChange={e => setAccount('nom', e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
                <input
                  type="tel"
                  value={accountForm.telephone}
                  onChange={e => setAccount('telephone', e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary" disabled={savingAccount}>
                  {savingAccount ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </section>

          {isArtisan && (
            <section className="card p-6">
              <h2 className="font-display font-semibold text-gray-900 mb-4">Informations artisan</h2>

              {artisanLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : !artisan ? (
                <p className="text-sm text-gray-400">Profil artisan introuvable.</p>
              ) : (
                <form onSubmit={saveArtisan} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Metier</label>
                    <select
                      value={artisanForm.metier}
                      onChange={e => setArtisan('metier', e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Choisissez votre metier</option>
                      {METIERS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Disponibilite</label>
                    <select
                      value={artisanForm.disponible ? 'true' : 'false'}
                      onChange={e => setArtisan('disponible', e.target.value === 'true')}
                      className="input-field"
                    >
                      <option value="true">Disponible</option>
                      <option value="false">Indisponible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartier</label>
                    <select
                      value={artisanForm.quartier}
                      onChange={e => setArtisan('quartier', e.target.value)}
                      required
                      className="input-field"
                    >
                      <option value="">Quartier</option>
                      {QUARTIERS_DAKAR.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                    <select
                      value={artisanForm.ville}
                      onChange={e => setArtisan('ville', e.target.value)}
                      className="input-field"
                    >
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone public</label>
                    <input
                      type="tel"
                      value={artisanForm.telephone}
                      onChange={e => setArtisan('telephone', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      value={artisanForm.whatsapp}
                      onChange={e => setArtisan('whatsapp', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Presentation</label>
                    <textarea
                      value={artisanForm.bio}
                      onChange={e => setArtisan('bio', e.target.value)}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="Presentez votre experience, vos specialites et votre zone d'intervention."
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="btn-primary" disabled={updateArtisan.isLoading}>
                      {updateArtisan.isLoading ? 'Enregistrement...' : 'Enregistrer le profil artisan'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
