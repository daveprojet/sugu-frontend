import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react'
import BackLink from '@/components/common/BackLink'
import { useAuth } from '@/context/AuthContext'
import {
  useAjouterDocumentPro,
  useDossierPro,
  useSaveDossierPro,
  useSupprimerDocumentPro,
} from '@/hooks/useArtisans'
import { PROFILS_DOSSIER, STATUTS_IDENTITE, TYPES_DOCUMENT_PRO } from '@/utils/constants'
import { MAX_FILE_SIZE, resolveImageUrl } from '@/utils/helpers'
import Spinner from '@/components/common/Spinner'

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-line bg-canvas-soft focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150 text-sm text-ink outline-none'

const FORMATS_DOCUMENT = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FICHIERS = 3
const DOCUMENT_VIDE = { type_document: 'CERTIFICAT', libelle: '', fichiers: [] }

function VignetteFichier({ src, estPdf, nom, href }) {
  const contenu = estPdf ? (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-red-50 text-red-600">
      <FileText className="w-7 h-7" />
      <span className="text-[10px] font-semibold px-1 truncate max-w-full">{nom || 'PDF'}</span>
    </div>
  ) : (
    <img src={src} alt={nom || 'Justificatif'} className="w-full h-full object-cover" />
  )
  const classe = 'block w-24 h-24 rounded-lg overflow-hidden border border-line bg-canvas-soft'
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${classe} hover:border-indigo-300 transition-colors duration-150`}>
      {contenu}
    </a>
  ) : (
    <div className={classe}>{contenu}</div>
  )
}

export default function DossierProPage() {
  const { user } = useAuth()
  const uid = user?.artisan_uid
  const { data: dossier, isLoading } = useDossierPro(uid)
  const saveDossier = useSaveDossierPro()
  const ajouterDocument = useAjouterDocumentPro()
  const supprimerDocument = useSupprimerDocumentPro()

  const [infos, setInfos] = useState({ profil: 'PROFESSIONNEL', nb_travaux_realises: '', annees_experience: '', description: '' })
  const [document, setDocument] = useState(DOCUMENT_VIDE)

  useEffect(() => {
    if (dossier) {
      setInfos({
        profil: dossier.profil || 'PROFESSIONNEL',
        nb_travaux_realises: dossier.nb_travaux_realises ?? '',
        annees_experience: dossier.annees_experience ?? '',
        description: dossier.description || '',
      })
    }
  }, [dossier])

  const statut = dossier?.statut
  const statutConfig = STATUTS_IDENTITE[statut]
  const documents = dossier?.documents || []

  // Libère les aperçus locaux quand ils ne sont plus affichés.
  const libererApercus = (fichiers) => fichiers.forEach((f) => f.apercu && URL.revokeObjectURL(f.apercu))

  const enregistrerInfos = async (e) => {
    e.preventDefault()
    try {
      await saveDossier.mutateAsync({
        uid,
        data: {
          profil: infos.profil,
          nb_travaux_realises: Number(infos.nb_travaux_realises) || 0,
          annees_experience: infos.annees_experience === '' ? null : Number(infos.annees_experience),
          description: infos.description,
        },
      })
    } catch {
      // géré par la mutation
    }
  }

  const choisirFichiers = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    const places = MAX_FICHIERS - document.fichiers.length
    if (files.length > places) toast.error(`${MAX_FICHIERS} fichiers maximum par justificatif.`)
    const valides = []
    for (const file of files.slice(0, places)) {
      if (!FORMATS_DOCUMENT.includes(file.type)) {
        toast.error(`${file.name} : seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés.`)
      } else if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} : le fichier ne doit pas dépasser 5 Mo.`)
      } else {
        valides.push({ file, apercu: file.type === 'application/pdf' ? null : URL.createObjectURL(file) })
      }
    }
    setDocument((d) => ({ ...d, fichiers: [...d.fichiers, ...valides] }))
  }

  const retirerFichier = (index) => {
    libererApercus([document.fichiers[index]])
    setDocument((d) => ({ ...d, fichiers: d.fichiers.filter((_, i) => i !== index) }))
  }

  const envoyerDocument = async (e) => {
    e.preventDefault()
    if (!document.fichiers.length) {
      toast.error('Sélectionnez au moins un fichier.')
      return
    }
    const formData = new FormData()
    formData.append('type_document', document.type_document)
    formData.append('libelle', document.libelle)
    document.fichiers.forEach(({ file }) => formData.append('fichiers', file))
    try {
      await ajouterDocument.mutateAsync({ uid, formData })
      libererApercus(document.fichiers)
      setDocument(DOCUMENT_VIDE)
    } catch {
      // géré par la mutation
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <BackLink
            fallback="/mon-profil"
            className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-muted hover:text-indigo-700 hover:border-indigo-300 transition-colors duration-150"
          >
            <ArrowLeft className="w-5 h-5" />
          </BackLink>
          <div>
            <p className="text-sm font-semibold text-indigo-700 mb-0.5 uppercase tracking-wider">Espace Artisan</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">Mon dossier professionnel</h1>
          </div>
        </motion.div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 flex gap-4">
          <Award className="w-6 h-6 text-indigo-600 flex-shrink-0" />
          <p className="text-sm text-indigo-900">
            Une fois votre dossier validé par notre équipe, activez le badge <b>« Vérifié »</b> (25 000 FCFA par an,
            renouvelable) pour l'afficher sur votre profil. Toute modification renvoie le dossier en vérification,
            sans perdre la période déjà payée.
          </p>
        </div>

        {statutConfig && (
          <div
            className={`rounded-xl border p-5 flex items-center gap-4 ${
              statut === 'VERIFIEE'
                ? 'bg-emerald-50 border-emerald-200'
                : statut === 'REJETEE'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            {statut === 'VERIFIEE' ? (
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            ) : statut === 'REJETEE' ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statutConfig.color}`}>
                {statutConfig.label}
              </span>
              {statut === 'REJETEE' && dossier?.motif_rejet && (
                <p className="mt-2 text-sm text-red-700 font-medium">Motif : {dossier.motif_rejet}</p>
              )}
              {statut === 'EN_ATTENTE' && (
                <p className="mt-1 text-sm text-amber-700">Votre dossier est en cours de vérification par nos équipes.</p>
              )}
              {statut === 'VERIFIEE' && (
                <p className="mt-1 text-sm text-emerald-700">
                  {dossier.badge_actif
                    ? `Badge « Vérifié » actif jusqu'au ${new Date(dossier.badge_expire_le).toLocaleDateString('fr-FR')}. `
                    : 'Dossier validé : il ne reste plus qu\'à activer votre badge. '}
                  <Link to="/dashboard-artisan/abonnements" className="underline font-semibold">
                    {dossier.badge_actif ? 'Gérer mon abonnement' : 'Activer mon badge'}
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={enregistrerInfos} className="bg-white rounded-xl border border-line p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-ink">Votre expérience</h2>
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Votre profil</label>
            <select
              value={infos.profil}
              onChange={(e) => setInfos({ ...infos, profil: e.target.value })}
              className={inputClass}
            >
              {PROFILS_DOSSIER.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {infos.profil === 'PROFESSIONNEL' ? (
              <p className="text-xs text-muted mt-2">
                Justificatifs obligatoires : une attestation, un certificat et un CV.
              </p>
            ) : (
              <div className="mt-2 rounded-lg border border-line-soft bg-canvas-soft p-3 text-xs text-muted space-y-1">
                <p>Conditions : au moins 20 clients traités et une note moyenne d'au moins 3,5/5. Notre équipe contacte ensuite certains clients pour confirmer.</p>
                {dossier?.eligibilite && (
                  <p className="font-semibold text-ink">
                    Votre situation : {dossier.eligibilite.clients_traites} client(s) traité(s), note moyenne de {dossier.eligibilite.note_moyenne}/5.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Nombre de travaux réalisés</label>
              <input
                type="number"
                min="0"
                required
                value={infos.nb_travaux_realises}
                onChange={(e) => setInfos({ ...infos, nb_travaux_realises: e.target.value })}
                className={inputClass}
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Années d'expérience</label>
              <input
                type="number"
                min="0"
                max="60"
                value={infos.annees_experience}
                onChange={(e) => setInfos({ ...infos, annees_experience: e.target.value })}
                className={inputClass}
                placeholder="8"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Autres informations (optionnel)</label>
            <textarea
              rows="3"
              value={infos.description}
              onChange={(e) => setInfos({ ...infos, description: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Formations, chantiers marquants, entreprises pour lesquelles vous avez travaillé…"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveDossier.isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-60"
            >
              {saveDossier.isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-line p-6 md:p-8 space-y-5">
          <h2 className="text-lg font-bold text-ink">Mes justificatifs</h2>
          {documents.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.uid} className="rounded-lg border border-line-soft bg-canvas-soft p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {TYPES_DOCUMENT_PRO.find((t) => t.value === doc.type_document)?.label || doc.type_document}
                      </p>
                      {doc.libelle && <p className="text-xs text-muted truncate">{doc.libelle}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => supprimerDocument.mutate({ uid, docUid: doc.uid })}
                      disabled={supprimerDocument.isLoading}
                      aria-label="Supprimer ce justificatif"
                      className="p-2 rounded-full text-muted hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.fichiers.map((f) => (
                      <VignetteFichier
                        key={f.uid}
                        src={resolveImageUrl(f.fichier)}
                        href={resolveImageUrl(f.fichier)}
                        estPdf={f.est_pdf}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun justificatif pour l'instant.</p>
          )}

          <form onSubmit={envoyerDocument} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line-soft">
            <h3 className="sm:col-span-2 text-sm font-semibold text-ink">Ajouter un justificatif</h3>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Type de justificatif</label>
              <select
                value={document.type_document}
                onChange={(e) => setDocument({ ...document, type_document: e.target.value })}
                className={inputClass}
              >
                {TYPES_DOCUMENT_PRO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Intitulé (optionnel)</label>
              <input
                value={document.libelle}
                maxLength={150}
                onChange={(e) => setDocument({ ...document, libelle: e.target.value })}
                className={inputClass}
                placeholder="CAP plomberie, chantier hôtel…"
              />
            </div>
            <div className="sm:col-span-2 space-y-3">
              {document.fichiers.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {document.fichiers.map((f, index) => (
                    <div key={`${f.file.name}-${index}`} className="relative">
                      <VignetteFichier src={f.apercu} estPdf={!f.apercu} nom={f.file.name} />
                      <button
                        type="button"
                        onClick={() => retirerFichier(index)}
                        aria-label={`Retirer ${f.file.name}`}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {document.fichiers.length < MAX_FICHIERS && (
                <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-line bg-canvas-soft hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all group">
                  <Upload className="w-7 h-7 text-muted group-hover:text-indigo-700 mb-2" />
                  <span className="text-sm font-medium text-muted group-hover:text-indigo-700">
                    {document.fichiers.length
                      ? `Ajouter un autre fichier (${document.fichiers.length}/${MAX_FICHIERS})`
                      : "Cliquez pour sélectionner jusqu'à 3 fichiers"}
                  </span>
                  <span className="text-xs text-muted mt-1">PDF, JPG, PNG — max 5 Mo chacun · 10 justificatifs max</span>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={choisirFichiers}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={ajouterDocument.isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 transition-colors duration-150 disabled:opacity-60"
              >
                <Upload className="w-4 h-4" /> {ajouterDocument.isLoading ? 'Envoi…' : 'Ajouter le justificatif'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
