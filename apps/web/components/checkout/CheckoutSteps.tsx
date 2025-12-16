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
 * French labels with B2B professional aesthetic
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
 * Step indicator for the B2B checkout process
 * Professional neutral aesthetic with accent highlights
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
                    'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full',
                    'border-2 transition-all duration-200',
                    // Completed state
                    isCompleted && [
                      'border-accent bg-accent',
                      'text-white',
                    ],
                    // Current state
                    isCurrent && [
                      'border-accent bg-transparent',
                      'text-accent',
                      'ring-4 ring-accent/20',
                    ],
                    // Upcoming state
                    isUpcoming && [
                      'border-neutral-200 bg-transparent',
                      'text-neutral-400',
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
                    <span className="font-sans text-lg md:text-xl font-semibold">
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <div className="text-center">
                  <span
                    className={cn(
                      'block text-xs md:text-sm font-medium uppercase tracking-wider',
                      'transition-colors duration-200',
                      isCompleted && 'text-accent',
                      isCurrent && 'text-neutral-900',
                      isUpcoming && 'text-neutral-400'
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'hidden md:block text-xs',
                      'transition-colors duration-200',
                      isCompleted || isCurrent
                        ? 'text-neutral-600'
                        : 'text-neutral-400'
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
                    'hidden md:block h-px w-12 lg:w-24 transition-colors duration-200',
                    currentStep > step.number
                      ? 'bg-accent'
                      : 'bg-neutral-200'
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
