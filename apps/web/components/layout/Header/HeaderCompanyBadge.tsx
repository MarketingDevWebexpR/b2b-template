'use client';

/**
 * HeaderCompanyBadge Component
 *
 * Displays the connected company/user info in the header.
 * Shows company name, user role, and provides quick access to account.
 */

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Users,
  CreditCard,
  FileText,
  Package,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useB2B } from '@/contexts';
import { useMockData } from '@/hooks/useMockData';
import { ModuleGate } from '@/components/features/FeatureGate';

export interface HeaderCompanyBadgeProps {
  /** Additional CSS classes */
  className?: string;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    href: '/compte',
    icon: LayoutDashboard,
  },
  {
    id: 'orders',
    label: 'Mes commandes',
    href: '/compte/commandes',
    icon: Package,
  },
  {
    id: 'quotes',
    label: 'Mes devis',
    href: '/compte/devis',
    icon: FileText,
    module: 'quotes' as const,
  },
  {
    id: 'team',
    label: 'Mon equipe',
    href: '/compte/equipe',
    icon: Users,
    module: 'company' as const,
  },
  {
    id: 'billing',
    label: 'Facturation',
    href: '/compte/facturation',
    icon: CreditCard,
  },
  {
    id: 'settings',
    label: 'Parametres',
    href: '/compte/parametres',
    icon: Settings,
  },
];

export const HeaderCompanyBadge = memo(function HeaderCompanyBadge({
  className,
}: HeaderCompanyBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // B2B context
  const { employee, company } = useB2B();
  const { company: mockCompany } = useMockData();

  // Use mock data if B2B context is not available
  const displayCompany = company || mockCompany.currentCompany;
  const displayUser = employee || mockCompany.currentUser;

  // Get role label
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'buyer':
        return 'Acheteur';
      case 'approver':
        return 'Approbateur';
      case 'viewer':
        return 'Consultant';
      default:
        return 'Membre';
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={toggleDropdown}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2',
          'bg-neutral-50 border border-neutral-200 rounded-xl',
          'hover:bg-neutral-100 hover:border-neutral-300',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
          'group',
          isOpen && 'bg-neutral-100 border-neutral-300'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menu compte"
      >
        {/* Company icon */}
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8',
            'bg-amber-100 rounded-lg',
            'transition-colors duration-200'
          )}
        >
          <Building2 className="w-4 h-4 text-amber-700" strokeWidth={1.5} />
        </div>

        {/* Company info */}
        <div className="flex flex-col items-start text-left min-w-0">
          <span className="text-sm font-medium text-neutral-900 truncate max-w-[140px]">
            {displayCompany?.name || 'Mon entreprise'}
          </span>
          <span className="text-xs text-neutral-500 truncate max-w-[140px]">
            {displayUser?.firstName
              ? `${displayUser.firstName} - ${getRoleLabel(displayUser.role)}`
              : 'Se connecter'}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full right-0 mt-2 z-50',
              'w-64 bg-white rounded-xl shadow-xl border border-neutral-200',
              'overflow-hidden'
            )}
            role="menu"
          >
            {/* User info header */}
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10',
                    'bg-amber-100 rounded-full'
                  )}
                >
                  <User className="w-5 h-5 text-amber-700" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {displayUser?.firstName} {displayUser?.lastName}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {displayUser?.email || 'email@entreprise.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <nav className="p-2" aria-label="Menu compte">
              <ul className="space-y-0.5">
                {menuItems.map((item) => {
                  const ItemIcon = item.icon;
                  const linkContent = (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'text-sm text-neutral-700',
                        'hover:bg-neutral-50 hover:text-neutral-900',
                        'transition-colors duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
                      )}
                      role="menuitem"
                    >
                      <ItemIcon
                        className="w-4.5 h-4.5 text-neutral-400"
                        strokeWidth={1.5}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );

                  // Wrap with ModuleGate if module is specified
                  if (item.module) {
                    return (
                      <ModuleGate key={item.id} module={item.module}>
                        <li>{linkContent}</li>
                      </ModuleGate>
                    );
                  }

                  return <li key={item.id}>{linkContent}</li>;
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Handle logout
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'text-sm text-red-600',
                  'hover:bg-red-50',
                  'transition-colors duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20'
                )}
                role="menuitem"
              >
                <LogOut className="w-4.5 h-4.5" strokeWidth={1.5} />
                <span>Se deconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

HeaderCompanyBadge.displayName = 'HeaderCompanyBadge';

export default HeaderCompanyBadge;
