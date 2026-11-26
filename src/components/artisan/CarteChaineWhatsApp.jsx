import { useState } from 'react'
import { Megaphone, ExternalLink, X } from 'lucide-react'
import { CHAINE_WHATSAPP_URL } from '@/utils/constants'

const CLE = 'bricolibe_chaine_whatsapp_masquee'

/** Carte masquée ou non (mémorisé dans ce navigateur). */
export function useChaineMasquee() {
  const [masquee, setMasquee] = useState(() => {
    try { return localStorage.getItem(CLE) === '1' } catch { return false }
  })
  const masquer = () => {
    try { localStorage.setItem(CLE, '1') } catch { /* stockage indisponible */ }
    setMasquee(true)
  }
  return [masquee, masquer]
}

/** Lien discret vers la chaîne, affiché en bas du tableau de bord une fois la carte masquée. */
export function LienChaineWhatsApp() {
  return (
    <p className="text-center text-sm text-muted">
      <a href={CHAINE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[#1f7a46] hover:underline">
        <Megaphone className="w-4 h-4" aria-hidden="true" /> Chaîne WhatsApp Bricolibe
      </a>
    </p>
  )
}

/** Invitation à rejoindre la chaîne WhatsApp Bricolibe (tableau de bord artisan). */
export default function CarteChaineWhatsApp({ onMasquer }) {
  return (
    <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-3 bg-[#e7f8ee] border border-[#bfe9cf] rounded-xl p-4 pr-11 text-[#14532d]">
      <Megaphone className="w-5 h-5 shrink-0 text-[#1f9d55]" aria-hidden="true" />
      <span className="flex-1 min-w-[12rem] text-sm">
        <span className="font-semibold">Rejoignez la chaîne WhatsApp Bricolibe</span>
        <span className="block text-[#166534]/80">Actualités, nouveautés et conseils pour les artisans.</span>
      </span>
      <a
        href={CHAINE_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-[#1f9d55] hover:bg-[#188a4a] px-3 py-2 text-sm font-semibold text-white whitespace-nowrap transition-colors"
      >
        Rejoindre <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={onMasquer}
        aria-label="Masquer"
        className="absolute top-2 right-2 rounded-full p-1.5 text-[#166534]/70 hover:bg-white/60 hover:text-[#14532d]"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
