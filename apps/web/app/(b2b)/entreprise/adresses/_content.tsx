'use client';


import { useState, useCallback } from 'react';
import type { CompanyAddress, CompanyAddressType } from '@maison/types';
import { cn } from '@/lib/utils';
import { useCompanyAddresses } from '@/contexts/CompanyContext';
import { useCompanyFeatures } from '@/contexts/FeatureContext';
import { EmptyState } from '@/components/b2b';
import { PageHeader } from '@/components/b2b/shared/PageHeader';
import { AddressBook } from '@/components/b2b/company/AddressBook';
import { AddressForm, type AddressFormData } from '@/components/b2b/company/AddressForm';
import { ConfirmModal } from '@/components/ui/Modal';

/**
 * Company Address Book Page
 *
 * Displays and manages company addresses with full CRUD operations.
 * Supports filtering by address type, setting default addresses,
 * and provides accessible modal forms for create/edit operations.
 */
export default function AdressesPage() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCompanyAddresses();

  // Feature flags
  const { isEnabled: hasCompany, hasAddresses } = useCompanyFeatures();

  // Module disabled - show message
  if (!hasCompany || !hasAddresses) {
    return (
      <EmptyState
        icon="document"
        message="Carnet d'adresses desactive"
        description="La fonctionnalite de gestion des adresses n'est pas disponible pour votre compte."
        action={{ label: 'Retour a l\'entreprise', href: '/entreprise' }}
      />
    );
  }

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CompanyAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<CompanyAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open form modal for creating new address
  const handleAddNew = useCallback(() => {
    setEditingAddress(null);
    setIsFormOpen(true);
  }, []);

  // Open form modal for editing existing address
  const handleEdit = useCallback((address: CompanyAddress) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  }, []);

  // Close form modal
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingAddress(null);
  }, []);

  // Open delete confirmation modal
  const handleDeleteClick = useCallback((address: CompanyAddress) => {
    setDeletingAddress(address);
  }, []);

  // Close delete confirmation modal
  const handleCloseDeleteConfirm = useCallback(() => {
    setDeletingAddress(null);
  }, []);

  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(
    async (data: AddressFormData) => {
      setIsSubmitting(true);
      try {
        if (editingAddress) {
          // Update existing address
          await updateAddress(editingAddress.id, {
            label: data.label,
            type: data.type,
            companyName: data.companyName,
            attention: data.attention || undefined,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || undefined,
            city: data.city,
            state: data.state || undefined,
            postalCode: data.postalCode,
            countryCode: data.countryCode,
            phone: data.phone || undefined,
            deliveryInstructions: data.deliveryInstructions || undefined,
            isDefault: data.isDefault,
          });
        } else {
          // Create new address
          await addAddress({
            label: data.label,
            type: data.type,
            companyName: data.companyName,
            attention: data.attention || undefined,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || undefined,
            city: data.city,
            state: data.state || undefined,
            postalCode: data.postalCode,
            countryCode: data.countryCode,
            phone: data.phone || undefined,
            deliveryInstructions: data.deliveryInstructions || undefined,
            isDefault: data.isDefault,
            isVerified: false,
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingAddress, addAddress, updateAddress]
  );

  // Handle delete confirmation
  const handleConfirmDelete = useCallback(async () => {
    if (!deletingAddress) return;

    setIsDeleting(true);
    try {
      await deleteAddress(deletingAddress.id);
      setDeletingAddress(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deletingAddress, deleteAddress]);

  // Handle set as default
  const handleSetDefault = useCallback(
    async (address: CompanyAddress) => {
      await setDefaultAddress(address.id, address.type as 'billing' | 'shipping');
    },
    [setDefaultAddress]
  );

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Carnet d'adresses"
        description="Gerez les adresses de livraison et de facturation de votre entreprise"
        breadcrumbs={[
          { label: 'Entreprise', href: '/entreprise' },
          { label: 'Carnet d\'adresses' },
        ]}
        actions={
          <button
            onClick={handleAddNew}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-primary text-white rounded-lg',
              'font-sans text-body-sm font-medium',
              'hover:bg-primary-600 transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2'
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajouter une adresse
          </button>
        }
      />

      {/* Address Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={addresses.length}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Livraison"
          value={addresses.filter((a) => a.type === 'shipping').length}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          }
        />
        <StatCard
          label="Facturation"
          value={addresses.filter((a) => a.type === 'billing').length}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          label="Par defaut"
          value={addresses.filter((a) => a.isDefault).length}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />
      </div>

      {/* Address Book */}
      <div className="bg-white rounded-lg border border-stroke-light p-6">
        <AddressBook
          addresses={addresses}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onSetDefault={handleSetDefault}
          onAddNew={handleAddNew}
          showAddButton
        />
      </div>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        address={editingAddress}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingAddress)}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'adresse"
        message={
          deletingAddress
            ? `Etes-vous sur de vouloir supprimer l'adresse "${deletingAddress.label}" ? Cette action est irreversible.`
            : ''
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

/**
 * StatCard Component - Small stat card for summary section
 */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4',
        'bg-white rounded-lg border border-stroke-light'
      )}
    >
      <div className="p-2 bg-primary-50 rounded-lg text-primary">{icon}</div>
      <div>
        <p className="font-sans text-heading-4 text-content-primary">{value}</p>
        <p className="font-sans text-caption text-content-muted">{label}</p>
      </div>
    </div>
  );
}
