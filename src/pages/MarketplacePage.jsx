import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useInfiniteQuery, useQuery } from 'react-query'
import { Search, SlidersHorizontal, Palette, ArrowRight, X } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import OeuvreCard from '@/components/marketplace/OeuvreCard'
import Spinner from '@/components/common/Spinner'

const TRIS = [['', 'À la une et récentes'], ['prix', 'Prix croissant'], ['-prix', 'Prix décroissant']]
const FILTRES = ['categorie', 'q', 'prix_min', 'prix_max', 'ville', 'tri']

const champ = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'

export default function MarketplacePage() {
  const [params, setParams] = useSearchParams()
  const filtres = Object.fromEntries(FILTRES.map((k) => [k, params.get(k) || '']))
  const [recherche, setRecherche] = useState(filtres.q)
  const [plusDeFiltres, setPlusDeFiltres] = useState(Boolean(filtres.prix_min || filtres.prix_max || filtres.ville))

  const { data: categories = [] } = useQuery('marketplace-categories', () => marketplaceService.categories().then((r) => r.data), { staleTime: 30 * 60 * 1000 })
  const actifs = Object.fromEntries(Object.entries(filtres).filter(([, v]) => v))
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['marketplace-catalogue', actifs],
    ({ pageParam = 1 }) => marketplaceService.catalogue({ ...actifs, page: pageParam }).then((r) => r.data),
    { getNextPageParam: (dernier, pages) => (dernier.next ? pages.length + 1 : undefined), keepPreviousData: true },
  )
  const oeuvres = data?.pages.flatMap((p) => p.results) || []
  const total = data?.pages[0]?.count ?? 0

  const changer = (cle, valeur) => {
    const suivants = new URLSearchParams(params)
    if (valeur) suivants.set(cle, valeur)
    else suivants.delete(cle)
    setParams(suivants, { replace: true })
  }
  const filtresSecondaires = ['prix_min', 'prix_max', 'ville'].some((k) => filtres[k])
  const toutEffacer = () => { setRecherche(''); setParams({}, { replace: true }) }

  return (
    <main className="min-h-screen bg-canvas-soft">
      {/* En-tête */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600">Marketplace Bricolibe</p>
              <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Œuvres d’artistes du Sénégal</h1>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Peintures, sculptures, bijoux, céramiques… Des pièces uniques, achetées directement auprès de leurs créateurs.
              </p>
            </div>
            <Link to="/marketplace/devenir-artiste" className="inline-flex items-center gap-2 self-start rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 md:self-auto">
              <Palette className="h-4 w-4" aria-hidden="true" /> Vous êtes artiste ? Vendez vos œuvres
            </Link>
          </div>

          {/* Recherche et tri */}
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); changer('q', recherche.trim()) }}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Œuvre, artiste, technique…"
                aria-label="Rechercher" className={`${champ} pl-9`} />
            </div>
            <div className="flex gap-2">
              <select aria-label="Trier" value={filtres.tri} onChange={(e) => changer('tri', e.target.value)} className={`${champ} sm:w-52`}>
                {TRIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button type="button" onClick={() => setPlusDeFiltres((o) => !o)} aria-expanded={plusDeFiltres}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${filtresSecondaires ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-line bg-white text-ink'}`}>
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Filtres</span>
              </button>
            </div>
          </form>

          {plusDeFiltres && (
            <div key={`${filtres.prix_min}|${filtres.prix_max}|${filtres.ville}`} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <input type="number" min="0" inputMode="numeric" aria-label="Prix minimum" placeholder="Prix min (FCFA)" defaultValue={filtres.prix_min}
                onBlur={(e) => changer('prix_min', e.target.value)} className={champ} />
              <input type="number" min="0" inputMode="numeric" aria-label="Prix maximum" placeholder="Prix max (FCFA)" defaultValue={filtres.prix_max}
                onBlur={(e) => changer('prix_max', e.target.value)} className={champ} />
              <input aria-label="Ville" placeholder="Ville (ex. : Dakar)" defaultValue={filtres.ville}
                onBlur={(e) => changer('ville', e.target.value.trim())} className={`${champ} col-span-2 sm:col-span-1`} />
            </div>
          )}

          {/* Catégories */}
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {[{ slug: '', nom: 'Toutes' }, ...categories].map((c) => {
              const actif = filtres.categorie === c.slug
              return (
                <button key={c.slug || 'toutes'} type="button" onClick={() => changer('categorie', c.slug)} aria-pressed={actif}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${actif ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-line bg-white text-ink hover:border-indigo-300'}`}>
                  {c.nom}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : oeuvres.length === 0 ? (
          Object.keys(actifs).length ? (
            <div className="rounded-xl border border-line bg-white p-10 text-center">
              <p className="font-semibold text-ink">Aucune œuvre ne correspond à votre recherche.</p>
              <button type="button" onClick={toutEffacer} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:underline">
                <X className="h-4 w-4" aria-hidden="true" /> Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white p-10 text-center">
              <Palette className="mx-auto h-10 w-10 text-primary-500" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold text-ink">Les premières œuvres arrivent</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                La Marketplace ouvre ses portes. Vous êtes peintre, sculpteur, bijoutier ou céramiste ? Exposez vos œuvres parmi les premiers.
              </p>
              <Link to="/marketplace/devenir-artiste" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                Vendre mes œuvres <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">{total} œuvre{total > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {oeuvres.map((o) => <OeuvreCard key={o.uid} oeuvre={o} />)}
            </div>
            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                  className="rounded-lg border border-line bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60">
                  {isFetchingNextPage ? 'Chargement…' : 'Voir plus d’œuvres'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Bandeau confiance */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-3 rounded-xl border border-line bg-white p-5 text-sm sm:grid-cols-3">
          <p><b className="text-ink">Des artistes vérifiés</b><br /><span className="text-muted">Identité et travail contrôlés par l’équipe Bricolibe.</span></p>
          <p><b className="text-ink">Contact direct</b><br /><span className="text-muted">Appelez ou écrivez à l’artiste sur WhatsApp.</span></p>
          <p><b className="text-ink">Sans intermédiaire</b><br /><span className="text-muted">Vous réglez l’œuvre directement avec son créateur.</span></p>
        </div>
      </section>
    </main>
  )
}
