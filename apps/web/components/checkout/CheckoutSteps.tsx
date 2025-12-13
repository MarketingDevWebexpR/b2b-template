'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Step configuration for checkout process
 */
interface Step {
  number: number;
  label: string;
  description?: string;
}

/**
 * CheckoutSteps Props
 */
interface CheckoutStepsProps {
  /** Currently active step (1-based index) */
  currentStep: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Checkout steps configuration
 * French labels with luxury aesthetic
 */
const steps: Step[] = [
  {
    number: 1,
    label: 'Livraison',
    description: 'Adresse de livraison',
  },
  {
    number: 2,
    label: 'Paiement',
    description: 'Informations de paiement',
  },
  {
    number: 3,
    label: 'Confirmation',
    description: 'Validation de commande',
  },
];

/**
 * CheckoutSteps Component
 * Elegant step indicator for the checkout process
 * Hermes-inspired luxury aesthetic with gold accents
 */
export function CheckoutSteps({ currentStep, className }: CheckoutStepsProps) {
  return (
    <nav
      aria-label="Etapes de commande"
      className={cn('w-full', className)}
    >
      <ol className="flex items-center justify-center gap-4 md:gap-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <li
              key={step.number}
              className="flex items-center gap-4 md:gap-8"
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-2">
                {/* Step circle */}
                <div
                  className={cn(
                    'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center',
                    'border-2 transition-all duration-300',
                    // Completed state
                    isCompleted && [
                      'border-hermes-500 bg-hermes-500',
                      'text-white',
                    ],
                    // Current state
                    isCurrent && [
                      'border-hermes-500 bg-transparent',
                      'text-hermes-500',
                      'ring-4 ring-hermes-500/20',
                    ],
                    // Upcoming state
                    isUpcoming && [
                      'border-border-light bg-transparent',
                      'text-text-muted',
                    ]
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check
                      className="h-5 w-5 md:h-6 md:w-6"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="font-serif text-lg md:text-xl font-medium">
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <div className="text-center">
                  <span
                    className={cn(
                      'block text-xs md:text-sm font-medium uppercase tracking-luxe',
                      'transition-colors duration-300',
                      isCompleted && 'text-hermes-500',
                      isCurrent && 'text-text-primary',
                      isUpcoming && 'text-text-muted'
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'hidden md:block text-xs',
                      'transition-colors duration-300',
                      isCompleted || isCurrent
                        ? 'text-text-secondary'
                        : 'text-text-muted'
                    )}
                  >
                    {step.description}
                  </span>
                </div>
              </div>

              {/* Connector line (not after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'hidden md:block h-px w-12 lg:w-24 transition-colors duration-300',
                    currentStep > step.number
                      ? 'bg-hermes-500'
                      : 'bg-border-light'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default CheckoutSteps;
