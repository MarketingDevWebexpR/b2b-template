import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | WebexpR Pro B2B',
  description: 'Conditions générales de vente pour les professionnels - WebexpR Pro B2B.',
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-ecom py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-hero-sm font-bold text-content-primary mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-body text-content-secondary max-w-2xl">
            Conditions applicables aux ventes entre professionnels sur la plateforme WebexpR Pro B2B.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none">
          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 1 - Objet et champ d&apos;application
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre WebexpR Pro SAS (ci-après &quot;le Vendeur&quot;) et tout professionnel passant commande sur le site (ci-après &quot;l&apos;Acheteur&quot;).
            </p>
            <p className="text-body text-content-secondary">
              Toute commande implique l&apos;acceptation sans réserve des présentes CGV, qui prévalent sur tout autre document, notamment les conditions d&apos;achat de l&apos;Acheteur.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 2 - Accès à la plateforme B2B
            </h2>
            <p className="text-body text-content-secondary mb-4">
              L&apos;accès à la plateforme est réservé aux professionnels du secteur de la bijouterie-joaillerie. L&apos;inscription est soumise à validation préalable par nos services après vérification des documents professionnels requis :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4">
              <li>Extrait Kbis de moins de 3 mois</li>
              <li>Numéro de TVA intracommunautaire</li>
              <li>Attestation d&apos;assurance professionnelle</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 3 - Prix et tarification
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Les prix affichés sont des prix professionnels HT (Hors Taxes). La TVA applicable sera ajoutée lors de la facturation selon le taux en vigueur.
            </p>
            <p className="text-body text-content-secondary mb-4">
              Des tarifs préférentiels peuvent être appliqués en fonction du volume d&apos;achat et de l&apos;ancienneté du compte client. Les prix des métaux précieux peuvent être indexés sur les cours du marché.
            </p>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary">
              <p className="font-medium text-content-primary mb-2">Grilles tarifaires :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Bronze : Tarif standard</li>
                <li>Silver : -5% sur le catalogue</li>
                <li>Gold : -10% sur le catalogue</li>
                <li>Platinum : -15% sur le catalogue + services premium</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 4 - Commandes et validation
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Les commandes peuvent être passées en ligne, par téléphone ou par email. Toute commande est soumise à validation par nos services et à disponibilité des produits.
            </p>
            <p className="text-body text-content-secondary">
              Un système d&apos;approbation interne peut être configuré par l&apos;entreprise cliente pour les commandes dépassant un certain montant.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 5 - Livraison
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Les délais de livraison sont donnés à titre indicatif. Les livraisons sont effectuées par transporteur sécurisé, adapté aux bijoux et métaux précieux.
            </p>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary">
              <p className="font-medium text-content-primary mb-2">Options de livraison :</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Standard sécurisé : 3-5 jours ouvrés</li>
                <li>Express sécurisé : 24-48h</li>
                <li>Sur rendez-vous : date convenue</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 6 - Paiement
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Le paiement peut s&apos;effectuer par :
            </p>
            <ul className="list-disc list-inside text-body text-content-secondary space-y-2 ml-4 mb-4">
              <li>Carte bancaire (Visa, Mastercard, American Express)</li>
              <li>Virement bancaire</li>
              <li>Prélèvement SEPA (sous conditions)</li>
              <li>Paiement différé (sous conditions d&apos;encours)</li>
            </ul>
            <p className="text-body text-content-secondary">
              En cas de retard de paiement, des pénalités de retard seront appliquées conformément à la législation en vigueur.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 7 - Garantie et retours
            </h2>
            <p className="text-body text-content-secondary mb-4">
              Tous nos produits bénéficient d&apos;une garantie de 2 ans contre les défauts de fabrication. Les retours sont acceptés dans un délai de 14 jours suivant la réception, sous conditions.
            </p>
            <p className="text-body text-content-secondary">
              Les produits personnalisés ou gravés ne peuvent faire l&apos;objet d&apos;un retour sauf défaut avéré.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 8 - Propriété et transfert des risques
            </h2>
            <p className="text-body text-content-secondary">
              Le transfert de propriété des produits n&apos;intervient qu&apos;après paiement intégral du prix. Toutefois, le transfert des risques s&apos;effectue dès la remise des produits au transporteur.
            </p>
          </section>

          <section>
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              Article 9 - Litiges
            </h2>
            <p className="text-body text-content-secondary">
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux de commerce de Paris seront seuls compétents.
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
