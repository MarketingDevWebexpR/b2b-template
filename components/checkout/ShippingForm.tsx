'use client';

import { useState } from 'react';
import { z } from 'zod';
import { MapPin, User, Phone, Building2, Mail } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Zod schema for shipping address validation
 */
const shippingSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres'),
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .min(10, 'Veuillez entrer un numero de telephone valide')
    .regex(/^[0-9+\s-]+$/, 'Format de telephone invalide'),
  address: z
    .string()
    .min(5, 'Veuillez entrer une adresse complete'),
  addressLine2: z.string().optional(),
  city: z
    .string()
    .min(2, 'Veuillez entrer une ville valide'),
  postalCode: z
    .string()
    .min(4, 'Code postal invalide')
    .regex(/^[0-9]{4,5}$/, 'Code postal invalide'),
  country: z.string().min(2, 'Veuillez selectionner un pays'),
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
  email?: string;
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
  email: '',
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
          Vos bijoux seront livres a cette adresse de maniere securisee.
        </p>
      </div>

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

      {/* Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
          startIcon={<Mail className="h-5 w-5" />}
          containerClassName="bg-white"
          className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
        />

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
          className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
        />
      </div>

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
        className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
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

      {/* Submit button */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full uppercase tracking-wider"
        >
          Continuer vers le paiement
        </Button>
      </div>

      {/* Security note */}
      <p className="text-xs text-text-muted text-center pt-2">
        Vos informations sont protegees et ne seront jamais partagees.
      </p>
    </form>
  );
}

export default ShippingForm;
