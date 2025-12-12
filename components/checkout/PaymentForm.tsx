'use client';

import { useState } from 'react';
import { z } from 'zod';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Zod schema for payment form validation
 * Note: This is a mock payment form - no real payment processing
 */
const paymentSchema = z.object({
  cardName: z
    .string()
    .min(2, 'Veuillez entrer le nom du titulaire'),
  cardNumber: z
    .string()
    .min(16, 'Numero de carte invalide')
    .max(19, 'Numero de carte invalide')
    .regex(/^[0-9\s]+$/, 'Numero de carte invalide'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Format invalide (MM/AA)'),
  cvv: z
    .string()
    .length(3, 'CVV invalide')
    .regex(/^[0-9]+$/, 'CVV invalide'),
});

/**
 * Payment form data type
 */
export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * Form validation errors type
 */
interface FormErrors {
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  general?: string;
}

/**
 * PaymentForm Props
 */
interface PaymentFormProps {
  /** Callback when form is successfully submitted */
  onSubmit: (data: PaymentFormData) => void;
  /** Callback to go back to previous step */
  onBack: () => void;
  /** Whether form submission is in progress */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Initial empty form state
 */
const initialFormState: PaymentFormData = {
  cardName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
};

/**
 * Format card number with spaces every 4 digits
 */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ').slice(0, 19) : '';
}

/**
 * Format expiry date as MM/YY
 */
function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

/**
 * PaymentForm Component
 * Mock payment form for UI demonstration only
 * Hermes-inspired luxury styling with gold accents
 */
export function PaymentForm({
  onSubmit,
  onBack,
  isLoading = false,
  className,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Handle input change with formatting
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

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
      paymentSchema.parse(formData);
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
          Informations de paiement
        </h2>
        <p className="text-sm text-text-muted">
          Vos donnees de paiement sont securisees et chiffrees.
        </p>
      </div>

      {/* Demo notice */}
      <div
        className={cn(
          'p-4 border border-hermes-500/30 bg-hermes-500/5',
          'text-sm'
        )}
      >
        <p className="text-hermes-700 font-medium mb-1">
          Mode demonstration
        </p>
        <p className="text-text-muted">
          Ceci est un formulaire de demonstration. Aucun paiement reel ne sera effectue.
          Vous pouvez utiliser n'importe quelle information.
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

      {/* Card holder name */}
      <Input
        label="Titulaire de la carte"
        name="cardName"
        type="text"
        placeholder="Nom sur la carte"
        value={formData.cardName}
        onChange={handleChange}
        error={errors.cardName}
        disabled={isLoading}
        autoComplete="cc-name"
        startIcon={<User className="h-5 w-5" />}
        containerClassName="bg-white"
        className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
      />

      {/* Card number */}
      <Input
        label="Numero de carte"
        name="cardNumber"
        type="text"
        placeholder="1234 5678 9012 3456"
        value={formData.cardNumber}
        onChange={handleChange}
        error={errors.cardNumber}
        disabled={isLoading}
        autoComplete="cc-number"
        inputMode="numeric"
        startIcon={<CreditCard className="h-5 w-5" />}
        containerClassName="bg-white"
        className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
      />

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date d'expiration"
          name="expiryDate"
          type="text"
          placeholder="MM/AA"
          value={formData.expiryDate}
          onChange={handleChange}
          error={errors.expiryDate}
          disabled={isLoading}
          autoComplete="cc-exp"
          inputMode="numeric"
          startIcon={<Calendar className="h-5 w-5" />}
          containerClassName="bg-white"
          className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
        />

        <Input
          label="CVV"
          name="cvv"
          type="text"
          placeholder="123"
          value={formData.cvv}
          onChange={handleChange}
          error={errors.cvv}
          disabled={isLoading}
          autoComplete="cc-csc"
          inputMode="numeric"
          startIcon={<Lock className="h-5 w-5" />}
          containerClassName="bg-white"
          className="bg-white border-border-light text-text-primary placeholder:text-text-muted focus:border-hermes-500 focus:ring-hermes-500/30"
        />
      </div>

      {/* Accepted cards */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-border-light">
        <span className="text-xs text-text-muted uppercase tracking-wide">
          Cartes acceptees
        </span>
        <div className="flex items-center gap-3">
          {/* Visa */}
          <div className="w-10 h-6 bg-background-beige border border-border-light flex items-center justify-center">
            <span className="text-xs font-bold text-blue-700">VISA</span>
          </div>
          {/* Mastercard */}
          <div className="w-10 h-6 bg-background-beige border border-border-light flex items-center justify-center">
            <span className="text-xs font-bold text-red-600">MC</span>
          </div>
          {/* Amex */}
          <div className="w-10 h-6 bg-background-beige border border-border-light flex items-center justify-center">
            <span className="text-xs font-bold text-blue-500">AMEX</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 uppercase tracking-wider"
        >
          Retour
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="flex-1 uppercase tracking-wider"
        >
          Confirmer la commande
        </Button>
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-2">
        <Lock className="h-4 w-4" />
        <span>Paiement securise par chiffrement SSL</span>
      </div>
    </form>
  );
}

export default PaymentForm;
