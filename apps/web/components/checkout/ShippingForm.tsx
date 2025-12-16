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
 * B2B professional neutral aesthetic
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
        <h2 className="font-sans font-semibold text-xl md:text-2xl text-neutral-900 mb-2">
          Adresse de livraison
        </h2>
        <p className="text-sm text-neutral-500">
          Vos produits seront livres a cette adresse de maniere securisee.
        </p>
      </div>

      {/* Saved addresses selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-900">
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
                'w-full p-4 text-left rounded-lg',
                'border transition-all duration-200',
                'flex items-start gap-4',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selectedAddressId === addr.id
                  ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                  : 'border-neutral-200 bg-white hover:border-accent/50'
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
                    ? 'border-accent bg-accent'
                    : 'border-neutral-300 bg-white'
                )}
              >
                {selectedAddressId === addr.id && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Address content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="w-4 h-4 text-accent" />
                  <span className="font-medium text-neutral-900">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                      Par defaut
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 truncate">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-sm text-neutral-500 truncate">
                  {addr.address}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p className="text-sm text-neutral-500">
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
              'w-full p-4 text-left rounded-lg',
              'border transition-all duration-200',
              'flex items-center gap-4',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectedAddressId === 'new'
                ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                : 'border-neutral-200 bg-white hover:border-accent/50'
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
                  ? 'border-accent bg-accent'
                  : 'border-neutral-300 bg-white'
              )}
            >
              {selectedAddressId === 'new' && (
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              )}
            </div>

            {/* New address content */}
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" />
              <span className="font-medium text-neutral-900">
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
          <div className="border-t border-neutral-200" />

          {/* General error message */}
          {errors.general && (
            <div
              role="alert"
              className={cn(
                'p-4 border border-red-500/30 bg-red-500/10 rounded-lg',
                'text-red-600 text-sm text-center'
              )}
            >
              {errors.general}
            </div>
          )}

          {/* Form title */}
          <p className="text-sm font-medium text-neutral-900">
            Nouvelle adresse
          </p>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prenom"
              name="firstName"
              type="text"
              placeholder="Votre prenom"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              disabled={isLoading}
              autoComplete="given-name"
              startIcon={<User className="h-5 w-5" />}
              containerClassName="bg-white"
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
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
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
            />
          </div>

          {/* Contact field */}
          <Input
            label="Telephone"
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
            className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
          />

          {/* Address field */}
          <Input
            label="Adresse"
            name="address"
            type="text"
            placeholder="Numero et nom de rue"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            disabled={isLoading}
            autoComplete="address-line1"
            startIcon={<MapPin className="h-5 w-5" />}
            containerClassName="bg-white"
            className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
          />

          {/* Address line 2 (optional) */}
          <Input
            label="Complement d'adresse"
            name="addressLine2"
            type="text"
            placeholder="Appartement, batiment, etage... (optionnel)"
            value={formData.addressLine2}
            onChange={handleChange}
            error={errors.addressLine2}
            disabled={isLoading}
            autoComplete="address-line2"
            startIcon={<Building2 className="h-5 w-5" />}
            containerClassName="bg-white"
            className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
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
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
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
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:ring-accent/30"
            />
          </div>

          {/* Country selection */}
          <div className="relative">
            <label
              htmlFor="country"
              className={cn(
                'block mb-2',
                'font-sans text-sm font-medium tracking-wide',
                'text-neutral-900'
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
                'w-full px-4 py-3 rounded-lg',
                'bg-white text-neutral-900',
                'border border-neutral-200',
                'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
                'transition-all duration-200',
                'disabled:bg-neutral-100 disabled:cursor-not-allowed',
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
          className="w-full uppercase tracking-wider bg-accent text-white border border-accent hover:bg-accent/90 transition-all duration-200"
        >
          Continuer vers le paiement
        </Button>
      </div>

      {/* Security note */}
      <p className="text-xs text-neutral-500 text-center pt-2">
        Vos informations sont protegees et ne seront jamais partagees.
      </p>
    </form>
  );
}

export default ShippingForm;
