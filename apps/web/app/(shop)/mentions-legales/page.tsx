import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales | WebexpR Pro B2B',
  description: 'Mentions légales et informations juridiques de WebexpR Pro, votre partenaire bijouterie B2B.',
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container-ecom py-12 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-hero-sm font-bold text-content-primary mb-4">
            Mentions Légales
          </h1>
          <p className="text-body text-content-secondary max-w-2xl">
            Informations légales concernant l&apos;entreprise WebexpR Pro et l&apos;utilisation de ce site.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none">
          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              1. Éditeur du site
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary space-y-2">
              <p><strong className="text-content-primary">Raison sociale :</strong> WebexpR Pro SAS</p>
              <p><strong className="text-content-primary">Siège social :</strong> 12 Place Vendôme, 75001 Paris, France</p>
              <p><strong className="text-content-primary">SIREN :</strong> 123 456 789</p>
              <p><strong className="text-content-primary">RCS :</strong> Paris B 123 456 789</p>
              <p><strong className="text-content-primary">TVA Intracommunautaire :</strong> FR12 123 456 789</p>
              <p><strong className="text-content-primary">Capital social :</strong> 500 000 €</p>
              <p><strong className="text-content-primary">Directeur de la publication :</strong> Jean Dupont</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              2. Hébergement
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary space-y-2">
              <p><strong className="text-content-primary">Hébergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-content-primary">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong className="text-content-primary">Site web :</strong> vercel.com</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              3. Contact
            </h2>
            <div className="bg-surface-secondary rounded-lg p-6 text-body text-content-secondary space-y-2">
              <p><strong className="text-content-primary">Téléphone :</strong> 01 23 45 67 89</p>
              <p><strong className="text-content-primary">Email :</strong> pro@webexprpro.fr</p>
              <p><strong className="text-content-primary">Horaires :</strong> Lundi - Vendredi, 9h - 18h</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              4. Propriété intellectuelle
            </h2>
            <p className="text-body text-content-secondary mb-4">
              L&apos;ensemble du contenu de ce site (textes, images, logos, graphismes, icônes, etc.) est la propriété exclusive de WebexpR Pro SAS ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="text-body text-content-secondary">
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de WebexpR Pro SAS.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              5. Limitation de responsabilité
            </h2>
            <p className="text-body text-content-secondary mb-4">
              WebexpR Pro SAS s&apos;efforce d&apos;assurer au mieux l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
            </p>
            <p className="text-body text-content-secondary">
              En conséquence, WebexpR Pro SAS décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-section-sm font-semibold text-content-primary mb-4">
              6. Droit applicable
            </h2>
            <p className="text-body text-content-secondary">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
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
