import { Link } from 'react-router-dom'
import { MapPin, Star, Truck } from 'lucide-react'
import { prixFCFA } from '@/utils/helpers'

const ETIQUETTES = {
  URGENT: { texte: 'Urgent', classe: 'bg-red-600 text-white' },
  PROMO: { texte: 'Promo', classe: 'bg-primary-500 text-white' },
}

/** Carte d'une œuvre dans le catalogue : toute la carte mène à la fiche. */
export default function OeuvreCard({ oeuvre }) {
  const etiquette = ETIQUETTES[oeuvre.etiquette]
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-150 hover:border-indigo-300 hover:shadow-[0_6px_18px_rgba(22,48,91,.08)]">
      <div className="relative aspect-square overflow-hidden bg-canvas">
        {oeuvre.photo ? (
          <img src={oeuvre.photo} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Pas de photo</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {oeuvre.a_la_une && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-primary-600 shadow-sm">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" /> À la une
            </span>
          )}
          {etiquette && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm ${etiquette.classe}`}>{etiquette.texte}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-semibold text-indigo-700">{oeuvre.categorie?.nom}</p>
        <h3 className="line-clamp-2 text-sm font-bold text-ink">
          {/* Le lien couvre toute la carte (after:inset-0). */}
          <Link to={oeuvre.chemin} className="after:absolute after:inset-0">{oeuvre.titre}</Link>
        </h3>
        <p className="text-base font-extrabold text-ink">{prixFCFA(oeuvre.prix)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted">
          <span className="truncate">{oeuvre.artiste?.nom}</span>
          {oeuvre.artiste?.ville && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{oeuvre.artiste.ville}</span>
          )}
          {oeuvre.livraison_possible && (
            <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" aria-hidden="true" />Livraison</span>
          )}
        </div>
      </div>
    </article>
  )
}
