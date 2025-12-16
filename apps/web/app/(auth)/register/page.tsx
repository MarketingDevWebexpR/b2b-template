import { type Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Créer un compte | WebexpR Pro',
  description: 'Créez votre compte WebexpR Pro pour découvrir nos collections exclusives et bénéficier d\'avantages uniques.',
};

/**
 * Register Page
 * Displays the registration form with header and link to login
 */
export default function RegisterPage() {
  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        {/* Decorative line */}
        <div className="w-12 h-[2px] bg-accent mx-auto mb-6" />

        <h1 className="text-heading-3 md:text-heading-2 font-sans text-luxury-pearl mb-3">
          Créer un compte
        </h1>

        <p className="text-luxury-silver">
          Rejoignez notre communauté et découvrez des avantages exclusifs
        </p>
      </div>

      {/* Benefits list */}
      <div className="mb-8 p-4 border border-luxury-gray/30 bg-luxury-charcoal/30">
        <p className="text-sm text-accent font-medium mb-3">Avantages membres</p>
        <ul className="space-y-2">
          {[
            'Accès anticipé aux nouvelles collections',
            'Offres et réductions exclusives',
            'Suivi de vos commandes et favoris',
            'Invitation aux événements privés',
          ].map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-luxury-silver">
              <svg
                className="w-4 h-4 text-accent flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Login link - visible on desktop */}
      <div className="hidden md:block mt-8 text-center">
        <p className="text-luxury-silver">
          Vous avez déjà un compte ?{' '}
          <Link
            href="/login"
            className="text-accent hover:text-accent transition-colors font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
