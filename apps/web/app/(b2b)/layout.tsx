'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { B2BProvider, useB2B } from '@/contexts/B2BContext';

/**
 * Navigation items for B2B sidebar
 */
const navigationItems = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Entreprise',
    href: '/entreprise',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    children: [
      { label: 'Profil', href: '/entreprise' },
      { label: 'Employes', href: '/entreprise/employes' },
      { label: 'Parametres', href: '/entreprise/parametres' },
    ],
  },
  {
    label: 'Devis',
    href: '/devis',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badge: 3,
  },
  {
    label: 'Approbations',
    href: '/approbations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: 5,
  },
  {
    label: 'Commandes',
    href: '/commandes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    children: [
      { label: 'Historique', href: '/commandes' },
      { label: 'Commande groupee', href: '/commandes/bulk' },
    ],
  },
  {
    label: 'Rapports',
    href: '/rapports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

interface B2BLayoutProps {
  children: React.ReactNode;
}

/**
 * B2B Layout Inner Component
 * Uses the B2B context for company/employee data
 */
function B2BLayoutInner({ children }: B2BLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Refs for focus management
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Get B2B context data
  const { company, employee, isLoading, isB2BActive } = useB2B();

  // Derive display values with fallbacks
  const companyName = company?.name ?? 'Chargement...';
  const employeeInitials = employee
    ? `${employee.firstName[0]}${employee.lastName[0]}`
    : '--';
  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : 'Chargement...';
  const employeeTitle = employee?.jobTitle ?? '';
  const creditLimit = company?.creditLimit ?? 0;
  const creditUsed = company?.creditUsed ?? 0;
  const creditAvailable = company?.creditAvailable ?? (creditLimit - creditUsed);
  const creditUsagePercent = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Handle sidebar close with focus return
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    // Return focus to the menu button after closing
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 100);
  }, []);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button when sidebar opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  // Trap focus within sidebar when open on mobile
  useEffect(() => {
    if (!sidebarOpen || !sidebarRef.current) return;

    const sidebar = sidebarRef.current;
    const focusableElements = sidebar.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    sidebar.addEventListener('keydown', handleTabKey);
    return () => sidebar.removeEventListener('keydown', handleTabKey);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background-cream">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
          'focus:px-4 focus:py-2 focus:bg-hermes-500 focus:text-white',
          'focus:rounded-soft focus:font-sans focus:text-body-sm focus:font-medium',
          'focus:outline-none focus:ring-2 focus:ring-hermes-300 focus:ring-offset-2'
        )}
      >
        Aller au contenu principal
      </a>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-luxe-charcoal/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Navigation principale B2B"
        aria-hidden={!sidebarOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border-light',
          'transform transition-transform duration-300 ease-luxe',
          'lg:translate-x-0 lg:aria-hidden:visible',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Company header with close button for mobile */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft"
              >
                <h1 className="font-serif text-heading-5 text-text-primary">
                  Espace B2B
                </h1>
                <p className="mt-1 font-sans text-caption text-text-muted">
                  {companyName}
                </p>
              </Link>
              {/* Close button for mobile sidebar */}
              <button
                ref={closeButtonRef}
                onClick={closeSidebar}
                className={cn(
                  'lg:hidden p-2 -mr-2 text-text-secondary hover:text-text-primary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 rounded-soft'
                )}
                aria-label="Fermer le menu de navigation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" aria-label="Menu principal">
            <ul className="space-y-1" role="list">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleSection(item.href)}
                        aria-expanded={expandedSections.includes(item.href)}
                        aria-controls={`submenu-${item.href.replace('/', '')}`}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-soft',
                          'font-sans text-body-sm',
                          'transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2',
                          isActive(item.href)
                            ? 'bg-hermes-50 text-hermes-600'
                            : 'text-text-secondary hover:bg-background-muted hover:text-text-primary'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true">{item.icon}</span>
                          {item.label}
                        </span>
                        <svg
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            expandedSections.includes(item.href) && 'rotate-180'
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedSections.includes(item.href) && (
                        <ul
                          id={`submenu-${item.href.replace('/', '')}`}
                          className="mt-1 ml-8 space-y-1"
                          role="list"
                        >
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                aria-current={pathname === child.href ? 'page' : undefined}
                                className={cn(
                                  'block px-4 py-2 rounded-soft',
                                  'font-sans text-body-sm',
                                  'transition-all duration-200',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2',
                                  pathname === child.href
                                    ? 'bg-hermes-50 text-hermes-600'
                                    : 'text-text-muted hover:bg-background-muted hover:text-text-primary'
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-between gap-3 px-4 py-3 rounded-soft',
                        'font-sans text-body-sm',
                        'transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2',
                        isActive(item.href)
                          ? 'bg-hermes-50 text-hermes-600'
                          : 'text-text-secondary hover:bg-background-muted hover:text-text-primary'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-hermes-500 text-white text-xs font-medium"
                          aria-label={`${item.badge} elements en attente`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User context */}
          <div className="p-4 border-t border-border-light" role="region" aria-label="Informations utilisateur">
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="w-10 h-10 rounded-full bg-hermes-100 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="font-sans text-body-sm font-medium text-hermes-600">
                  {employeeInitials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-body-sm font-medium text-text-primary truncate">
                  {employeeName}
                </p>
                <p className="font-sans text-caption text-text-muted truncate">
                  {employeeTitle}
                </p>
              </div>
            </div>

            {/* Credit display */}
            <div className="mt-3 px-4" role="region" aria-label="Credit disponible">
              <div className="flex items-center justify-between mb-1">
                <span id="credit-label" className="font-sans text-caption text-text-muted">
                  Credit disponible
                </span>
                <span className="font-sans text-caption font-medium text-text-primary">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(creditAvailable)}
                </span>
              </div>
              <div
                className="h-1.5 bg-background-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={creditUsagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby="credit-label"
              >
                <div
                  className="h-full bg-hermes-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${creditUsagePercent}%`,
                  }}
                />
              </div>
              {/* Screen reader text for credit usage */}
              <span className="sr-only">
                {creditUsagePercent.toFixed(0)}% du credit utilise
              </span>
            </div>

            {/* Back to shop link */}
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 mt-4 px-4 py-2',
                'font-sans text-caption text-text-muted',
                'hover:text-hermes-500 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour a la boutique
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header
          className="sticky top-0 z-30 bg-white border-b border-border-light lg:hidden"
          role="banner"
        >
          <div className="flex items-center justify-between px-4 h-16">
            <button
              ref={menuButtonRef}
              onClick={() => setSidebarOpen(true)}
              className={cn(
                'p-2 -ml-2 text-text-secondary hover:text-text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 rounded-soft'
              )}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-serif text-heading-5 text-text-primary">
              Espace B2B
            </span>
            <div className="w-10" aria-hidden="true" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          role="main"
          aria-label="Contenu principal"
          className="min-h-screen"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * B2B Layout
 *
 * Provides sidebar navigation and company/employee context display
 * for all B2B routes. Wraps children with B2BProvider for context access.
 */
export default function B2BLayout({ children }: B2BLayoutProps) {
  return (
    <B2BProvider mockMode={true}>
      <B2BLayoutInner>{children}</B2BLayoutInner>
    </B2BProvider>
  );
}
