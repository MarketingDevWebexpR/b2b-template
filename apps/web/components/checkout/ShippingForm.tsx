'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { MapPin, User, Phone, Building2, Home, Plus, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Mock saved addresses
 */
interface SavedAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Domicile',
    firstName: 'Marie',
    lastName: 'Dupont',
    phone: '+33 6 12 34 56 78',
    address: '15 Avenue des Champs-Elysees',
    addressLine2: 'Appartement 4B',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Bureau',
    firstName: 'Marie',
    lastName: 'Dupont',
    phone: '+33 1 42 68 53 00',
    address: '25 Rue de la Paix',
    addressLine2: '3ème étage',
    city: 'Paris',
    postalCode: '75002',
    country: 'France',
  },
];

/**
 * Zod schema for shipping address validation
 */
const shippingSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z
    .string()
    .min(10, 'Veuillez entrer un numéro de téléphone valide')
    .regex(/^[0-9+\s-]+$/, 'Format de téléphone invalide'),
  address: z
    .string()
    .min(5, 'Veuillez entrer une adresse complète'),
  addressLine2: z.string().optional(),
  city: z
    .string()
    .min(2, 'Veuillez entrer une ville valide'),
  postalCode: z
    .string()
    .min(4, 'Code postal invalide')
    .regex(/^[0-9]{4,5}$/, 'Code postal invalide'),
  country: z.string().min(2, 'Veuillez sélectionner un pays'),
});

/**
 * Shipping form data type
 */
export type ShippingFormData = z.infer<typeof shippingSchema>;

/**
 * Form validation errors type
 */
interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  general?: string;
}

/**
 * ShippingForm Props
 */
interface ShippingFormProps {
  /** Initial form data (for editing) */
  initialData?: Partial<ShippingFormData>;
  /** Callback when form is successfully submitted */
  onSubmit: (data: ShippingFormData) => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Initial empty form state
 */
const initialFormState: ShippingFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'France',
};

/**
 * ShippingForm Component
 * Elegant shipping address form with French labels
 * Hermes-inspired luxury styling
 */
export function ShippingForm({
  initialData,
  onSubmit,
  isLoading = false,
  className,
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    ...initialFormState,
    ...initialData,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  // 'new' for new address, or address id for saved address
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(
    SAVED_ADDRESSES.find((a) => a.isDefault)?.id || 'new'
  );

  /**
   * Initialize form data with default saved address on mount
   */
  useEffect(() => {
    const defaultAddress = SAVED_ADDRESSES.find((a) => a.isDefault);
    if (defaultAddress && !initialData) {
      setFormData({
        firstName: defaultAddress.firstName,
        lastName: defaultAddress.lastName,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
        addressLine2: defaultAddress.addressLine2 || '',
        city: defaultAddress.city,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      });
    }
  }, [initialData]);

  /**
   * Handle saved address selection
   */
  const handleAddressSelect = (addressId: string | 'new') => {
    setSelectedAddressId(addressId);
    setErrors({});

    if (addressId === 'new') {
      // Reset to empty form
      setFormData(initialFormState);
    } else {
      // Fill form with saved address data
      const savedAddress = SAVED_ADDRESSES.find((a) => a.id === addressId);
      if (savedAddress) {
        setFormData({
          firstName: savedAddress.firstName,
          lastName: savedAddress.lastName,
          phone: savedAddress.phone,
          address: savedAddress.address,
          addressLine2: savedAddress.addressLine2 || '',
          city: savedAddress.city,
          postalCode: savedAddress.postalCode,
          country: savedAddress.country,
        });
      }
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    try {
      shippingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Section title */}
      <div className="mb-8">
        <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-2">
          Adresse de livraison
        </h2>
        <p className="text-sm text-text-muted">
          Vos bijoux seront livrés à cette adresse de manière sécurisée.
        </p>
      </div>

      {/* Saved addresses selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-primary">
          Choisir une adresse
        </p>
        <div className="grid grid-cols-1 gap-3">
          {/* Saved address cards */}
          {SAVED_ADDRESSES.map((addr) => (
            <button
              key={addr.id}
              type="button"
              onClick={() => handleAddressSelect(addr.id)}
              disabled={isLoading}
              className={cn(
                'w-full p-4 text-left',
                'border transition-all duration-200',
                'flex items-start gap-4',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selectedAddressId === addr.id
                  ? 'border-hermes-500 bg-hermes-500/5 ring-1 ring-hermes-500/30'
                  : 'border-border-light bg-white hover:border-hermes-500/50'
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 mt-0.5',
                  'rounded-full border-2',
                  'flex items-center justify-center',
                  'transition-colors duration-200',
                  selectedAddressId === addr.id
                    ? 'border-hermes-500 bg-hermes-500'
                    : 'border-border-medium bg-white'
                )}
              >
                {selectedAddressId === addr.id && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Address content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-4 h-4 text-hermes-500" />
                  <span className="font-medium text-text-primary">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-hermes-500/10 text-hermes-600 rounded-full">
                      Par défaut
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-muted truncate">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-sm text-text-muted truncate">
                  {addr.address}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-sm text-text-muted">
                  {addr.postalCode} {addr.city}, {addr.country}
                </p>
              </div>
            </button>
          ))}

          {/* New address option */}
          <button
            type="button"
            onClick={() => handleAddressSelect('new')}
            disabled={isLoading}
            className={cn(
              'w-full p-4 text-left',
              'border transition-all duration-200',
              'flex items-center gap-4',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectedAddressId === 'new'
                ? 'border-hermes-500 bg-hermes-500/5 ring-1 ring-hermes-500/30'
                : 'border-border-light bg-white hover:border-hermes-500/50'
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                'flex-shrink-0 w-5 h-5',
                'rounded-full border-2',
                'flex items-center justify-center',
                'transition-colors duration-200',
                selectedAddressId === 'new'
                  ? 'border-hermes-500 bg-hermes-500'
                  : 'border-border-medium bg-white'
              )}
            >
              {selectedAddressId === 'new' && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>

            {/* New address content */}
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-hermes-500" />
              <span className="font-medium text-text-primary">
                Utiliser une nouvelle adresse
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* New address form - only shown when 'new' is selected */}
      {selectedAddressId === 'new' && (
        <>
          {/* Divider */}
          <div className="border-t border-border-light" />

          {/* General error message */}
          {errors.general && (
            <div
              role="alert"
              className={cn(
                'p-4 border border-red-500/30 bg-red-500/10',
                'text-red-600 text-sm text-center'
              )}
            >
              {errors.general}
            </div>
          )}

          {/* Form title */}
          <p className="text-sm font-medium text-text-primary">
            Nouvelle adresse
          </p>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              name="firstName"
              type="text"
              placeholder="Votre prénom"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              disabled={isLoading}
              autoComplete="given-name"
              startIcon={<User className="h-5 w-5" />}
              containerClassName="bg-white"
              className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
            />

            <Input
              label="Nom"
              name="lastName"
              type="text"
              placeholder="Votre nom"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              disabled={isLoading}
              autoComplete="family-name"
              startIcon={<User className="h-5 w-5" />}
              containerClassName="bg-white"
              className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
            />
          </div>

          {/* Contact field */}
          <Input
            label="Téléphone"
            name="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            autoComplete="tel"
            startIcon={<Phone className="h-5 w-5" />}
            containerClassName="bg-white"
            className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
          />

          {/* Address field */}
          <Input
            label="Adresse"
            name="address"
            type="text"
            placeholder="Numéro et nom de rue"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            disabled={isLoading}
            autoComplete="address-line1"
            startIcon={<MapPin className="h-5 w-5" />}
            containerClassName="bg-white"
            className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
          />

          {/* Address line 2 (optional) */}
          <Input
            label="Complément d'adresse"
            name="addressLine2"
            type="text"
            placeholder="Appartement, bâtiment, étage... (optionnel)"
            value={formData.addressLine2}
            onChange={handleChange}
            error={errors.addressLine2}
            disabled={isLoading}
            autoComplete="address-line2"
            startIcon={<Building2 className="h-5 w-5" />}
            containerClassName="bg-white"
            className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
          />

          {/* City and postal code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ville"
              name="city"
              type="text"
              placeholder="Votre ville"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              disabled={isLoading}
              autoComplete="address-level2"
              containerClassName="bg-white"
              className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
            />

            <Input
              label="Code postal"
              name="postalCode"
              type="text"
              placeholder="75001"
              value={formData.postalCode}
              onChange={handleChange}
              error={errors.postalCode}
              disabled={isLoading}
              autoComplete="postal-code"
              containerClassName="bg-white"
              className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
            />
          </div>

          {/* Country selection */}
          <div className="relative">
            <label
              htmlFor="country"
              className={cn(
                'block mb-2',
                'font-sans text-sm font-medium tracking-wide',
                'text-text-primary'
              )}
            >
              Pays
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={isLoading}
              className={cn(
                'w-full px-4 py-3',
                'bg-white text-text-primary',
                'border border-border-light',
                'focus:outline-none focus:border-hermes-500 focus:ring-1 focus:ring-hermes-500/30',
                'transition-all duration-300',
                'disabled:bg-background-beige disabled:cursor-not-allowed',
                errors.country && 'border-red-500'
              )}
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Monaco">Monaco</option>
            </select>
            {errors.country && (
              <p className="mt-2 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </>
      )}

      {/* Submit button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full uppercase tracking-wider border border-luxe-charcoal hover:bg-luxe-charcoal hover:text-white transition-all duration-300"
        >
          Continuer vers le paiement
        </Button>
      </div>

      {/* Security note */}
      <p className="text-xs text-text-muted text-center pt-2">
        Vos informations sont protégées et ne seront jamais partagées.
      </p>
    </form>
  );
}

export default ShippingForm;
