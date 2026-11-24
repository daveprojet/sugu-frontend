import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, LifeBuoy, MessageSquareWarning, ShieldCheck } from 'lucide-react'
import PhotosPicker from '@/components/demande/PhotosPicker'
import Galerie from '@/components/entreprise/Galerie'
import { dateHeure, useSitesEntreprise } from '@/hooks/useEntreprises'

const champ = 'w-full px-4 py-3 bg-canvas-soft border border-line rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
const MOTIFS = [
  ['DEFAUT', 'Le problème n’est pas réglé'],
  ['QUALITE', 'Travail mal fait ou inachevé'],
  ['DEGAT', 'Dégât causé pendant l’intervention'],
  ['COMPORTEMENT', 'Comportement de l’ouvrier'],
  ['AUTRE', 'Autre'],
]
const STATUTS = {
  OUVERTE: 'bg-primary-50 text-primary-700',
  NON_FONDEE: 'bg-gray-100 text-gray-700',
  REPRISE: 'bg-emerald-50 text-emerald-700',
  REMBOURSEMENT: 'bg-emerald-50 text-emerald-700',
}

/** Réclamation (48 h après l'intervention) et retour sous garantie (30 jours, même défaut). */
export function ApresVente({ demande, reclamer, garantie }) {
  const navigate = useNavigate()
  const av = demande.apres_vente
  const [ouvert, setOuvert] = useState(null) // 'reclamation' | 'garantie'
  const [form, setForm] = useState({ motif: 'DEFAUT', description: '' })
  const [photos, setPhotos] = useState([])
  if (!av || (!av.reclamations.length && !av.peut_reclamer && !av.sous_garantie && !av.retours_garantie.length)) return null

  const envoyer = (e) => {
    e.preventDefault()
    if (ouvert === 'reclamation') {
      reclamer.mutate({ ...form, photos }, { onSuccess: () => { setOuvert(null); setForm({ motif: 'DEFAUT', description: '' }); setPhotos([]) } })
    } else {
      garantie.mutate({ description: form.description, photos }, {
        onSuccess: (retour) => navigate(`/espace-entreprise/demandes/${retour.uid}`),
      })
    }
  }

  return (
    <section className="bg-white border border-line rounded-2xl p-5 mb-4 grid gap-4 shadow-sm">
      <h2 className="font-semibold text-ink flex items-center gap-2"><LifeBuoy className="w-4 h-4 text-blue-700" /> Après l’intervention</h2>

      {av.reclamations.map((r) => (
        <div key={r.uid} className="rounded-xl border border-line p-4 grid gap-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-ink">Réclamation · {r.motif_libelle}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUTS[r.statut] || ''}`}>{r.statut_libelle}</span>
          </div>
          <p className="text-muted whitespace-pre-line">{r.description}</p>
          {r.photos.length > 0 && <Galerie photos={r.photos} vide="" />}
          {r.statut === 'OUVERTE'
            ? <p className="text-xs text-muted">Envoyée {dateHeure(r.created_at)} · l’inspecteur répond avant le {dateHeure(r.echeance_examen)}.</p>
            : (
              <p className="text-sm bg-canvas-soft rounded-lg p-3">
                {r.decision && <><b>Réponse de l’inspecteur :</b> {r.decision}<br /></>}
                {r.montant_rembourse > 0 && <>Main-d’œuvre remboursée : {r.montant_rembourse.toLocaleString('fr-FR')} FCFA (déduits de votre facture ou remboursés par Bricolibe).<br /></>}
                <span className="text-xs text-muted">Traitée {dateHeure(r.traitee_at)}{r.traitee_par ? ` par ${r.traitee_par}` : ''}</span>
              </p>
            )}
        </div>
      ))}

      {av.retours_garantie.map((retour) => (
        <Link key={retour.uid} to={`/espace-entreprise/demandes/${retour.uid}`} className="flex items-center gap-2 text-sm text-blue-700 font-semibold">
          <ShieldCheck className="w-4 h-4" /> Retour sous garantie du {dateHeure(retour.created_at)} : voir le suivi
        </Link>
      ))}

      {!ouvert && (av.peut_reclamer || av.sous_garantie) && (
        <div className="flex flex-wrap gap-2">
          {av.peut_reclamer && (
            <button type="button" onClick={() => setOuvert('reclamation')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary-300 text-primary-700 text-sm font-semibold">
              <MessageSquareWarning className="w-4 h-4" /> Faire une réclamation
            </button>
          )}
          {av.sous_garantie && (
            <button type="button" onClick={() => setOuvert('garantie')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" /> Le même défaut réapparaît
            </button>
          )}
        </div>
      )}
      {!ouvert && (av.peut_reclamer || av.sous_garantie) && (
        <p className="text-xs text-muted">
          {av.peut_reclamer && `Réclamation possible jusqu’au ${dateHeure(av.reclamation_jusqu_au)}. `}
          {av.sous_garantie && `Main-d’œuvre garantie jusqu’au ${dateHeure(av.garantie_jusqu_au)} : si le même défaut réapparaît, Bricolibe revient gratuitement.`}
        </p>
      )}

      {ouvert && (
        <form onSubmit={envoyer} className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 grid gap-3">
          <p className="font-semibold text-ink">{ouvert === 'reclamation' ? 'Réclamation' : 'Retour sous garantie'}</p>
          {ouvert === 'reclamation' && (
            <select aria-label="Motif" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className={champ}>
              {MOTIFS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          )}
          <textarea
            required minLength={10} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={ouvert === 'reclamation' ? 'Décrivez le problème constaté…' : 'Décrivez le défaut qui réapparaît…'}
            className={`${champ} resize-none`}
          />
          <PhotosPicker photos={photos} onChange={setPhotos} max={5} label="Photos (facultatif)" />
          <p className="text-xs text-muted">
            {ouvert === 'reclamation'
              ? 'L’inspecteur examine votre réclamation sous 72 heures et se rend sur place si nécessaire.'
              : 'Une nouvelle intervention est créée : déplacement et main-d’œuvre offerts. La garantie ne couvre pas un mauvais usage ou une modification faite par un tiers.'}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOuvert(null)} className="px-4 py-2 rounded-lg border border-line text-sm font-semibold text-ink">Annuler</button>
            <button type="submit" disabled={reclamer.isLoading || garantie.isLoading} className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-60">
              Envoyer
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

/** Visite d'entretien préventif : l'entreprise peut en changer la date ou le site avant l'envoi d'un ouvrier. */
export function Replanifier({ demande, replanifier }) {
  const { data: sites = [] } = useSitesEntreprise()
  const versSaisie = (iso) => {
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  const [date, setDate] = useState(versSaisie(demande.date_souhaitee))
  const [site, setSite] = useState(demande.site?.uid || '')
  if (demande.nature !== 'PREVENTIF' || demande.statut !== 'NOUVELLE') return null
  const modifie = date !== versSaisie(demande.date_souhaitee) || (site && site !== demande.site?.uid)
  return (
    <section className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-4 grid gap-3 text-sm">
      <p className="font-semibold text-sky-900 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Visite d’entretien préventif incluse dans votre formule</p>
      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label>
          <span className="block text-xs font-semibold text-sky-800 mb-1">Date et heure</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={champ} />
        </label>
        {sites.length > 1 ? (
          <label>
            <span className="block text-xs font-semibold text-sky-800 mb-1">Site</span>
            <select value={site} onChange={(e) => setSite(e.target.value)} className={champ}>
              {sites.map((s) => <option key={s.uid} value={s.uid}>{s.nom}</option>)}
            </select>
          </label>
        ) : <span />}
        <button
          type="button" disabled={!modifie || replanifier.isLoading}
          onClick={() => replanifier.mutate({
            date_souhaitee: new Date(date).toISOString(), ...(site && site !== demande.site?.uid ? { site } : {}),
          })}
          className="px-4 py-3 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
        >Replanifier</button>
      </div>
    </section>
  )
}
