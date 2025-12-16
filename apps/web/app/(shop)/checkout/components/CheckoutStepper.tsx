'use client';

import { cn } from '@/lib/utils';
import { Check, ShoppingCart, Truck, CreditCard, CheckCircle } from 'lucide-react';

/**
 * Checkout step configuration
 */
export interface CheckoutStepConfig {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
}

/**
 * Default B2B checkout steps
 */
export const checkoutSteps: CheckoutStepConfig[] = [
  {
    id: 'panier',
    label: 'Panier',
    description: 'Votre selection',
    icon: <ShoppingCart className="h-5 w-5" />,
    href: '/panier',
  },
  {
    id: 'livraison',
    label: 'Livraison',
    description: 'Adresse et mode',
    icon: <Truck className="h-5 w-5" />,
    href: '/checkout/livraison',
  },
  {
    id: 'paiement',
    label: 'Paiement',
    description: 'Mode de paiement',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/checkout/paiement',
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
    description: 'Commande validee',
    icon: <CheckCircle className="h-5 w-5" />,
  },
];

/**
 * CheckoutStepper Props
 */
export interface CheckoutStepperProps {
  /** Current step ID (panier, livraison, paiement, confirmation) */
  currentStep: string;
  /** Optional custom steps configuration */
  steps?: CheckoutStepConfig[];
  /** Whether to show step descriptions */
  showDescriptions?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CheckoutStepper Component
 *
 * B2B-styled multi-step indicator for checkout process.
 * Uses b2b-primary and b2b-accent colors for professional appearance.
 *
 * @example
 * <CheckoutStepper currentStep="livraison" />
 */
export function CheckoutStepper({
  currentStep,
  steps = checkoutSteps,
  showDescriptions = true,
  className,
}: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav
      aria-label="Etapes de commande"
      className={cn('w-full', className)}
    >
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li
              key={step.id}
              className={cn(
                'flex-1 relative',
                index !== steps.length - 1 && 'pr-4 md:pr-8'
              )}
            >
              {/* Step content */}
              <div className="flex flex-col items-center text-center">
                {/* Step circle */}
                <div
                  className={cn(
                    'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center',
                    'rounded-full border-2 transition-all duration-300',
                    // Completed state
                    isCompleted && [
                      'border-accent bg-accent',
                      'text-white',
                    ],
                    // Current state
                    isCurrent && [
                      'border-orange-500 bg-orange-500',
                      'text-white',
                      'ring-4 ring-orange-500/20',
                    ],
                    // Upcoming state
                    isUpcoming && [
                      'border-neutral-200 bg-neutral-50',
                      'text-neutral-500',
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
                    <span aria-hidden="true">
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3">
                  <span
                    className={cn(
                      'block text-xs md:text-sm font-semibold',
                      'transition-colors duration-300',
                      isCompleted && 'text-accent',
                      isCurrent && 'text-orange-500',
                      isUpcoming && 'text-neutral-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {showDescriptions && step.description && (
                    <span
                      className={cn(
                        'hidden md:block text-xs mt-0.5',
                        'transition-colors duration-300',
                        isCompleted || isCurrent
                          ? 'text-neutral-600'
                          : 'text-neutral-500'
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 md:top-6 left-1/2 w-full h-0.5',
                    'transition-colors duration-300',
                    isCompleted ? 'bg-accent' : 'bg-neutral-200'
                  )}
                  style={{ transform: 'translateX(50%)' }}
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

/**
 * Compact variant of CheckoutStepper for mobile
 */
export function CheckoutStepperCompact({
  currentStep,
  steps = checkoutSteps,
  className,
}: Omit<CheckoutStepperProps, 'showDescriptions'>) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const currentStepConfig = steps[currentIndex];

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Progress bar */}
      <div className="flex-1 mr-4">
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500">Etape</span>
        <span className="font-semibold text-orange-500">
          {currentIndex + 1}/{steps.length}
        </span>
        {currentStepConfig && (
          <span className="text-neutral-600">
            - {currentStepConfig.label}
          </span>
        )}
      </div>
    </div>
  );
}

export default CheckoutStepper;
