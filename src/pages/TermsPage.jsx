const definitions = [
  ['Bricolibe', 'La plateforme numérique éditée par Dave Procode, mettant en relation artisans et clients'],
  ['Artisan indépendant', 'Professionnel inscrit sur Bricolibe pour proposer ses services, non salarié de Bricolibe'],
  ['Client', 'Particulier sollicitant un service via l’application'],
  ['Portefeuille Bricolibe', 'Compte interne sur lequel transitent les paiements des clients avant reversement à l’artisan'],
  ['Commission', 'Part retenue par Bricolibe sur chaque prestation (10 %)'],
]

const articles = [
  {
    title: 'Article 1 – Objet et champ d’application',
    content: (
      <>
        <p>
          Les présentes conditions générales d’utilisation (« CGU ») régissent l’utilisation de la plateforme Bricolibe,
          éditée par Dave Procode (groupement d’intérêt économique, GIE, formalisé en 2025), par tout artisan indépendant
          inscrit pour proposer ses services de dépannage, entretien ou installation à des clients particuliers via
          l’application.
        </p>
        <p>
          L’inscription et l’utilisation de la plateforme emportent acceptation sans réserve des présentes CGU.
        </p>
      </>
    ),
  },
  {
    title: 'Article 2 – Définitions',
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left font-semibold px-4 py-2 border-b border-gray-200">Terme</th>
              <th className="text-left font-semibold px-4 py-2 border-b border-gray-200">Définition</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map(([terme, definition]) => (
              <tr key={terme} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 font-medium text-gray-800 align-top whitespace-nowrap">{terme}</td>
                <td className="px-4 py-2 text-gray-600">{definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: 'Article 3 – Acceptation des CGU',
    content: (
      <p>
        L’artisan reconnaît avoir pris connaissance des présentes CGU et de la Charte de l’artisan indépendant avant
        toute inscription. L’acceptation s’effectue en cochant la case dédiée lors de la création du compte. Toute
        utilisation de la plateforme sans acceptation préalable est réputée non autorisée.
      </p>
    ),
  },
  {
    title: 'Article 4 – Inscription et compte artisan',
    content: (
      <>
        <p>
          L’inscription requiert la fourniture d’informations exactes et à jour : identité, numéro de téléphone,
          compétences/métier exercé, zone d’intervention. Bricolibe se réserve le droit de demander des justificatifs
          complémentaires et de refuser ou suspendre un compte dont les informations seraient inexactes ou incomplètes.
        </p>
        <p>
          L’artisan est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son
          compte.
        </p>
      </>
    ),
  },
  {
    title: 'Article 5 – Obligations de l’artisan',
    content: (
      <>
        <p>L’artisan s’engage à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Exercer son activité avec les compétences, le matériel et les autorisations nécessaires.</li>
          <li>Honorer les interventions acceptées dans les délais convenus avec le client.</li>
          <li>Respecter les règles de conduite et de courtoisie décrites dans la Charte de l’artisan indépendant.</li>
          <li>Ne pas solliciter de paiement en dehors de la plateforme pour une prestation obtenue via Bricolibe.</li>
          <li>Déclarer tout incident ou litige survenu pendant une prestation.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Article 6 – Obligations de Bricolibe',
    content: (
      <>
        <p>Bricolibe s’engage à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mettre à disposition une plateforme fonctionnelle de mise en relation avec les clients.</li>
          <li>Reverser à l’artisan les sommes lui revenant selon les modalités de l’article 7.</li>
          <li>Traiter les réclamations et litiges de manière diligente.</li>
          <li>Informer l’artisan de toute modification substantielle des présentes CGU.</li>
        </ul>
        <p>
          Bricolibe agit en tant qu’intermédiaire de mise en relation et n’est pas partie au contrat de prestation conclu
          entre l’artisan et le client.
        </p>
      </>
    ),
  },
  {
    title: 'Article 7 – Modalités financières',
    content: (
      <>
        <p>
          Le paiement du client transite par le <strong className="text-gray-800">portefeuille Bricolibe</strong> et ne va
          pas directement au compte de l’artisan. Bricolibe prélève une{' '}
          <strong className="text-gray-800">commission de 10 %</strong> sur chaque prestation facturée.
        </p>
        <p>
          Le solde accumulé sur le portefeuille de l’artisan est{' '}
          <strong className="text-gray-800">reversé chaque semaine, le mardi</strong>, vers le moyen de paiement
          enregistré par l’artisan. Les frais de déplacement sont dus même en l’absence d’accord sur un devis, dès lors
          que le déplacement a été effectué.
        </p>
        <p>
          Aucun paiement parallèle en espèces ou hors plateforme n’est autorisé pour une prestation obtenue via
          Bricolibe.
        </p>
      </>
    ),
  },
  {
    title: 'Article 8 – Responsabilité et garanties',
    content: (
      <>
        <p>
          L’artisan est seul responsable de la qualité et de la conformité des prestations qu’il réalise. Bricolibe ne
          garantit pas un volume minimal de demandes et n’est pas responsable des dommages causés par l’artisan lors
          d’une intervention.
        </p>
        <p>
          Toute prestation est couverte par une garantie de 30 jours sur les travaux réalisés, selon les modalités
          précisées dans la Charte de l’artisan indépendant. La responsabilité de Bricolibe se limite à son rôle
          d’intermédiaire technique de mise en relation et de gestion des paiements.
        </p>
      </>
    ),
  },
  {
    title: 'Article 9 – Données personnelles',
    content: (
      <>
        <p>
          Bricolibe collecte et traite les données nécessaires à l’inscription, à la mise en relation et au paiement
          (identité, contact, localisation, historique de prestations). Ces données ne sont partagées qu’avec le client
          concerné par une prestation et les prestataires techniques nécessaires au fonctionnement du service
          (paiement, notifications).
        </p>
        <p>
          L’artisan dispose d’un droit d’accès, de rectification et de suppression de ses données, exerçable auprès de
          Bricolibe.
        </p>
      </>
    ),
  },
  {
    title: 'Article 10 – Propriété intellectuelle',
    content: (
      <p>
        La marque « Bricolibe », le logo, l’application et ses contenus sont la propriété exclusive de Dave Procode.
        L’artisan bénéficie d’un droit d’usage non exclusif et non cessible de la plateforme, limité à la durée de son
        inscription. Toute reproduction, extraction ou usage non autorisé de la marque ou du contenu de l’application est
        interdit.
      </p>
    ),
  },
  {
    title: 'Article 11 – Durée, suspension, résiliation',
    content: (
      <>
        <p>
          Les présentes CGU s’appliquent pour toute la durée de l’inscription de l’artisan. Bricolibe peut suspendre ou
          résilier un compte en cas de manquement grave (fraude, non-respect répété des règles de conduite, mise en
          danger d’un client), après notification à l’artisan sauf urgence.
        </p>
        <p>
          L’artisan peut résilier son inscription à tout moment, moyennant un préavis de{' '}
          <strong className="text-gray-800">7 jours</strong> et après régularisation des prestations en cours.
        </p>
      </>
    ),
  },
  {
    title: 'Article 12 – Modification des CGU',
    content: (
      <p>
        Bricolibe peut modifier les présentes CGU à tout moment, notamment pour s’adapter à l’évolution de ses services
        ou de la réglementation. Toute modification substantielle est notifiée à l’artisan par email ou notification
        in-app, avec un délai raisonnable avant son entrée en vigueur. La poursuite de l’utilisation de la plateforme
        après notification vaut acceptation des nouvelles CGU.
      </p>
    ),
  },
  {
    title: 'Article 13 – Loi applicable et règlement des litiges',
    content: (
      <p>
        Les présentes CGU sont régies par le droit sénégalais et les actes uniformes OHADA applicables. En cas de litige
        relatif à leur interprétation ou à leur exécution, les parties s’efforcent de trouver une solution amiable. À
        défaut, le litige est porté devant les juridictions compétentes du ressort du siège de Dave Procode à Dakar.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Légal</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">CGU – Artisan indépendant Bricolibe</h1>
        <p className="text-sm text-gray-500 mt-2">Dernière mise à jour : 24 novembre 2026</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-4">
          Conditions générales d’utilisation applicables aux artisans indépendants inscrits sur Bricolibe pour la mise en
          relation avec des clients particuliers (dépannage, entretien, installation). Ce document complète la Charte de
          l’artisan indépendant, qui en détaille l’esprit et les bonnes pratiques.
        </p>
      </div>

      <div className="card p-6 md:p-8">
        <div className="flex flex-col gap-8">
          {articles.map(article => (
            <section key={article.title}>
              <h2 className="font-display font-semibold text-gray-900 mb-3">{article.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">{article.content}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
