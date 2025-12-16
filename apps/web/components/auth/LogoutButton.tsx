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
      className="group flex h-full w-full items-center gap-4 border border-neutral-200 bg-white p-6 rounded-lg transition-all duration-200 hover:border-red-200 hover:bg-red-50/30"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-neutral-200 rounded-lg transition-all duration-200 group-hover:border-red-200 group-hover:bg-red-50">
        <LogOut
          className="h-5 w-5 text-neutral-500 transition-colors group-hover:text-red-600"
          strokeWidth={1.5}
        />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-sans text-base font-medium text-neutral-900 transition-colors group-hover:text-red-600">
          Deconnexion
        </h3>
        <p className="mt-1 font-sans text-sm text-neutral-500">
          Se deconnecter de votre compte
        </p>
      </div>
    </button>
  );
}
