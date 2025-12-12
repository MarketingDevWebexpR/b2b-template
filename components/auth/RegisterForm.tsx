'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Zod schema for registration form validation
 */
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caracteres'),
    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Veuillez entrer une adresse email valide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

/**
 * RegisterForm Component
 * Elegant registration form with comprehensive validation
 * Mock registration that shows success and redirects to login
 */
export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      registerSchema.parse(formData);
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
   * Handle form submission (mock registration)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Mock API call - simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success state
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setErrors({
        general: 'Une erreur est survenue. Veuillez reessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full animate-fade-in">
        <div
          className={cn(
            'p-8 border border-gold-500/30 bg-gold-500/5',
            'text-center space-y-4'
          )}
        >
          <div className="w-16 h-16 mx-auto bg-gold-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-luxury-black" />
          </div>
          <h3 className="text-xl font-serif text-luxury-pearl">
            Compte cree avec succes !
          </h3>
          <p className="text-luxury-silver">
            Vous allez etre redirige vers la page de connexion...
          </p>
          <div className="flex justify-center pt-4">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
      {/* General error message */}
      {errors.general && (
        <div
          role="alert"
          className={cn(
            'p-4 border border-red-500/30 bg-red-500/10',
            'text-red-400 text-sm text-center',
            'animate-fade-in'
          )}
        >
          {errors.general}
        </div>
      )}

      {/* Name field */}
      <Input
        label="Nom complet"
        name="name"
        type="text"
        placeholder="Votre nom"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isLoading}
        autoComplete="name"
        startIcon={<User className="h-5 w-5" />}
      />

      {/* Email field */}
      <Input
        label="Adresse email"
        name="email"
        type="email"
        placeholder="votre@email.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
        startIcon={<Mail className="h-5 w-5" />}
      />

      {/* Password field */}
      <div className="relative">
        <Input
          label="Mot de passe"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Minimum 8 caracteres"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
          startIcon={<Lock className="h-5 w-5" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-luxury-silver hover:text-gold-500 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
        {/* Password strength indicators */}
        <div className="mt-2 space-y-1">
          <PasswordRequirement
            met={formData.password.length >= 8}
            text="Au moins 8 caracteres"
          />
          <PasswordRequirement
            met={/[A-Z]/.test(formData.password)}
            text="Une lettre majuscule"
          />
          <PasswordRequirement
            met={/[a-z]/.test(formData.password)}
            text="Une lettre minuscule"
          />
          <PasswordRequirement
            met={/\d/.test(formData.password)}
            text="Un chiffre"
          />
        </div>
      </div>

      {/* Confirm Password field */}
      <Input
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Confirmez votre mot de passe"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        disabled={isLoading}
        autoComplete="new-password"
        startIcon={<Lock className="h-5 w-5" />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-luxury-silver hover:text-gold-500 transition-colors focus:outline-none"
            aria-label={
              showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
      />

      {/* Terms checkbox */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="sr-only peer"
              disabled={isLoading}
            />
            <div
              className={cn(
                'w-5 h-5 border bg-luxury-charcoal',
                'peer-checked:bg-gold-500 peer-checked:border-gold-500',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/30',
                'transition-all duration-200',
                'flex items-center justify-center',
                errors.terms ? 'border-red-500' : 'border-luxury-gray'
              )}
            >
              {formData.terms && (
                <svg
                  className="w-3 h-3 text-luxury-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-luxury-silver group-hover:text-luxury-pearl transition-colors leading-relaxed">
            J'accepte les{' '}
            <Link href="#" className="text-gold-500 hover:text-gold-400 transition-colors">
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link href="#" className="text-gold-500 hover:text-gold-400 transition-colors">
              politique de confidentialite
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-sm text-red-400 animate-fade-in">{errors.terms}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full uppercase tracking-wider"
      >
        Creer mon compte
      </Button>

      {/* Login link - mobile only */}
      <p className="text-center text-sm text-luxury-silver md:hidden">
        Deja un compte ?{' '}
        <Link
          href="/login"
          className="text-gold-500 hover:text-gold-400 transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}

/**
 * Password requirement indicator component
 */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={cn(
          'w-3 h-3 rounded-full flex items-center justify-center transition-colors',
          met ? 'bg-green-500' : 'bg-luxury-gray'
        )}
      >
        {met && (
          <svg
            className="w-2 h-2 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={cn(met ? 'text-green-400' : 'text-luxury-silver')}>{text}</span>
    </div>
  );
}
