import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LifeBuoy, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logo from '/images/logo.png'

/**
 * Cadre des espaces de travail (entreprise, ouvrier partenaire), comme les tableaux de bord de
 * l'équipe : sur ordinateur, barre latérale bleue fixe sur toute la hauteur, barre du haut et
 * contenu sur toute la largeur de l'écran (la barre du site est masquée). Sur téléphone, la
 * barre du site reste et la navigation passe par la barre d'onglets du bas (NavigationRole).
 *
 * liens : [{ to, label, Icon, compteur, exact }] ; marque : { titre, sousTitre, Icon }.
 */
export default function EspaceLayout({ marque, liens, titre, sousTitre, actions, children }) {
  const MarqueIcon = marque.Icon
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const deconnexion = async () => {
    await logout()
    navigate('/')
  }
  const initiales = [user?.prenom, user?.nom].filter(Boolean).map((mot) => mot[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen bg-[#f3f6fc]">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-[#1748a5] text-white">
        <Link to="/" className="flex items-center gap-2.5 h-16 px-5 border-b border-white/10 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-1"><img src={logo} alt="Bricolibe" /></span>
          <span className="font-display font-bold text-lg tracking-tight">Bricolibe</span>
        </Link>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
            <MarqueIcon className="w-5 h-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold leading-tight truncate">{marque.titre}</span>
            {marque.sousTitre && <span className="block text-xs text-blue-100/80 truncate">{marque.sousTitre}</span>}
          </span>
        </div>
        <nav aria-label="Navigation de l’espace" className="flex-1 overflow-y-auto px-3 py-4 grid content-start gap-1">
          {liens.map(({ to, label, Icon, compteur, exact }) => (
            <NavLink
              key={to} to={to} end={exact}
              className={({ isActive }) => `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/15 text-white' : 'text-blue-50/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary-400" aria-hidden="true" />}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1">{label}</span>
                  {compteur > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-5 text-center">
                      {compteur > 9 ? '9+' : compteur}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4 grid gap-2 shrink-0">
          <div className="rounded-lg bg-white/10 p-3 text-xs text-blue-50/90">
            <p className="flex items-center gap-1.5 font-semibold text-white"><LifeBuoy className="w-4 h-4" /> Besoin d’aide ?</p>
            <p className="mt-1">Bricolibe au <a href="tel:+221778656562" className="font-semibold text-white underline underline-offset-2">+221 77 865 65 62</a></p>
          </div>
          <NavLink
            to="/mon-profil"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-50/90 hover:bg-white/10 hover:text-white transition-colors"
          >
            <UserRound className="w-[18px] h-[18px]" /> Mon profil
          </NavLink>
          <button
            type="button" onClick={deconnexion}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-50/90 hover:bg-white/10 hover:text-white transition-colors text-left"
          >
            <LogOut className="w-[18px] h-[18px]" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="md:pl-64 min-w-0">
        <div className="hidden md:flex sticky top-0 z-30 h-16 items-center justify-between gap-4 px-8 bg-white/95 backdrop-blur border-b border-line">
          <p className="text-sm text-muted truncate">
            <span className="font-semibold text-ink">{marque.titre}</span>
            <span className="mx-2 text-line">/</span>{titre}
          </p>
          <span className="flex items-center gap-2.5 text-sm">
            <span className="text-right leading-tight">
              <span className="block font-semibold text-ink">{[user?.prenom, user?.nom].filter(Boolean).join(' ')}</span>
              <span className="block text-xs text-muted">{marque.sousTitre}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1748a5] text-white text-xs font-bold">{initiales || '?'}</span>
          </span>
        </div>

        <main className="px-4 md:px-8 py-6 md:py-8">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="min-w-0">
              <p className="md:hidden text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 mb-1">
                <MarqueIcon className="w-4 h-4" /> {marque.titre}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">{titre}</h1>
              {sousTitre && <div className="text-sm text-muted mt-1">{sousTitre}</div>}
            </div>
            {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

const TONS = {
  principal: 'bg-blue-50 text-blue-700',
  orange: 'bg-primary-50 text-primary-600',
  bleu: 'bg-sky-50 text-sky-600',
  rouge: 'bg-red-50 text-red-600',
  vert: 'bg-emerald-50 text-emerald-600',
}

/** Carte de chiffre clé ; `to` la rend cliquable ; `alerte` souligne en rouge. */
export function CarteChiffre({ label, valeur, aide, Icon, ton = 'principal', to, alerte }) {
  const contenu = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        {Icon && <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONS[ton]}`}><Icon className="w-4 h-4" /></span>}
      </div>
      <strong className="block font-display text-3xl font-bold text-ink mt-2 leading-none">{valeur}</strong>
      {alerte && <span className="block text-xs font-semibold text-red-600 mt-2">{alerte}</span>}
      {aide && <span className="block text-xs text-muted mt-2">{aide}</span>}
    </>
  )
  const classe = 'block bg-white border border-line rounded-2xl p-4 shadow-sm'
  if (!to) return <article className={classe}>{contenu}</article>
  return (
    <Link to={to} className={`${classe} transition-all hover:border-blue-300 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500`}>
      {contenu}
    </Link>
  )
}

/** Bloc blanc avec un titre et une action facultative. */
export function Panneau({ titre, action, children, className = '' }) {
  return (
    <section className={`bg-white border border-line rounded-2xl p-5 shadow-sm ${className}`}>
      {(titre || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {titre && <h2 className="font-semibold text-ink">{titre}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** Petites barres (ex. demandes par mois) : [{ libelle, valeur }]. */
export function Barres({ donnees, couleur = 'bg-blue-500' }) {
  const max = Math.max(1, ...donnees.map((d) => d.valeur))
  return (
    <div className="flex items-end gap-2 h-32" role="img" aria-label={donnees.map((d) => `${d.libelle} : ${d.valeur}`).join(', ')}>
      {donnees.map((d) => (
        <div key={d.libelle} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
          <span className="text-[11px] font-semibold text-ink">{d.valeur || ''}</span>
          <span className={`w-full max-w-[34px] rounded-t-md ${couleur}`} style={{ height: `${Math.max(4, (d.valeur / max) * 100)}%`, opacity: d.valeur ? 1 : 0.25 }} />
          <span className="text-[11px] text-muted capitalize">{d.libelle}</span>
        </div>
      ))}
    </div>
  )
}

export const BOUTON_PRINCIPAL = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm transition-colors'
export const BOUTON_SECONDAIRE = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-white text-ink font-semibold hover:border-blue-300 transition-colors'
