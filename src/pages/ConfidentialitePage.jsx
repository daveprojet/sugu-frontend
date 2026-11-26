import { Link } from 'react-router-dom'

const donnees = [
  ['Compte (tous les utilisateurs)', 'Nom, prénom, numéro de téléphone, adresse e-mail, mot de passe (stocké chiffré)'],
  ['Localisation', 'Adresse ou position de l’intervention, zone d’intervention de l’artisan'],
  ['Demandes et prestations', 'Description du besoin, photos jointes, devis, statuts, historique des prestations'],
  ['Avis', 'Notes et commentaires laissés par les clients, réponses des artisans'],
  ['Paiements', 'Montants, références de transaction, moyen de paiement utilisé, solde du portefeuille artisan'],
  ['Vérification de l’artisan', 'Pièce d’identité (recto, verso), selfie de vérification, métier, justificatifs professionnels, photos de réalisations'],
  ['Données techniques', 'Identifiant de l’appareil pour les notifications, journaux de connexion utilisés pour la sécurité du compte'],
]

const prestataires = [
  ['Paiement mobile', 'Traitement des paiements des clients et des reversements aux artisans'],
  ['Hébergement et stockage', 'Hébergement de la plateforme et stockage sécurisé des fichiers (documents, photos)'],
  ['Notifications', 'Envoi des notifications sur l’application et des SMS'],
  ['Cartographie', 'Affichage des cartes et calcul des distances'],
]

const articles = [
  {
    title: '1. Responsable du traitement',
    content: (
      <p>
        La plateforme Bricolibe est éditée par Dave Procode (groupement d’intérêt économique, GIE, formalisé en 2025),
        dont le siège est à Dakar. Dave Procode est responsable du traitement des données personnelles collectées via
        le site et l’application Bricolibe, conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la
        protection des données à caractère personnel.
      </p>
    ),
  },
  {
    title: '2. Données collectées',
    content: (
      <>
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left font-semibold px-4 py-2 border-b border-gray-200">Catégorie</th>
                <th className="text-left font-semibold px-4 py-2 border-b border-gray-200">Données</th>
              </tr>
            </thead>
            <tbody>
              {donnees.map(([categorie, detail]) => (
                <tr key={categorie} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-gray-800 align-top">{categorie}</td>
                  <td className="px-4 py-2 text-gray-600">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    title: '3. Pourquoi nous utilisons vos données',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Créer et gérer votre compte, et sécuriser votre connexion.</li>
        <li>Mettre en relation les clients avec les artisans disponibles dans leur zone.</li>
        <li>Vérifier l’identité et les compétences des artisans avant leur activation sur la plateforme.</li>
        <li>Traiter les paiements via le portefeuille Bricolibe et reverser chaque semaine leur solde aux artisans.</li>
        <li>Vous informer du suivi de vos demandes et prestations (notifications, SMS).</li>
        <li>Traiter les réclamations, litiges et signalements, et prévenir la fraude.</li>
        <li>Respecter nos obligations légales, notamment comptables.</li>
      </ul>
    ),
  },
  {
    title: '4. Avec qui vos données sont partagées',
    content: (
      <>
        <p>
          Vos données ne sont partagées qu’avec la personne concernée par une prestation : le client voit les
          informations utiles de l’artisan (nom, métier, note, avis) et l’artisan reçoit les informations nécessaires
          pour intervenir (nom, téléphone, adresse de l’intervention, description du besoin).
        </p>
        <p>
          Les documents d’identité des artisans ne sont jamais montrés aux clients. Ils sont consultés uniquement par
          l’équipe Bricolibe chargée de la vérification.
        </p>
        <p>Nous faisons aussi appel à des prestataires techniques, qui n’utilisent vos données que pour le service rendu :</p>
        <ul className="list-disc pl-5 space-y-1">
          {prestataires.map(([type, role]) => (
            <li key={type}>
              <span className="font-medium text-gray-800">{type}</span> : {role}.
            </li>
          ))}
        </ul>
        <p>
          Nous ne vendons pas vos données. Elles peuvent être communiquées aux autorités lorsque la loi l’exige.
        </p>
      </>
    ),
  },
  {
    title: '5. Durée de conservation',
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Données du compte : pendant toute la durée de l’inscription, puis supprimées après la clôture du compte.</li>
        <li>
          Documents d’identité des artisans : pendant la durée de l’inscription, puis supprimés à la clôture du compte
          ou en cas de refus du dossier.
        </li>
        <li>
          Données de paiement et de facturation : pendant la durée imposée par les obligations comptables applicables.
        </li>
        <li>Avis publiés : tant qu’ils restent en ligne ; ils peuvent être anonymisés à la clôture du compte.</li>
      </ul>
    ),
  },
  {
    title: '6. Sécurité',
    content: (
      <p>
        Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données : connexions
        chiffrées, mots de passe chiffrés, accès aux documents sensibles limité aux personnes habilitées et
        protection contre les tentatives de connexion abusives. Aucune transmission sur internet n’étant totalement
        sûre, nous vous invitons à garder vos identifiants confidentiels.
      </p>
    ),
  },
  {
    title: '7. Vos droits',
    content: (
      <>
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données. Vous
          pouvez exercer ces droits depuis votre profil ou en nous écrivant via la{' '}
          <Link to="/contact" className="text-primary-600 font-medium hover:underline">page Contact</Link>.
        </p>
        <p>
          La suppression de votre compte peut être différée le temps de régulariser les prestations ou paiements en
          cours. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission de protection
          des Données Personnelles (CDP) du Sénégal.
        </p>
      </>
    ),
  },
  {
    title: '8. Modification de cette politique',
    content: (
      <p>
        Nous pouvons modifier cette politique pour l’adapter à l’évolution de nos services ou de la réglementation.
        Toute modification importante vous sera notifiée par e-mail ou notification dans l’application.
      </p>
    ),
  },
]

export default function ConfidentialitePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary-600 mb-2">Légal</p>
        <h1 className="font-display text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mt-2">Dernière mise à jour : 26 novembre 2026</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-4">
          Cette politique explique quelles données personnelles Bricolibe collecte, pourquoi, avec qui elles sont
          partagées et comment exercer vos droits. Elle s’applique à tous les utilisateurs de la plateforme, clients
          comme artisans.
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
