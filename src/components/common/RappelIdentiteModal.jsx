import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IdCard } from 'lucide-react'
import { useIdentite } from '@/hooks/useArtisans'
import { marquerRappelIdentiteVu, rappelIdentiteVu } from '@/utils/rappelIdentite'

const PAGE_IDENTITE = '/mon-profil/identite'

export default function RappelIdentiteModal({ artisanUid }) {
  const { data: identite, error } = useIdentite(artisanUid)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [vu, setVu] = useState(rappelIdentiteVu)

  const manquante = error?.response?.status === 404
  const rejetee = identite?.statut === 'REJETEE'
  const visible = !vu && (manquante || rejetee) && pathname !== PAGE_IDENTITE

  const fermer = () => {
    marquerRappelIdentiteVu()
    setVu(true)
  }

  useEffect(() => {
    if (!visible) return undefined
    const fermerSurEchap = (event) => {
      if (event.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', fermerSurEchap)
    return () => document.removeEventListener('keydown', fermerSurEchap)
  }, [visible])

  if (!visible) return null

  const fournir = () => {
    fermer()
    navigate(PAGE_IDENTITE)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={fermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rappel-identite-titre"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <IdCard className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id="rappel-identite-titre" className="font-display text-xl font-bold text-gray-900">
          {rejetee ? 'Votre pièce d’identité a été refusée' : 'Fournissez votre pièce d’identité'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {rejetee
            ? 'Votre profil n’est pas visible par les clients. Envoyez une nouvelle pièce pour qu’il soit vérifié.'
            : 'Votre profil n’est pas encore visible par les clients. Il le sera une fois votre pièce d’identité envoyée et validée par notre équipe.'}
        </p>
        {rejetee && identite.motif_rejet && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Motif : {identite.motif_rejet}</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={fermer}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Plus tard
          </button>
          <button
            type="button"
            autoFocus
            onClick={fournir}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Fournir ma pièce d’identité
          </button>
        </div>
      </div>
    </div>
  )
}
