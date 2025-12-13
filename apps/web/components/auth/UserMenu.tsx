'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/**
 * UserMenu component for authentication
 * Shows user dropdown when logged in, login/register buttons when not
 */
export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Get user initials for avatar
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-luxury-charcoal animate-pulse" />
    );
  }

  // Not authenticated - show login/register buttons
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            Connexion
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary" size="sm" className="hidden md:flex">
            Inscription
          </Button>
        </Link>
        {/* Mobile: show user icon that links to login */}
        <Link
          href="/login"
          className={cn(
            'md:hidden flex items-center justify-center',
            'w-10 h-10 rounded-full',
            'text-white/80 hover:text-gold-500',
            'hover:bg-white/5',
            'transition-all duration-300'
          )}
          aria-label="Connexion"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  // Authenticated - show user menu
  return (
    <div ref={menuRef} className="relative">
      {/* Menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2',
          'px-2 py-1 rounded-full',
          'text-white/80 hover:text-gold-500',
          'hover:bg-white/5',
          'transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu utilisateur"
      >
        {/* Avatar */}
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'Avatar'}
            className="w-8 h-8 rounded-full object-cover border border-gold-500/30"
          />
        ) : (
          <div
            className={cn(
              'w-8 h-8 rounded-full',
              'bg-gold-500 text-luxury-black',
              'flex items-center justify-center',
              'text-sm font-medium'
            )}
          >
            {getInitials(session.user?.name)}
          </div>
        )}

        {/* Name and chevron (desktop only) */}
        <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
          {session.user?.name?.split(' ')[0]}
        </span>
        <ChevronDown
          className={cn(
            'hidden md:block w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-full mt-2',
              'w-56 py-2',
              'bg-luxury-black/95 backdrop-blur-md',
              'border border-white/10 rounded-lg',
              'shadow-luxury'
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-white/60 truncate">
                {session.user?.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2',
                  'text-sm text-white/80',
                  'hover:bg-white/5 hover:text-gold-500',
                  'transition-colors duration-200'
                )}
                role="menuitem"
              >
                <User className="w-4 h-4" />
                Mon compte
              </Link>

              <Link
                href="/account/orders"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2',
                  'text-sm text-white/80',
                  'hover:bg-white/5 hover:text-gold-500',
                  'transition-colors duration-200'
                )}
                role="menuitem"
              >
                <Package className="w-4 h-4" />
                Mes commandes
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-white/10 pt-1">
              <button
                onClick={handleSignOut}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2',
                  'text-sm text-white/80',
                  'hover:bg-white/5 hover:text-red-400',
                  'transition-colors duration-200'
                )}
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Deconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
