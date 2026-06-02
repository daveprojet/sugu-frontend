import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { METIERS, QUARTIERS_DAKAR, VILLES } from '@/utils/constants'
import { toast } from 'react-toastify'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isArtisanFlow = params.get('role') === 'artisan'

  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', password: '',
    role: isArtisanFlow ? 'artisan' : 'client',
    metier: '', quartier: '', ville: 'Dakar', bio: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      console.log(form)
      toast.success('Compte créé avec succès !')
      navigate(form.role === 'artisan' ? '/dashboard-artisan' : '/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-sand-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900">Créer un compte</h1>
        </div>

        <div className="card p-8">
          {/* Toggle client / artisan */}
          <div className="flex bg-sand-100 rounded-xl p-1 mb-6">
            {['client', 'artisan'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => set('role', r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  form.role === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {r === 'client' ? '👤 Client' : '🔧 Artisan'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input value={form.prenom} onChange={e => set('prenom', e.target.value)} required className="input-field" placeholder="Moussa" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                <input value={form.nom} onChange={e => set('nom', e.target.value)} required className="input-field" placeholder="Diallo" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input type="tel" value={form.telephone} onChange={e => set('telephone', e.target.value)} required className="input-field" placeholder="+221 77 000 00 00" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} className="input-field" placeholder="6 caractères minimum" />
            </div>

            {/* Champs artisan */}
            {form.role === 'artisan' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier</label>
                  <select value={form.metier} onChange={e => set('metier', e.target.value)} required className="input-field">
                    <option value="">Choisissez votre métier</option>
                    {METIERS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartier</label>
                    <select value={form.quartier} onChange={e => set('quartier', e.target.value)} className="input-field">
                      <option value="">Quartier</option>
                      {QUARTIERS_DAKAR.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
                    <select value={form.ville} onChange={e => set('ville', e.target.value)} className="input-field">
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Présentation (optionnel)</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} className="input-field resize-none" placeholder="Décrivez votre expérience, vos spécialités..." />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-primary-500 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
