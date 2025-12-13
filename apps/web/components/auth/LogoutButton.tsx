'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

/**
 * LogoutButton - Client-side logout button
 * Uses next-auth/react signOut for proper session invalidation
 */
export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="group flex h-full w-full items-center gap-4 border border-border-light bg-white p-6 transition-all duration-300 ease-luxe hover:border-red-200 hover:bg-red-50/30"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-border-light transition-all duration-300 group-hover:border-red-200 group-hover:bg-red-50">
        <LogOut
          className="h-5 w-5 text-text-secondary transition-colors group-hover:text-red-600"
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-serif text-body-lg text-text-primary transition-colors group-hover:text-red-600">
          Deconnexion
        </h3>
        <p className="mt-1 font-sans text-caption text-text-muted">
          Se deconnecter de votre compte
        </p>
      </div>
    </button>
  );
}
