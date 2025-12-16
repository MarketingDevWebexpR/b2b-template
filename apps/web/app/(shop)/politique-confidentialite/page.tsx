import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | WebexpR Pro B2B',
  description: 'Politique de confidentialité et protection des données personnelles - WebexpR Pro B2B.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-ecom py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-hero-sm font-bold text-content-primary mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-body text-content-secondary max-w-2xl">
            Cette politique décrit comment WebexpR Pro collecte, utilise et protège vos données personnelles conformément au RGPD.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none">
          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              1. Responsable du traitement
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary space-y-2">
              <p><strong className="text-content-primary">Responsable :</strong> WebexpR Pro SAS</p>
              <p><strong className="text-content-primary">Adresse :</strong> 12 Place Vendôme, 75001 Paris, France</p>
              <p><strong className="text-content-primary">DPO :</strong> dpo@webexprpro.fr</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              2. Données collectées
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Dans le cadre de notre activité B2B, nous collectons les données suivantes :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="font-medium text-content-primary mb-2">Données d&apos;identification</p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1">
                  <li>Nom et prénom</li>
                  <li>Fonction dans l&apos;entreprise</li>
                  <li>Coordonnées professionnelles</li>
                  <li>Identifiants de connexion</li>
                </ul>
              </div>
              <div className="bg-surface-secondary rounded-lg p-4">
                <p className="font-medium text-content-primary mb-2">Données d&apos;entreprise</p>
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-1">
                  <li>Raison sociale et SIRET</li>
                  <li>Numéro de TVA</li>
                  <li>Adresses de facturation/livraison</li>
                  <li>Historique des commandes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              3. Finalités du traitement
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Vos données sont collectées pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4">
              <li>Gestion de votre compte professionnel et authentification</li>
              <li>Traitement et suivi de vos commandes</li>
              <li>Facturation et gestion comptable</li>
              <li>Communication relative à nos services et offres B2B</li>
              <li>Amélioration de nos services et personnalisation de l&apos;expérience</li>
              <li>Respect de nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              4. Base légale du traitement
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Le traitement de vos données repose sur :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4">
              <li><strong>L&apos;exécution du contrat :</strong> pour la gestion de votre compte et le traitement des commandes</li>
              <li><strong>L&apos;intérêt légitime :</strong> pour l&apos;amélioration de nos services et la communication B2B</li>
              <li><strong>L&apos;obligation légale :</strong> pour la conservation des données de facturation</li>
              <li><strong>Le consentement :</strong> pour l&apos;envoi de communications marketing</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              5. Destinataires des données
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Vos données peuvent être transmises à :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4">
              <li>Nos équipes internes (commercial, logistique, comptabilité)</li>
              <li>Nos prestataires de services (hébergement, paiement, livraison)</li>
              <li>Les autorités compétentes en cas d&apos;obligation légale</li>
            </ul>
            <p className="text-body text-content-secondary mt-4">
              Nous ne vendons jamais vos données à des tiers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              6. Durée de conservation
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary space-y-2">
              <p><strong className="text-content-primary">Données de compte :</strong> durée de la relation commerciale + 3 ans</p>
              <p><strong className="text-content-primary">Données de facturation :</strong> 10 ans (obligation légale)</p>
              <p><strong className="text-content-primary">Données de navigation :</strong> 13 mois maximum</p>
              <p><strong className="text-content-primary">Cookies :</strong> 13 mois maximum</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              7. Vos droits
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-surface-secondary rounded-lg p-4">
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-2">
                  <li>Droit d&apos;accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l&apos;effacement</li>
                  <li>Droit à la limitation du traitement</li>
                </ul>
              </div>
              <div className="bg-surface-secondary rounded-lg p-4">
                <ul className="list-disc list-inside text-body-sm text-content-secondary space-y-2">
                  <li>Droit à la portabilité</li>
                  <li>Droit d&apos;opposition</li>
                  <li>Droit de retirer votre consentement</li>
                  <li>Droit d&apos;introduire une réclamation (CNIL)</li>
                </ul>
              </div>
            </div>
            <p className="text-body text-content-secondary mt-4">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@webexprpro.fr" className="text-primary hover:underline">dpo@webexprpro.fr</a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              8. Sécurité des données
            </h2>
            <p className="text-body text-content-secondary">
              Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement SSL/TLS, contrôle d&apos;accès, sauvegardes régulières, formation du personnel, audits de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              9. Contact
            </h2>
            <p className="text-body text-content-secondary">
              Pour toute question relative à cette politique ou à vos données personnelles, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l&apos;adresse : <a href="mailto:dpo@webexprpro.fr" className="text-primary hover:underline">dpo@webexprpro.fr</a>
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
