import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Phone, MessageCircle, MapPin, Truck, Handshake, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { useSeo } from '@/hooks/useSeo'
import { prixFCFA } from '@/utils/helpers'
import BackLink from '@/components/common/BackLink'
import BoutonPartage from '@/components/common/BoutonPartage'
import Spinner from '@/components/common/Spinner'

const chiffres = (tel) => (tel || '').replace(/\D/g, '')

function Galerie({ photos, titre }) {
  const [index, setIndex] = useState(0)
  useEffect(() => { setIndex(0) }, [photos])
  if (!photos.length) return <div className="flex aspect-square items-center justify-center rounded-xl bg-canvas text-muted">Pas de photo</div>
  const precedente = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const suivante = () => setIndex((i) => (i + 1) % photos.length)
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-canvas">
        <img src={photos[index].image} alt={titre} className="aspect-square w-full object-contain" />
        {photos.length > 1 && (
          <>
            <button type="button" onClick={precedente} aria-label="Photo précédente" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={suivante} aria-label="Photo suivante" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{index + 1} / {photos.length}</span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setIndex(i)} aria-label={`Photo ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <img src={p.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OeuvrePage() {
  const { segment } = useParams()
  const { data: oeuvre, isLoading, error } = useQuery(['marketplace-oeuvre', segment], () => marketplaceService.oeuvre(segment).then((r) => r.data), { retry: false })

  useSeo(oeuvre ? {
    titre: `${oeuvre.titre} — ${oeuvre.categorie?.nom} par ${oeuvre.artiste?.nom} | Marketplace Bricolibe`,
    description: `${oeuvre.categorie?.nom} de ${oeuvre.artiste?.nom}, ${prixFCFA(oeuvre.prix)}. ${oeuvre.description}`.replace(/\s+/g, ' ').slice(0, 160),
    image: oeuvre.photos?.[0]?.image,
    type: 'product',
    chemin: oeuvre.chemin,
  } : null)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (error || !oeuvre) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-ink">Cette œuvre n’est plus en ligne</h1>
        <p className="mt-2 text-muted">Elle a peut-être été vendue. Découvrez les autres œuvres de la Marketplace.</p>
        <Link to="/marketplace" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Voir le catalogue</Link>
      </main>
    )
  }

  const { artiste } = oeuvre
  const compter = (canal) => { marketplaceService.contact(segment, canal).catch(() => {}) }
  const messageWhatsapp = `Bonjour ${artiste.nom}, votre œuvre « ${oeuvre.titre} » (${prixFCFA(oeuvre.prix)}) vue sur Bricolibe m’intéresse : ${window.location.origin}${oeuvre.chemin}`
  const dispo = oeuvre.disponibilite === 'SERIE'
    ? `En série · ${oeuvre.quantite} disponible${oeuvre.quantite > 1 ? 's' : ''}`
    : 'Pièce unique'

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <BackLink fallback="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Retour
      </BackLink>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <Galerie photos={oeuvre.photos || []} titre={oeuvre.titre} />

        <div className="flex flex-col gap-5">
          <div>
            <Link to={`/marketplace?categorie=${oeuvre.categorie?.slug}`} className="text-sm font-semibold text-indigo-700 hover:underline">{oeuvre.categorie?.nom}</Link>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">{oeuvre.titre}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-2xl font-extrabold text-ink">{prixFCFA(oeuvre.prix)}</p>
              {oeuvre.a_la_une && <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-600"><Star className="h-3 w-3 fill-current" aria-hidden="true" />À la une</span>}
              {oeuvre.etiquette === 'URGENT' && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">Urgent</span>}
              {oeuvre.etiquette === 'PROMO' && <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-bold text-white">Promo</span>}
            </div>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-ink">
            <li className="flex items-center gap-2"><Package className="h-4 w-4 text-muted" aria-hidden="true" />{dispo}</li>
            <li className="flex items-center gap-2">
              {oeuvre.livraison_possible
                ? <><Truck className="h-4 w-4 text-muted" aria-hidden="true" />Livraison possible, à convenir avec l’artiste</>
                : <><Handshake className="h-4 w-4 text-muted" aria-hidden="true" />Retrait à convenir avec l’artiste</>}
            </li>
            {artiste.ville && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted" aria-hidden="true" />{[artiste.quartier, artiste.ville].filter(Boolean).join(', ')}</li>}
          </ul>

          {/* Contact direct */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-white p-4">
            <p className="text-sm font-semibold text-ink">Intéressé·e ? Contactez directement l’artiste</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a href={`https://wa.me/${chiffres(artiste.whatsapp)}?text=${encodeURIComponent(messageWhatsapp)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => compter('whatsapp')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1ebe5d]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </a>
              <a href={`tel:${artiste.telephone}`} onClick={() => compter('appel')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                <Phone className="h-4 w-4" aria-hidden="true" /> Appeler
              </a>
            </div>
            <p className="text-xs text-muted">Le prix, le paiement et la remise de l’œuvre se règlent directement avec l’artiste.</p>
          </div>

          <BoutonPartage chemin={oeuvre.chemin} titre={`${oeuvre.titre} | Bricolibe`}
            texte={`Regarde cette œuvre de ${artiste.nom} sur Bricolibe : « ${oeuvre.titre} », ${prixFCFA(oeuvre.prix)}`}
            libelle="Partager cette œuvre" messageCopie="Lien de l’œuvre copié" pleineLargeur />

          <section>
            <h2 className="mb-2 font-bold text-ink">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{oeuvre.description}</p>
          </section>

          {oeuvre.video && (
            <video src={oeuvre.video} controls preload="metadata" className="w-full rounded-xl border border-line" />
          )}

          {/* Artiste */}
          <Link to={artiste.chemin} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 hover:border-indigo-300">
            {artiste.photo
              ? <img src={artiste.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
              : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg font-extrabold uppercase text-indigo-700">{artiste.nom?.[0]}</span>}
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted">Artiste</span>
              <span className="block truncate font-bold text-ink">{artiste.nom}</span>
              {artiste.specialites?.length > 0 && <span className="block truncate text-xs text-muted">{artiste.specialites.map((s) => s.nom).join(' · ')}</span>}
            </span>
            <span className="text-sm font-semibold text-indigo-700">Voir ses œuvres</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
