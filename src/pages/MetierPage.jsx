import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ChevronRight, HelpCircle, MapPin } from 'lucide-react'
import ArtisanCard from '@/components/artisan/ArtisanCard'
import Spinner from '@/components/common/Spinner'
import NotFoundPage from '@/pages/NotFoundPage'
import { useSeo } from '@/hooks/useSeo'
import { artisanService } from '@/services/api'

const libelle = (p) => `${p.metier_pluriel.charAt(0).toUpperCase()}${p.metier_pluriel.slice(1)}${p.ville ? ` à ${p.ville}` : ' au Sénégal'}`

/** Page de référencement « métier » (/artisans/plombier) ou « métier × ville » (/artisans/plombier/dakar). */
export default function MetierPage() {
  const { uid: metier, suite: ville } = useParams()
  const { data: page, isLoading, isError } = useQuery(
    ['page-metier', metier, ville],
    () => artisanService.pageMetier(metier, ville).then((r) => r.data),
    { retry: false },
  )
  useSeo(
    page ? { titre: page.titre, description: page.description, chemin: page.chemin, noindex: !page.artisans.length }
      : isError ? { titre: 'Page introuvable | Bricolibe', noindex: true } : null,
  )

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (isError || !page) return <NotFoundPage />

  const liens = [...page.autres_villes, ...page.autres_metiers]

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-xs text-muted mb-4">
        <Link to="/" className="hover:text-ink">Accueil</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/artisans" className="hover:text-ink">Artisans</Link>
        <ChevronRight className="w-3 h-3" />
        {page.ville ? (
          <>
            <Link to={`/artisans/${page.metier_slug}`} className="hover:text-ink capitalize">{page.metier_pluriel}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">{page.ville}</span>
          </>
        ) : (
          <span className="text-ink capitalize">{page.metier_pluriel}</span>
        )}
      </nav>

      <header className="max-w-3xl">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-ink">{page.h1}</h1>
        <p className="mt-3 text-muted leading-relaxed">{page.intro}</p>
        {page.description_categorie && <p className="mt-2 text-sm text-muted">{page.description_categorie}</p>}
      </header>

      <section className="mt-8" aria-labelledby="liste-artisans">
        <h2 id="liste-artisans" className="sr-only">Liste des {page.metier_pluriel}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {page.artisans.map((artisan) => (
            <div key={artisan.uid} className="min-w-0"><ArtisanCard artisan={artisan} /></div>
          ))}
        </div>
        <Link
          to={`/artisans?categorie=${page.categorie.uid}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline"
        >
          Affiner la recherche (quartier, disponibilité…) <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      <div className="mt-12 max-w-3xl">
        <section className="rounded-xl border border-line bg-white p-5" aria-labelledby="faq-metier">
          <h2 id="faq-metier" className="flex items-center gap-2 text-lg font-bold text-ink">
            <HelpCircle className="w-5 h-5 text-indigo-600" /> Questions fréquentes
          </h2>
          <div className="mt-3 divide-y divide-line-soft">
            {page.faq.map((q) => (
              <details key={q.question} className="group py-3">
                <summary className="cursor-pointer list-none font-semibold text-sm text-ink flex items-center justify-between gap-3">
                  {q.question}
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm text-muted leading-relaxed">{q.reponse}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {liens.length > 0 && (
        <section className="mt-10" aria-labelledby="voir-aussi">
          <h2 id="voir-aussi" className="text-lg font-bold text-ink">Voir aussi</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {liens.map((p) => (
              <li key={p.chemin}>
                <Link
                  to={p.chemin}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink hover:border-indigo-300 hover:text-indigo-700"
                >
                  {p.ville && <MapPin className="w-3.5 h-3.5" />}{libelle(p)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
