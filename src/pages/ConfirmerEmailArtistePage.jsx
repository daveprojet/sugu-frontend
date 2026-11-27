import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import Spinner from '@/components/common/Spinner'

/** Lien reçu par e-mail : confirme l'adresse de l'artiste (connecté ou non, sur n'importe quel appareil). */
export default function ConfirmerEmailArtistePage() {
  const [params] = useSearchParams()
  const qc = useQueryClient()
  const [etat, setEtat] = useState({ statut: 'encours', message: '' })
  const dejaEnvoye = useRef(false)

  useEffect(() => {
    if (dejaEnvoye.current) return // StrictMode : un seul appel
    dejaEnvoye.current = true
    const jeton = params.get('jeton')
    if (!jeton) {
      setEtat({ statut: 'erreur', message: 'Lien incomplet. Ouvrez de nouveau le lien reçu par e-mail.' })
      return
    }
    marketplaceService.confirmerEmail(jeton)
      .then(({ data }) => {
        qc.invalidateQueries('marketplace-mon-profil')
        setEtat({ statut: 'ok', message: `Votre adresse ${data.email} est confirmée.` })
      })
      .catch((err) => setEtat({ statut: 'erreur', message: extractApiError(err, 'Ce lien n’est pas valide.') }))
  }, [params, qc])

  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      {etat.statut === 'encours' && <Spinner size="lg" />}
      {etat.statut === 'ok' && (
        <>
          <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Adresse confirmée</h1>
          <p className="mt-2 text-muted">{etat.message} L’équipe Bricolibe peut maintenant valider votre profil.</p>
          <Link to="/espace-artiste" className="mt-6 inline-flex rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-bold text-white">Suivre mon inscription</Link>
        </>
      )}
      {etat.statut === 'erreur' && (
        <>
          <XCircle className="w-14 h-14 mx-auto text-red-500" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Confirmation impossible</h1>
          <p className="mt-2 text-muted">{etat.message}</p>
          <Link to="/espace-artiste" className="mt-6 inline-flex rounded-lg border border-line px-5 py-3 text-sm font-bold text-ink hover:bg-canvas-soft">Demander un nouveau lien</Link>
        </>
      )}
    </main>
  )
}
