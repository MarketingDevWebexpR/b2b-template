'use client';

import { useState, useCallback, useEffect, useId } from 'react';
import type { CompanyAddress, CompanyAddressType } from '@maison/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

/**
 * Form data for address creation/editing
 */
export interface AddressFormData {
  label: string;
  type: CompanyAddressType;
  companyName: string;
  attention?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

/**
 * Form validation errors
 */
export interface AddressFormErrors {
  label?: string;
  type?: string;
  companyName?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
}

/**
 * Props for AddressForm component
 */
export interface AddressFormProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when form is submitted successfully */
  onSubmit: (data: AddressFormData) => Promise<void>;
  /** Address to edit (null for creating new) */
  address?: CompanyAddress | null;
  /** Modal title override */
  title?: string;
  /** Whether the form is in loading state */
  isLoading?: boolean;
}

/**
 * Country options for the select
 */
const countryOptions = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'IT', label: 'Italie' },
  { value: 'ES', label: 'Espagne' },
  { value: 'NL', label: 'Pays-Bas' },
  { value: 'GB', label: 'Royaume-Uni' },
  { value: 'PT', label: 'Portugal' },
  { value: 'AT', label: 'Autriche' },
  { value: 'MC', label: 'Monaco' },
];

/**
 * Address type options for the select
 */
const addressTypeOptions = [
  { value: 'shipping', label: 'Adresse de livraison' },
  { value: 'billing', label: 'Adresse de facturation' },
  { value: 'headquarters', label: 'Siege social' },
  { value: 'warehouse', label: 'Entrepot' },
];

/**
 * Initial form state
 */
const initialFormData: AddressFormData = {
  label: '',
  type: 'shipping',
  companyName: '',
  attention: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  countryCode: 'FR',
  phone: '',
  deliveryInstructions: '',
  isDefault: false,
};

/**
 * Validate phone number format
 */
function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  // Accept various formats: +33 1 23 45 67 89, 01 23 45 67 89, 0123456789
  const phoneRegex = /^(\+?\d{1,3}[\s.-]?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate postal code format (basic validation)
 */
function isValidPostalCode(postalCode: string, countryCode: string): boolean {
  if (!postalCode) return false;
  const patterns: Record<string, RegExp> = {
    FR: /^\d{5}$/,
    BE: /^\d{4}$/,
    CH: /^\d{4}$/,
    LU: /^\d{4}$/,
    DE: /^\d{5}$/,
    IT: /^\d{5}$/,
    ES: /^\d{5}$/,
    NL: /^\d{4}\s?[A-Z]{2}$/i,
    GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    PT: /^\d{4}-\d{3}$/,
  };
  const pattern = patterns[countryCode];
  if (!pattern) return postalCode.length >= 3;
  return pattern.test(postalCode);
}

/**
 * AddressForm Component
 *
 * A modal form for creating or editing company addresses.
 * Includes comprehensive validation and accessibility features.
 *
 * @example
 * ```tsx
 * <AddressForm
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSubmit={async (data) => {
 *     await saveAddress(data);
 *   }}
 *   address={editingAddress}
 * />
 * ```
 */
export function AddressForm({
  isOpen,
  onClose,
  onSubmit,
  address,
  title,
  isLoading = false,
}: AddressFormProps) {
  const formId = useId();
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData({
          label: address.label || '',
          type: address.type,
          companyName: address.companyName || '',
          attention: address.attention || '',
          addressLine1: address.addressLine1 || '',
          addressLine2: address.addressLine2 || '',
          city: address.city || '',
          state: address.state || '',
          postalCode: address.postalCode || '',
          countryCode: address.countryCode || 'FR',
          phone: address.phone || '',
          deliveryInstructions: address.deliveryInstructions || '',
          isDefault: address.isDefault || false,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, address]);

  // Handle input changes
  const handleChange = useCallback(
    (field: keyof AddressFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value =
          e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;

        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when field is modified
        if (errors[field as keyof AddressFormErrors]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  // Handle checkbox changes
  const handleCheckboxChange = useCallback(
    (field: keyof AddressFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
    },
    []
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: AddressFormErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Le libelle est requis';
    }

    if (!formData.type) {
      newErrors.type = 'Le type d\'adresse est requis';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'L\'adresse est requise';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    } else if (!isValidPostalCode(formData.postalCode, formData.countryCode)) {
      newErrors.postalCode = 'Format de code postal invalide';
    }

    if (!formData.countryCode) {
      newErrors.countryCode = 'Le pays est requis';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Format de telephone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Error submitting address form:', error);
        // Error handling could be enhanced here
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onSubmit, onClose]
  );

  const isEditing = Boolean(address);
  const modalTitle = title || (isEditing ? 'Modifier l\'adresse' : 'Nouvelle adresse');
  const submitButtonText = isEditing ? 'Enregistrer' : 'Ajouter l\'adresse';
  const isDisabled = isSubmitting || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabled}
            className={cn(
              'px-4 py-2',
              'font-sans text-body font-medium',
              'text-content-secondary',
              'bg-white',
              'border border-stroke-light',
              'rounded-lg',
              'hover:bg-surface-secondary',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            Annuler
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isDisabled}
            className={cn(
              'px-4 py-2',
              'font-sans text-body font-medium',
              'text-white',
              'bg-primary hover:bg-primary-600',
              'rounded-lg',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
              'flex items-center gap-2'
            )}
          >
            {isSubmitting && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {submitButtonText}
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        {/* Label and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Libelle *"
            placeholder="ex: Siege social, Boutique Paris..."
            value={formData.label}
            onChange={handleChange('label')}
            error={errors.label}
            disabled={isDisabled}
            autoFocus
          />
          <Select
            label="Type d'adresse *"
            options={addressTypeOptions}
            value={formData.type}
            onChange={handleChange('type')}
            error={errors.type}
            disabled={isDisabled}
          />
        </div>

        {/* Company and Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom de l'entreprise *"
            placeholder="Nom legal de l'entreprise"
            value={formData.companyName}
            onChange={handleChange('companyName')}
            error={errors.companyName}
            disabled={isDisabled}
          />
          <Input
            label="A l'attention de"
            placeholder="Nom du contact"
            value={formData.attention || ''}
            onChange={handleChange('attention')}
            disabled={isDisabled}
          />
        </div>

        {/* Address lines */}
        <Input
          label="Adresse *"
          placeholder="Numero et nom de rue"
          value={formData.addressLine1}
          onChange={handleChange('addressLine1')}
          error={errors.addressLine1}
          disabled={isDisabled}
        />

        <Input
          label="Complement d'adresse"
          placeholder="Batiment, etage, code d'acces..."
          value={formData.addressLine2 || ''}
          onChange={handleChange('addressLine2')}
          disabled={isDisabled}
        />

        {/* City, Postal Code, State */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Code postal *"
            placeholder="ex: 75001"
            value={formData.postalCode}
            onChange={handleChange('postalCode')}
            error={errors.postalCode}
            disabled={isDisabled}
          />
          <Input
            label="Ville *"
            placeholder="ex: Paris"
            value={formData.city}
            onChange={handleChange('city')}
            error={errors.city}
            disabled={isDisabled}
          />
          <Input
            label="Region / Etat"
            placeholder="ex: Ile-de-France"
            value={formData.state || ''}
            onChange={handleChange('state')}
            disabled={isDisabled}
          />
        </div>

        {/* Country and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Pays *"
            options={countryOptions}
            value={formData.countryCode}
            onChange={handleChange('countryCode')}
            error={errors.countryCode}
            disabled={isDisabled}
          />
          <Input
            label="Telephone"
            placeholder="+33 1 23 45 67 89"
            type="tel"
            value={formData.phone || ''}
            onChange={handleChange('phone')}
            error={errors.phone}
            disabled={isDisabled}
          />
        </div>

        {/* Delivery Instructions (only for shipping addresses) */}
        {(formData.type === 'shipping' || formData.type === 'warehouse') && (
          <div>
            <label
              htmlFor="deliveryInstructions"
              className={cn(
                'block mb-1.5',
                'font-sans text-sm font-medium',
                'text-content-secondary'
              )}
            >
              Instructions de livraison
            </label>
            <textarea
              id="deliveryInstructions"
              placeholder="Horaires de reception, acces, instructions speciales..."
              value={formData.deliveryInstructions || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryInstructions: e.target.value,
                }))
              }
              disabled={isDisabled}
              rows={3}
              className={cn(
                'w-full',
                'font-sans text-body',
                'bg-white text-content-primary',
                'border border-stroke-light',
                'rounded-lg',
                'px-4 py-3',
                'placeholder:text-content-muted',
                'transition-all duration-200',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                'hover:border-stroke',
                'disabled:bg-surface-secondary disabled:text-content-muted disabled:cursor-not-allowed',
                'resize-none'
              )}
            />
          </div>
        )}

        {/* Default checkbox */}
        <div className="pt-2 border-t border-stroke-light">
          <Checkbox
            label="Definir comme adresse par defaut"
            description={`Cette adresse sera utilisee par defaut pour ${
              formData.type === 'billing'
                ? 'la facturation'
                : formData.type === 'shipping'
                ? 'les livraisons'
                : 'ce type d\'adresse'
            }`}
            checked={formData.isDefault}
            onChange={handleCheckboxChange('isDefault')}
            disabled={isDisabled}
          />
        </div>
      </form>
    </Modal>
  );
}

export default AddressForm;
