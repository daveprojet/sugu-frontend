import { useState } from 'react'
import { useQuery } from 'react-query'
import { toast } from 'react-toastify'
import { Check, Gift } from 'lucide-react'
import { marketplaceService } from '@/services/api'
import { extractApiError } from '@/utils/errors'
import { METHODES_PAYTECH } from '@/utils/constants'
import { prixFCFA } from '@/utils/helpers'
import Modale from '@/components/common/Modale'

const validite = (jours) => (jours >= 365 ? '1 an' : `${Math.round(jours / 30)} mois`)

function avantagesDuPack(p) {
  const liste = []
  if (p.bonus) liste.push(`${p.bonus} crédits bonus offerts (valables ${p.bonus_validite_jours} jours)`)
  if (p.remontees_auto_par_semaine) liste.push(`${p.remontees_auto_par_semaine} œuvre${p.remontees_auto_par_semaine > 1 ? 's' : ''} remontée${p.remontees_auto_par_semaine > 1 ? 's' : ''} automatiquement chaque semaine`)
  if (p.statistiques_detaillees) liste.push('Statistiques détaillées (vues et contacts par jour)')
  if (p.video) liste.push('Vidéo de présentation sur vos fiches')
  if (p.artistes_a_decouvrir) liste.push('Votre profil dans « Artistes à découvrir »')
  liste.push(`Crédits valables ${validite(p.validite_jours)}, non remboursables`)
  return liste
}

function ModaleAchat({ pack, lancement, onClose }) {
  const [methode, setMethode] = useState(METHODES_PAYTECH[0].value)
  const [accepte, setAccepte] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const payer = async () => {
    setEnvoi(true)
    try {
      const { data } = await marketplaceService.acheterCredits({ pack: pack.code, target_payment: methode, conditions_acceptees: true })
      window.location.assign(data.redirect_url)
    } catch (err) {
      toast.error(extractApiError(err, 'Le paiement n’a pas pu démarrer.'))
      setEnvoi(false)
    }
  }
  return (
    <Modale titre={`Pack ${pack.nom}`} onClose={onClose}>
      <div className="rounded-xl bg-canvas-soft p-4">
        <p className="text-2xl font-extrabold text-ink">{prixFCFA(pack.prix)}</p>
        <p className="text-sm text-ink">
          <b>{pack.credits_recus} crédits</b>{pack.credits_recus > pack.credits && <span className="text-[#1f6b45]"> (dont {pack.credits_recus - pack.credits} offerts au lancement)</span>}
          {pack.bonus > 0 && <> + {pack.bonus} bonus</>}
        </p>
      </div>
      <fieldset className="mt-4">
        <legend className="mb-2 text-xs font-semibold text-muted">Payer avec</legend>
        <div className="grid grid-cols-2 gap-2">
          {METHODES_PAYTECH.map(({ value, label }) => (
            <label key={value} className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm font-semibold ${methode === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-line text-ink'}`}>
              <input type="radio" name="methode" value={value} checked={methode === value} onChange={() => setMethode(value)} className="sr-only" />{label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 flex items-start gap-2 text-sm text-muted">
        <input type="checkbox" className="mt-0.5" checked={accepte} onChange={(e) => setAccepte(e.target.checked)} />
        <span>
          J’ai compris que les crédits sont valables {validite(pack.validite_jours)}
          {lancement ? ' à compter de la fin de la phase de lancement' : ' à compter de l’achat'} et qu’ils ne sont pas remboursables.
        </span>
      </label>
      <button type="button" onClick={payer} disabled={!accepte || envoi}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
        {envoi ? 'Redirection vers le paiement…' : `Payer ${prixFCFA(pack.prix)}`}
      </button>
      <p className="mt-2 text-center text-xs text-muted">Paiement sécurisé par PayTech. Vos crédits sont ajoutés dès la confirmation.</p>
    </Modale>
  )
}

/** Les 4 packs de crédits, avec leurs avantages (sur le modèle des forfaits d'Expat-Dakar). */
export default function PacksCredits() {
  const { data: regles } = useQuery('marketplace-regles', () => marketplaceService.regles().then((r) => r.data), { staleTime: 5 * 60 * 1000 })
  const [choisi, setChoisi] = useState(null)
  if (!regles) return null
  const lancement = regles.lancement.actif
  return (
    <section>
      <h3 className="font-display text-lg font-bold text-ink">Acheter des crédits</h3>
      <p className="mb-4 text-sm text-muted">1 crédit = {prixFCFA(regles.credit_fcfa)}. Plus le pack est grand, plus le crédit revient moins cher.</p>
      {lancement && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-[#bfe9cf] bg-[#eef8f2] px-4 py-3 text-sm text-[#1f6b45]">
          <Gift className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span><b>Offre de lancement :</b> +{regles.lancement.bonus_fondateur_pourcent} % de crédits sur tous les packs, et leur validité ne démarre qu’à la fin de la phase de lancement.</span>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {regles.packs.map((p) => (
          <article key={p.code} className={`relative flex flex-col rounded-xl border bg-white p-5 ${p.populaire ? 'border-primary-400 shadow-[0_6px_18px_rgba(232,117,10,.12)]' : 'border-line'}`}>
            {p.populaire && <span className="absolute -top-2.5 left-5 rounded-full bg-primary-500 px-2.5 py-0.5 text-[11px] font-bold text-white">Populaire</span>}
            <p className="font-bold text-ink">{p.nom}</p>
            <p className={`mt-1 text-sm font-bold ${p.economie_pourcent ? 'text-primary-600' : 'text-muted'}`}>Économisez {p.economie_pourcent} %</p>
            <p className="mt-3 text-2xl font-extrabold text-ink">{prixFCFA(p.prix)}</p>
            <p className="text-sm text-ink">
              <b>{p.credits_recus} crédits</b>
              {p.credits_recus > p.credits && <span className="ml-1 text-xs text-muted line-through">{p.credits}</span>}
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-xs text-muted">
              {avantagesDuPack(p).map((a) => (
                <li key={a} className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1f6b45]" aria-hidden="true" />{a}</li>
              ))}
            </ul>
            <button type="button" onClick={() => setChoisi(p)}
              className={`mt-5 rounded-lg px-4 py-2.5 text-sm font-bold ${p.populaire ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              Acheter
            </button>
          </article>
        ))}
      </div>
      {choisi && <ModaleAchat pack={choisi} lancement={lancement} onClose={() => setChoisi(null)} />}
    </section>
  )
}
