import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  ClipboardList, 
  Handshake, 
  ArrowRight,
  Target
} from 'lucide-react'

export default function AboutPage() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const element = document.querySelector(location.hash)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const values = [
    {
      title: 'Des profils plus fiables',
      text: 'Chaque artisan dispose d une fiche claire avec son metier, sa zone, ses avis et sa disponibilite.',
      icon: ShieldCheck,
    },
    {
      title: 'Un suivi simple',
      text: 'Les clients suivent leurs demandes depuis leur tableau de bord, du premier contact a la prestation terminee.',
      icon: ClipboardList,
    },
    {
      title: 'Une relation plus juste',
      text: 'Les avis clients et les reponses artisans aident chacun a expliquer son experience avec transparence.',
      icon: Handshake,
    },
  ]

  const steps = [
    'Le client cherche un artisan par metier ou quartier.',
    'Il consulte les profils, les notes et les commentaires.',
    'Il envoie une demande et suit son statut.',
    'Apres la prestation, il peut laisser un avis.',
  ]

  // Animations Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* JOLI HERO SECTION - Premium Gradient & Blobs */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white overflow-hidden py-20 md:py-28">
        {/* Motif de fond (points) */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Blobs animés */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold text-purple-200 mb-3 uppercase tracking-wider">
              À propos de Sugu.sn
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg mb-6">
              Rapprocher les clients des bons artisans,<br />
              <span className="text-purple-200">sans complication.</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl mb-8">
              Sugu.sn aide les particuliers a trouver rapidement un artisan disponible et proche de chez eux.
              La plateforme facilite la demande, le suivi, les avis et la visibilite des prestataires locaux.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/artisans" 
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Trouver un artisan
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/inscription-artisan" 
                className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Devenir artisan
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALEURS - Section Premium */}
      <section className="bg-gradient-to-br from-indigo-50/30 to-purple-50/30 border-y border-gray-100/80 py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article 
                  key={item.title} 
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display font-semibold text-xl text-gray-900 mb-2">{item.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE - Section Premium */}
      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-[1fr_360px] gap-8 items-start scroll-mt-20">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-gray-900 mb-6"
          >
            Comment ça marche
          </motion.h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {steps.map((step, index) => (
              <motion.div 
                key={step} 
                variants={itemVariants}
                className="flex gap-4 bg-white/80 backdrop-blur-sm border border-gray-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
              >
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold flex items-center justify-center flex-shrink-0 text-sm shadow-md shadow-indigo-500/30">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed pt-2">{step}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.aside 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/60 p-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-display font-semibold text-xl text-gray-900 mb-3">Notre objectif</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Donner plus de visibilite aux artisans serieux et aider les clients a faire leur choix avec
            des informations concretes : localisation, disponibilite, notes, avis et historique des demandes.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 mt-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-5 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-200"
          >
            Nous contacter
          </Link>
        </motion.aside>
      </section>
    </main>
  )
}