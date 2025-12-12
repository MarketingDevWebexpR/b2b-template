import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeaderSpacer } from '@/components/layout/Header';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { getOrderCountByUserId, getTotalSpentByUserId } from '@/data/orders';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  User,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mon Compte | Maison Joaillerie',
  description: 'Gerez votre compte, consultez vos commandes et vos informations personnelles.',
};

export const dynamic = 'force-dynamic';

/**
 * Account dashboard navigation items
 */
const accountNavItems = [
  {
    href: '/compte/commandes',
    icon: Package,
    label: 'Mes Commandes',
    description: 'Suivez vos commandes en cours et passees',
  },
  {
    href: '/compte/favoris',
    icon: Heart,
    label: 'Mes Favoris',
    description: 'Retrouvez vos pieces coup de coeur',
  },
  {
    href: '/compte/adresses',
    icon: MapPin,
    label: 'Mes Adresses',
    description: 'Gerez vos adresses de livraison',
  },
  {
    href: '/compte/paiement',
    icon: CreditCard,
    label: 'Moyens de Paiement',
    description: 'Gerez vos cartes et modes de paiement',
  },
  {
    href: '/compte/profil',
    icon: User,
    label: 'Mon Profil',
    description: 'Modifiez vos informations personnelles',
  },
];

/**
 * AccountPage - User account dashboard
 *
 * Features:
 * - Welcome message with user name
 * - Quick stats (orders count, total spent)
 * - Navigation to sub-pages
 * - Logout button
 */
export default async function AccountPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;

  // Get user statistics
  const orderCount = getOrderCountByUserId(user.id!);
  const totalSpent = getTotalSpentByUserId(user.id!);

  return (
    <main className="min-h-screen bg-background-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <HeaderSpacer />
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-hermes-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

        <Container className="py-12 lg:py-16">
          <div className="text-center">
            <span className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500">
              Bienvenue
            </span>

            <h1 className="font-serif text-heading-1 text-text-primary md:text-display-2">
              {user.name || 'Mon Compte'}
            </h1>

            <div className="mx-auto my-6 h-px w-24 bg-hermes-500" />

            <p className="mx-auto max-w-2xl font-sans text-body-lg leading-elegant text-text-muted">
              Gerez votre compte et retrouvez toutes vos informations
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[{ label: 'Mon Compte' }]}
            className="mb-8"
          />

          {/* Quick Stats */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Orders Count */}
            <div className="border border-border-light bg-white p-6 text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                {orderCount}
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                {orderCount === 1 ? 'Commande' : 'Commandes'}
              </span>
            </div>

            {/* Total Spent */}
            <div className="border border-border-light bg-white p-6 text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                {formatPrice(totalSpent)}
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Total Achats
              </span>
            </div>

            {/* Member Since */}
            <div className="border border-border-light bg-white p-6 text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                Or
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Statut Membre
              </span>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex h-full items-center gap-4 border border-border-light bg-white p-6 transition-all duration-300 ease-luxe hover:border-hermes-500/30 hover:shadow-elegant"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-border-light transition-all duration-300 group-hover:border-hermes-500/30 group-hover:bg-hermes-50">
                    <Icon
                      className="h-5 w-5 text-text-secondary transition-colors group-hover:text-hermes-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-body-lg text-text-primary transition-colors group-hover:text-hermes-600">
                      {item.label}
                    </h3>
                    <p className="mt-1 font-sans text-caption text-text-muted">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 text-border-dark transition-all duration-300 group-hover:translate-x-1 group-hover:text-hermes-500"
                    strokeWidth={1.5}
                  />
                </Link>
              );
            })}

            {/* Logout Button */}
            <div className="h-full">
              <LogoutButton />
            </div>
          </div>

          {/* User Info Card */}
          <div className="mt-12 border border-border-light bg-white p-8">
            <h2 className="mb-6 font-serif text-heading-3 text-text-primary">
              Informations du Compte
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="block font-sans text-caption uppercase tracking-luxe text-text-muted">
                  Nom
                </span>
                <span className="mt-1 block font-sans text-body text-text-primary">
                  {user.name || '-'}
                </span>
              </div>
              <div>
                <span className="block font-sans text-caption uppercase tracking-luxe text-text-muted">
                  Email
                </span>
                <span className="mt-1 block font-sans text-body text-text-primary">
                  {user.email || '-'}
                </span>
              </div>
              <div>
                <span className="block font-sans text-caption uppercase tracking-luxe text-text-muted">
                  Statut
                </span>
                <span className="mt-1 inline-block border border-hermes-500/30 bg-hermes-50 px-3 py-1 font-sans text-caption uppercase tracking-luxe text-hermes-600">
                  {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
