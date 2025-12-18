'use client';


import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, getInitials } from '@/lib/formatters';
import { useB2B, useB2BPermissions } from '@/contexts/B2BContext';
import { useCompanyFeatures } from '@/contexts/FeatureContext';
import { EmptyState } from '@/components/b2b';

/**
 * Company Profile Page
 *
 * Displays company information, addresses, and credit status.
 * Data is pulled from B2B context.
 */
export default function EntreprisePage() {
  // Get B2B context data
  const { company, employees, isLoading } = useB2B();
  const { canEditCompany, canManageEmployees, canViewSpending } = useB2BPermissions();

  // Feature flags
  const { isEnabled: hasCompany, hasEmployees, hasAddresses } = useCompanyFeatures();

  // Module disabled - show message
  if (!hasCompany) {
    return (
      <EmptyState
        icon="document"
        message="Module entreprise desactive"
        description="La gestion d'entreprise n'est pas disponible pour votre compte."
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-sans text-body text-content-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  // No company found
  if (!company) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-lg border border-stroke-light p-8 text-center">
          <p className="font-sans text-body text-content-muted">
            Aucune entreprise trouvee
          </p>
        </div>
      </div>
    );
  }

  // Derive display values
  const companyInitials = getInitials(company.name);
  const paymentTermsLabel = company.paymentTerms?.type?.replace('_', ' ') ?? 'Standard';
  const billingAddress = company.addresses?.find(a => a.type === 'billing') ?? company.addresses?.[0];
  const shippingAddresses = company.addresses?.filter(a => a.type === 'shipping') ?? [];
  const creditUsagePercent = company.creditLimit > 0 ? (company.creditUsed / company.creditLimit) * 100 : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans text-heading-3 text-content-primary">
            Profil Entreprise
          </h1>
          <p className="mt-1 font-sans text-body text-content-muted">
            Informations et parametres de votre entreprise
          </p>
        </div>
        {canEditCompany && (
          <Link
            href="/entreprise/parametres"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-white border border-stroke-light rounded-lg',
              'font-sans text-body-sm font-medium text-content-primary',
              'hover:bg-surface-secondary transition-colors duration-200'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Parametres
          </Link>
        )}
      </div>

      {/* Company Header Card */}
      <div className="bg-white rounded-lg border border-stroke-light p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-sans text-heading-3 text-primary-600">
              {companyInitials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-sans text-heading-4 text-content-primary">
                {company.name}
              </h2>
              <span className={cn(
                'px-2 py-0.5 rounded-full',
                'font-sans text-caption font-medium',
                company.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}>
                {company.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
              {company.tier && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full',
                  'font-sans text-caption font-medium',
                  'bg-primary-50 text-primary-800'
                )}>
                  {company.tier.charAt(0).toUpperCase() + company.tier.slice(1)}
                </span>
              )}
            </div>
            <p className="mt-1 font-sans text-body text-content-muted">
              Client depuis le {formatDate(company.createdAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-6">
              {company.email && (
                <div className="flex items-center gap-2 text-content-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-sans text-body-sm">{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-content-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-sans text-body-sm">{company.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg border border-stroke-light">
          <div className="p-6 border-b border-stroke-light">
            <h3 className="font-sans text-heading-5 text-content-primary">
              Informations legales
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {company.registrationNumber && (
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-muted">SIRET</span>
                <span className="font-sans text-body-sm font-medium text-content-primary">
                  {company.registrationNumber}
                </span>
              </div>
            )}
            {company.taxId && (
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-muted">N TVA</span>
                <span className="font-sans text-body-sm font-medium text-content-primary">
                  {company.taxId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-sans text-body-sm text-content-muted">Conditions de paiement</span>
              <span className="font-sans text-body-sm font-medium text-content-primary capitalize">
                {paymentTermsLabel}
              </span>
            </div>
            {company.website && (
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-muted">Site web</span>
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-body-sm font-medium text-primary hover:text-primary-600"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Credit Status */}
        <div className="bg-white rounded-lg border border-stroke-light">
          <div className="p-6 border-b border-stroke-light">
            <h3 className="font-sans text-heading-5 text-content-primary">
              Situation de credit
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="font-sans text-body-sm text-content-muted">Limite de credit</span>
              <span className="font-sans text-body-sm font-medium text-content-primary">
                {formatCurrency(company.creditLimit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-body-sm text-content-muted">Credit utilise</span>
              <span className="font-sans text-body-sm font-medium text-content-primary">
                {formatCurrency(company.creditUsed)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-body-sm text-content-muted">Credit disponible</span>
              <span className="font-sans text-body-sm font-medium text-green-600">
                {formatCurrency(company.creditAvailable)}
              </span>
            </div>
            <div className="pt-2">
              <div className="h-3 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    creditUsagePercent > 80 ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                />
              </div>
              <p className="mt-2 font-sans text-caption text-content-muted">
                {creditUsagePercent.toFixed(0)}% utilise
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses - Gated by company.addresses */}
      {hasAddresses && (
      <div className="bg-white rounded-lg border border-stroke-light">
        <div className="flex items-center justify-between p-6 border-b border-stroke-light">
          <h3 className="font-sans text-heading-5 text-content-primary">
            Adresses
          </h3>
          {canEditCompany && (
            <button
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5',
                'bg-primary text-white rounded-lg',
                'font-sans text-caption font-medium',
                'hover:bg-primary-600 transition-colors duration-200'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-light">
          {/* Billing Address */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="font-sans text-body-sm font-medium text-content-primary">
                Adresse de facturation
              </h4>
            </div>
            {billingAddress ? (
              <>
                <address className="font-sans text-body-sm text-content-secondary not-italic space-y-1">
                  <p>{billingAddress.addressLine1}</p>
                  {billingAddress.addressLine2 && <p>{billingAddress.addressLine2}</p>}
                  <p>{billingAddress.postalCode} {billingAddress.city}</p>
                  <p>{billingAddress.countryCode}</p>
                </address>
                {canEditCompany && (
                  <button className="mt-4 font-sans text-caption text-primary hover:text-primary-600">
                    Modifier
                  </button>
                )}
              </>
            ) : (
              <p className="font-sans text-body-sm text-content-muted">
                Aucune adresse de facturation
              </p>
            )}
          </div>

          {/* Shipping Addresses */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h4 className="font-sans text-body-sm font-medium text-content-primary">
                Adresses de livraison
              </h4>
            </div>
            {shippingAddresses.length > 0 ? (
              <div className="space-y-4">
                {shippingAddresses.map((address) => (
                  <div key={address.id} className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-body-sm font-medium text-content-primary">
                          {address.label ?? 'Livraison'}
                        </span>
                        {address.isDefault && (
                          <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                            Par defaut
                          </span>
                        )}
                      </div>
                      <address className="mt-1 font-sans text-caption text-content-muted not-italic">
                        {address.addressLine1}, {address.postalCode} {address.city}
                      </address>
                    </div>
                    {canEditCompany && (
                      <button className="font-sans text-caption text-primary hover:text-primary-600">
                        Modifier
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-body-sm text-content-muted">
                Aucune adresse de livraison
              </p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Employees link - Gated by company.employees AND canManageEmployees permission */}
        {hasEmployees && canManageEmployees && (
          <Link
            href="/entreprise/employes"
            className={cn(
              'flex items-center gap-4 p-4',
              'bg-white rounded-lg border border-stroke-light',
              'hover:border-primary/20 hover:shadow-sm transition-all duration-200'
            )}
          >
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Gerer les employes
              </p>
              <p className="font-sans text-caption text-content-muted">
                {employees.length} employe{employees.length !== 1 ? 's' : ''} actif{employees.length !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        )}
        {canEditCompany && (
          <Link
            href="/entreprise/parametres"
            className={cn(
              'flex items-center gap-4 p-4',
              'bg-white rounded-lg border border-stroke-light',
              'hover:border-primary/20 hover:shadow-sm transition-all duration-200'
            )}
          >
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Parametres
              </p>
              <p className="font-sans text-caption text-content-muted">
                Notifications, preferences
              </p>
            </div>
          </Link>
        )}
        {canViewSpending && (
          <Link
            href="/rapports"
            className={cn(
              'flex items-center gap-4 p-4',
              'bg-white rounded-lg border border-stroke-light',
              'hover:border-primary/20 hover:shadow-sm transition-all duration-200'
            )}
          >
            <div className="p-2 bg-primary-50 rounded-lg text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Rapports
              </p>
              <p className="font-sans text-caption text-content-muted">
                Depenses, historique
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
