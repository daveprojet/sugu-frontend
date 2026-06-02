import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
    },
    {
      title: 'Un suivi simple',
      text: 'Les clients suivent leurs demandes depuis leur tableau de bord, du premier contact a la prestation terminee.',
    },
    {
      title: 'Une relation plus juste',
      text: 'Les avis clients et les reponses artisans aident chacun a expliquer son experience avec transparence.',
    },
  ]

  const steps = [
    'Le client cherche un artisan par metier ou quartier.',
    'Il consulte les profils, les notes et les commentaires.',
    'Il envoie une demande et suit son statut.',
    'Apres la prestation, il peut laisser un avis.',
  ]

  return (
    <main className="bg-sand-50">
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary-600 mb-2">A propos de Sugu.sn</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Rapprocher les clients des bons artisans, sans complication.
          </h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Sugu.sn aide les particuliers a trouver rapidement un artisan disponible et proche de chez eux.
            La plateforme facilite la demande, le suivi, les avis et la visibilite des prestataires locaux.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/artisans" className="btn-primary">Trouver un artisan</Link>
            <Link to="/inscription-artisan" className="btn-secondary">Devenir artisan</Link>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-sand-100">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-4">
          {values.map(item => (
            <article key={item.title} className="card p-5">
              <h2 className="font-display font-semibold text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-[1fr_360px] gap-8 items-start scroll-mt-20">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Comment ca marche</h2>
          <div className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-4 bg-white border border-sand-100 rounded-2xl p-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="card p-6">
          <h2 className="font-display font-semibold text-gray-900 mb-3">Notre objectif</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Donner plus de visibilite aux artisans serieux et aider les clients a faire leur choix avec
            des informations concretes : localisation, disponibilite, notes, avis et historique des demandes.
          </p>
          <Link to="/contact" className="btn-secondary inline-block mt-5">Nous contacter</Link>
        </aside>
      </section>
    </main>
  )
}
