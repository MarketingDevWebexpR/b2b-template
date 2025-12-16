import { type Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion | WebexpR Pro',
  description: 'Connectez-vous a votre compte WebexpR Pro pour acceder a vos commandes et favoris.',
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
        <div className="w-12 h-[2px] bg-accent mx-auto mb-6" />

        <h1 className="text-heading-3 md:text-heading-2 font-sans text-neutral-100 mb-3">
          Bon retour
        </h1>

        <p className="text-neutral-400">
          Connectez-vous pour acceder a votre espace personnel
        </p>
      </div>

      {/* Login Form */}
      <Suspense fallback={<div className="animate-pulse h-64 bg-neutral-800 rounded-lg" />}>
        <LoginForm />
      </Suspense>

      {/* Register link - visible on desktop */}
      <div className="hidden md:block mt-8 text-center">
        <p className="text-neutral-400">
          Vous n'avez pas encore de compte ?{' '}
          <Link
            href="/register"
            className="text-accent hover:text-accent transition-colors font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
