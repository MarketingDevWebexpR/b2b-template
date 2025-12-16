'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Zod schema for login form validation
 * Note: email field accepts any string to support mock users like "user"
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'identifiant est requis'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * LoginForm Component
 * Elegant login form with email/password authentication
 * Uses next-auth for authentication
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      loginSchema.parse(formData);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general: 'Email ou mot de passe incorrect',
        });
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setErrors({
        general: 'Une erreur est survenue. Veuillez reessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
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

      {/* Demo credentials info */}
      <div
        className={cn(
          'p-4 border border-accent/30 bg-accent/5 rounded-lg',
          'text-sm'
        )}
      >
        <p className="text-accent font-medium mb-2">Identifiants de demonstration</p>
        <p className="text-neutral-500">
          Identifiant: <span className="text-neutral-700 font-medium">user</span>
        </p>
        <p className="text-neutral-500">
          Mot de passe: <span className="text-neutral-700 font-medium">password</span>
        </p>
      </div>

      {/* Email field */}
      <Input
        label="Identifiant"
        name="email"
        type="text"
        placeholder="Votre identifiant"
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
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
          startIcon={<Lock className="h-5 w-5" />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-accent transition-colors focus:outline-none"
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
      </div>

      {/* Remember me and Forgot password row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
              disabled={isLoading}
            />
            <div
              className={cn(
                'w-5 h-5 border border-neutral-300 bg-white rounded',
                'peer-checked:bg-accent peer-checked:border-accent',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/30',
                'transition-all duration-200',
                'flex items-center justify-center'
              )}
            >
              {rememberMe && (
                <svg
                  className="w-3 h-3 text-white"
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
          <span className="text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors">
            Se souvenir de moi
          </span>
        </label>

        <Link
          href="#"
          className={cn(
            'text-sm text-accent hover:text-accent/80',
            'transition-colors duration-200'
          )}
        >
          Mot de passe oublie ?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full uppercase tracking-wider"
      >
        Se connecter
      </Button>

      {/* Register link - mobile only, hidden on desktop where it's in the page */}
      <p className="text-center text-sm text-neutral-500 md:hidden">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
