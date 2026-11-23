import { Link, NavLink } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'

/**
 * Cadre des espaces de travail (entreprise, ouvrier partenaire), dans l'esprit des tableaux
 * de bord de l'équipe : barre latérale indigo sur ordinateur, en-tête de page et contenu.
 * Sur téléphone, la navigation passe par la barre d'onglets du bas (NavigationRole).
 *
 * liens : [{ to, label, Icon, compteur, exact }] ; marque : { titre, sousTitre, Icon }.
 */
export default function EspaceLayout({ marque, liens, titre, sousTitre, actions, children }) {
  const MarqueIcon = marque.Icon
  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-canvas to-sky-50/50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 md:flex md:gap-6">
        <aside className="hidden md:flex md:w-64 shrink-0 flex-col self-start sticky top-24 rounded-2xl bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-950 text-white p-4 shadow-card">
          <div className="flex items-center gap-3 px-1 pb-4 mb-3 border-b border-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
              <MarqueIcon className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display font-bold leading-tight truncate">{marque.titre}</span>
              {marque.sousTitre && <span className="block text-xs text-indigo-200 truncate">{marque.sousTitre}</span>}
            </span>
          </div>
          <nav aria-label="Navigation de l’espace" className="grid gap-1">
            {liens.map(({ to, label, Icon, compteur, exact }) => (
              <NavLink
                key={to} to={to} end={exact}
                className={({ isActive }) => `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white ring-1 ring-white/10' : 'text-indigo-100 hover:bg-white/10 hover:text-white'
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
          <div className="mt-6 rounded-xl bg-white/10 p-3 text-xs text-indigo-100">
            <p className="flex items-center gap-1.5 font-semibold text-white"><LifeBuoy className="w-4 h-4" /> Besoin d’aide ?</p>
            <p className="mt-1">L’équipe Bricolibe au <a href="tel:+221778656562" className="font-semibold text-white underline underline-offset-2">+221 77 865 65 62</a></p>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="min-w-0">
              <p className="md:hidden text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
                <MarqueIcon className="w-4 h-4" /> {marque.titre}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">{titre}</h1>
              {sousTitre && <p className="text-sm text-muted mt-1">{sousTitre}</p>}
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
  indigo: 'bg-indigo-50 text-indigo-600',
  orange: 'bg-primary-50 text-primary-600',
  bleu: 'bg-sky-50 text-sky-600',
  rouge: 'bg-red-50 text-red-600',
  vert: 'bg-emerald-50 text-emerald-600',
}

/** Carte de chiffre clé ; `to` la rend cliquable ; `alerte` souligne en rouge. */
export function CarteChiffre({ label, valeur, aide, Icon, ton = 'indigo', to, alerte }) {
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
    <Link to={to} className={`${classe} transition-all hover:border-indigo-300 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500`}>
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
export function Barres({ donnees, couleur = 'bg-indigo-500' }) {
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
export const BOUTON_SECONDAIRE = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-white text-ink font-semibold hover:border-indigo-300 transition-colors'
