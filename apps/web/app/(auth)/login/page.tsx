import { type Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion | Maison Bijoux',
  description: 'Connectez-vous a votre compte Maison Bijoux pour acceder a vos commandes et favoris.',
};

/**
 * Login Page
 * Displays the login form with welcome message and link to register
 */
export default function LoginPage() {
  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        {/* Decorative line */}
        <div className="w-12 h-[2px] bg-gold-500 mx-auto mb-6" />

        <h1 className="text-heading-3 md:text-heading-2 font-serif text-luxury-pearl mb-3">
          Bon retour
        </h1>

        <p className="text-luxury-silver">
          Connectez-vous pour acceder a votre espace personnel
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Register link - visible on desktop */}
      <div className="hidden md:block mt-8 text-center">
        <p className="text-luxury-silver">
          Vous n'avez pas encore de compte ?{' '}
          <Link
            href="/register"
            className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
