import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ChevronLeft, MapPin, MessageCircle, Phone } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { useSeo } from '@/hooks/useSeo'
import BackLink from '@/components/common/BackLink'
import BoutonPartage from '@/components/common/BoutonPartage'
import OeuvreCard from '@/components/marketplace/OeuvreCard'
import Spinner from '@/components/common/Spinner'

const chiffres = (tel) => (tel || '').replace(/\D/g, '')

export default function ArtisteMarketplacePage() {
  const { segment } = useParams()
  const { data, isLoading, error } = useQuery(['marketplace-artiste', segment], () => marketplaceService.artiste(segment).then((r) => r.data), { retry: false })
  const artiste = data?.artiste
  const oeuvres = data?.oeuvres || []
  const specialites = (artiste?.specialites || []).map((s) => s.nom)

  useSeo(artiste ? {
    titre: `${artiste.nom}${specialites.length ? ` — ${specialites.slice(0, 3).join(', ')}` : ''}${artiste.ville ? ` à ${artiste.ville}` : ''} | Marketplace Bricolibe`,
    description: `Œuvres de ${artiste.nom}${artiste.ville ? ` à ${artiste.ville}` : ''} sur la Marketplace Bricolibe. ${artiste.bio || ''}`.replace(/\s+/g, ' ').trim().slice(0, 160),
    image: artiste.photo || undefined,
    type: 'profile',
    chemin: artiste.chemin,
    noindex: oeuvres.length === 0,
  } : null)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (error || !artiste) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-ink">Artiste introuvable</h1>
        <Link to="/marketplace" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Voir le catalogue</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <BackLink fallback="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-indigo-600">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Retour
      </BackLink>

      <section className="mt-4 flex flex-col gap-5 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-start sm:p-6">
        {artiste.photo
          ? <img src={artiste.photo} alt="" className="h-24 w-24 shrink-0 rounded-full border border-line object-cover" />
          : <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-3xl font-extrabold uppercase text-indigo-700">{artiste.nom?.[0]}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary-600">Artiste de la Marketplace</p>
          <h1 className="font-display text-2xl font-bold text-ink">{artiste.nom}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {specialites.length > 0 && <span>{specialites.join(' · ')}</span>}
            {artiste.ville && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{[artiste.quartier, artiste.ville].filter(Boolean).join(', ')}</span>}
          </div>
          {artiste.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">{artiste.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`https://wa.me/${chiffres(artiste.whatsapp)}?text=${encodeURIComponent(`Bonjour ${artiste.nom}, j’ai vu vos œuvres sur Bricolibe.`)}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1ebe5d]">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
            <a href={`tel:${artiste.telephone}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas-soft">
              <Phone className="h-4 w-4" aria-hidden="true" /> Appeler
            </a>
            <BoutonPartage chemin={artiste.chemin} titre={`${artiste.nom} | Bricolibe`}
              texte={`Découvre les œuvres de ${artiste.nom} sur la Marketplace Bricolibe`} libelle="Partager" messageCopie="Lien de l’artiste copié" />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Ses œuvres{oeuvres.length ? ` · ${oeuvres.length}` : ''}</h2>
        {oeuvres.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {oeuvres.map((o) => <OeuvreCard key={o.uid} oeuvre={o} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">Aucune œuvre en ligne pour le moment.</p>
        )}
      </section>
    </main>
  )
}
