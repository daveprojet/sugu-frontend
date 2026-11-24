import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, ChevronRight, IdCard, Images, MessageCircle, UserRound, Video } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { lienWhatsappProfil, WHATSAPP_BRICOLIBE } from '@/utils/whatsappBricolibe'

const PIECES = [
  { Icon: UserRound, titre: 'Photo de profil', detail: 'Votre visage ou votre logo' },
  { Icon: IdCard, titre: "Pièce d'identité", detail: 'Recto, verso et selfie avec la pièce' },
  { Icon: Images, titre: 'Réalisations', detail: '3 à 5 photos de vos travaux' },
  { Icon: Video, titre: 'Vidéos', detail: '1 ou 2 courtes, si vous en avez' },
]

function Choix({ as: Composant = Link, Icon, ton, titre, detail, ...props }) {
  return (
    <Composant
      {...props}
      className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-card hover:shadow-card-hover hover:border-primary-200 transition"
    >
      <span className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ton}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-display font-bold text-gray-900">{titre}</span>
        <span className="block mt-1 text-sm text-gray-600">{detail}</span>
      </span>
      <ChevronRight className="w-5 h-5 mt-1 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" aria-hidden="true" />
    </Composant>
  )
}

/** Écran affiché juste après l'inscription d'un artisan. */
export default function BienvenueArtisanPage() {
  const { user } = useAuth()

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-sand-50/60">
      <section className="bg-gradient-to-b from-sand-200 to-sand-100 px-4 pt-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-sand-700">Compte artisan créé</p>
          <h1 className="mt-2 font-display text-2xl md:text-3xl font-bold text-gray-900">
            {user?.prenom ? `${user.prenom}, montrez` : 'Montrez'} ce que vous savez faire
          </h1>
          <p className="mt-2 text-gray-700 max-w-lg">
            Un profil avec des photos de vos travaux inspire confiance : les clients vous choisissent plus facilement.
          </p>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 -mt-12 pb-12"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Choix
            to="/mon-profil/realisations"
            Icon={Camera}
            ton="bg-primary-50 text-primary-600"
            titre="Ajouter moi-même mes photos et vidéos"
            detail="Je choisis mes fichiers depuis mon téléphone et ils s'affichent sur mon profil."
          />
          <Choix
            as="a"
            href={lienWhatsappProfil(user)}
            target="_blank"
            rel="noopener noreferrer"
            Icon={MessageCircle}
            ton="bg-accent-50 text-accent-600"
            titre="Envoyer mes photos et vidéos à Bricolibe"
            detail={`Sur WhatsApp au ${WHATSAPP_BRICOLIBE} : l'équipe les met en ligne pour moi.`}
          />
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">Ce qu'il nous faut</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {PIECES.map(({ Icon, titre, detail }) => (
              <li key={titre} className="rounded-xl bg-white border border-sand-200 p-3">
                <Icon className="w-5 h-5 text-primary-500" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-gray-900">{titre}</p>
                <p className="text-xs text-gray-500">{detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sand-200 pt-5 text-sm">
          <Link to="/mon-profil/identite" className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700">
            <IdCard className="w-4 h-4" aria-hidden="true" />
            Déposer ma pièce d'identité moi-même
          </Link>
          <Link to="/dashboard-artisan" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
            Plus tard <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
