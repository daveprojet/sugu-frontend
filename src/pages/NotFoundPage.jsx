import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

/** Adresse inconnue : vraie page « introuvable » (en noindex), plutôt qu'un renvoi vers l'accueil
 *  que les moteurs prendraient pour un doublon de la page d'accueil. */
export default function NotFoundPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="font-display text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Cette page n’existe pas</h1>
      <p className="mt-2 text-muted">Le lien est peut-être ancien ou mal recopié.</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary inline-flex items-center justify-center">Retour à l’accueil</Link>
        <Link
          to="/artisans"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas-soft"
        >
          <Search className="w-4 h-4" /> Trouver un artisan
        </Link>
      </div>
    </main>
  )
}
