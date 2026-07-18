export default function ConfidentialitePage() {
  const sections = [
    {
      title: 'Collecte des informations',
      text: "Nous collectons les informations necessaires pour creer et gerer votre compte, traiter vos demandes et ameliorer l experience sur Bricolibe. Cela peut inclure votre nom, adresse e-mail, numero de telephone, localisation et les details de vos demandes de service.",
    },
    {
      title: 'Utilisation des donnees',
      text: "Les donnees que vous fournissez sont utilisees pour vous connecter, repondre a vos demandes, vous envoyer des notifications et assurer le bon fonctionnement de la plateforme. Nous utilisons egalement des informations anonymisees pour mieux comprendre l utilisation de notre service.",
    },
    {
      title: 'Partage des donnees',
      text: "Nous partageons vos informations avec les artisans seulement lorsque cela est necessaire pour la mise en relation. Nous ne vendons pas vos donnees a des tiers. Nous pouvons partager des donnees avec les autorites si la loi l exige.",
    },
    {
      title: 'Securite',
      text: "Nous mettons en place des mesures de securite techniques et organisationnelles pour proteger vos informations personnelles contre l acces non autorise, la modification ou la divulgation. Toutefois, aucune transmission de donnees sur internet n est totalement sure.",
    },
    {
      title: 'Vos droits',
      text: "Vous pouvez acceder a vos informations, les corriger ou demander leur suppression en nous contactant via la page Contact. Vous pouvez egalement vous opposer au traitement de vos donnees dans les limites prevues par la legislation en vigueur.",
    },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Legal</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mt-2">Dernière mise à jour : 9 juin 2026</p>
      </div>

      <div className="card p-6 md:p-8">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
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
