export default function TermsPage() {
  const sections = [
    {
      title: 'Objet',
      text: 'Sugu.sn met en relation des clients avec des artisans. La plateforme facilite la recherche, les demandes, le suivi des statuts, les avis et les reponses publiques des artisans.',
    },
    {
      title: 'Compte utilisateur',
      text: 'Chaque utilisateur doit fournir des informations exactes lors de son inscription. Le titulaire du compte reste responsable de la confidentialite de ses identifiants et des actions effectuees depuis son compte.',
    },
    {
      title: 'Demandes et prestations',
      text: 'Les demandes envoyees via Sugu.sn servent a initier une relation entre client et artisan. Les conditions pratiques de la prestation, notamment prix, delais et modalites d intervention, sont convenues directement entre les parties.',
    },
    {
      title: 'Avis et commentaires',
      text: 'Les clients peuvent laisser un avis apres une prestation terminee. Les artisans peuvent y repondre. Les contenus injurieux, trompeurs, discriminatoires ou sans lien avec la prestation peuvent etre moderes.',
    },
    {
      title: 'Responsabilité',
      text: "Sugu.sn fournit un service de mise en relation. La plateforme ne se substitue pas aux artisans dans l'exécution des prestations et ne garantit pas le resultat des travaux effectues.",
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Conditions generales d utilisation</h1>
        <p className="text-sm text-gray-500 mt-2">Derniere mise a jour : 2 juin 2026</p>
      </div>

      <div className="card p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {sections.map(section => (
            <section key={section.title}>
              <h2 className="font-display font-semibold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
