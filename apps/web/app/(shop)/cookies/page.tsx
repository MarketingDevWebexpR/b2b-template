import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Cookies | WebexpR Pro B2B',
  description: 'Politique de gestion des cookies et traceurs - WebexpR Pro B2B.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-ecom py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-hero-sm font-bold text-content-primary mb-4">
            Gestion des Cookies
          </h1>
          <p className="text-body text-content-secondary max-w-2xl">
            Cette page vous informe sur l&apos;utilisation des cookies et traceurs sur notre plateforme B2B et vous permet de gérer vos préférences.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none">
          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              1. Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-body text-content-secondary">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d&apos;un site web. Il permet au site de mémoriser des informations sur votre visite, comme vos préférences de langue ou de connexion, ce qui peut faciliter votre prochaine visite et rendre le site plus utile pour vous.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              2. Types de cookies utilisés
            </h2>

            <div className="space-y-4">
              {/* Cookies essentiels */}
              <div className="bg-surface-secondary rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-content-primary">Cookies essentiels</h3>
                    <p className="text-body-sm text-content-muted">Toujours actifs</p>
                  </div>
                  <span className="px-3 py-1 bg-success/10 text-success text-caption font-medium rounded-full">
                    Requis
                  </span>
                </div>
                <p className="text-body text-content-secondary mb-3">
                  Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils sont généralement établis en réponse à des actions de votre part (connexion, remplissage de formulaires, préférences de confidentialité).
                </p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1 ml-2">
                  <li>Session utilisateur et authentification</li>
                  <li>Panier d&apos;achat et liste de prix</li>
                  <li>Préférences de sécurité</li>
                  <li>Équilibrage de charge serveur</li>
                </ul>
              </div>

              {/* Cookies fonctionnels */}
              <div className="bg-surface-secondary rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-content-primary">Cookies fonctionnels</h3>
                    <p className="text-body-sm text-content-muted">Personnalisation</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-caption font-medium rounded-full">
                    Optionnel
                  </span>
                </div>
                <p className="text-body text-content-secondary mb-3">
                  Ces cookies permettent d&apos;améliorer les fonctionnalités et la personnalisation, comme la mémorisation de vos préférences d&apos;affichage ou votre entrepôt de livraison favori.
                </p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1 ml-2">
                  <li>Préférences de langue et région</li>
                  <li>Point de vente sélectionné</li>
                  <li>Historique de navigation récent</li>
                  <li>Paramètres d&apos;affichage (grille/liste)</li>
                </ul>
              </div>

              {/* Cookies analytiques */}
              <div className="bg-surface-secondary rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-content-primary">Cookies analytiques</h3>
                    <p className="text-body-sm text-content-muted">Mesure d&apos;audience</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-caption font-medium rounded-full">
                    Optionnel
                  </span>
                </div>
                <p className="text-body text-content-secondary mb-3">
                  Ces cookies nous permettent de mesurer l&apos;audience du site et d&apos;analyser la façon dont vous l&apos;utilisez, afin d&apos;améliorer nos services et votre expérience.
                </p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1 ml-2">
                  <li>Pages les plus visitées</li>
                  <li>Parcours de navigation</li>
                  <li>Temps passé sur le site</li>
                  <li>Messages d&apos;erreur rencontrés</li>
                </ul>
              </div>

              {/* Cookies marketing */}
              <div className="bg-surface-secondary rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-content-primary">Cookies marketing</h3>
                    <p className="text-body-sm text-content-muted">Publicité ciblée</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-caption font-medium rounded-full">
                    Optionnel
                  </span>
                </div>
                <p className="text-body text-content-secondary mb-3">
                  Ces cookies peuvent être utilisés pour vous proposer des contenus et publicités adaptés à vos centres d&apos;intérêt professionnels.
                </p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1 ml-2">
                  <li>Recommandations de produits</li>
                  <li>Retargeting publicitaire B2B</li>
                  <li>Partage sur réseaux sociaux professionnels</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              3. Durée de conservation
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary">
              <p className="mb-3">
                Conformément aux recommandations de la CNIL, les cookies sont conservés pour une durée maximale de 13 mois à compter de leur dépôt sur votre terminal.
              </p>
              <p>
                Au-delà de cette période, votre consentement sera à nouveau sollicité.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              4. Gérer vos préférences
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Vous pouvez à tout moment modifier vos préférences en matière de cookies :
            </p>

            {/* Preference buttons */}
            <div className="bg-surface-secondary rounded-lg p-6">
              <p className="text-body text-content-secondary mb-4">
                Cliquez sur le bouton ci-dessous pour ouvrir le panneau de gestion des cookies :
              </p>
              <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors">
                Gérer mes préférences cookies
              </button>
            </div>

            <p className="text-body text-content-secondary mt-4">
              Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies. Voici les liens vers les instructions des principaux navigateurs :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4 mt-4">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Apple Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              5. Contact
            </h2>
            <p className="text-body text-content-secondary">
              Pour toute question concernant notre politique de cookies, vous pouvez nous contacter à : <a href="mailto:dpo@webexprpro.fr" className="text-primary hover:underline">dpo@webexprpro.fr</a>
            </p>
          </section>
        </div>

        {/* Last update */}
        <div className="mt-12 pt-6 border-t border-stroke-light">
          <p className="text-caption text-content-muted">
            Dernière mise à jour : Décembre 2024
          </p>
        </div>
      </div>
    </main>
  );
}
