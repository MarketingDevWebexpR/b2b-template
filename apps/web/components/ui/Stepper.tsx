'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Individual step in the checkout process
 */
export interface Step {
  /** Unique identifier for the step */
  id: string;
  /** Display label for the step */
  label: string;
  /** Optional description below the label */
  description?: string;
  /** Optional icon to display (defaults to step number) */
  icon?: ReactNode;
}

export interface StepperProps {
  /** Array of steps to display */
  steps: Step[];
  /** Current active step (0-indexed) */
  currentStep: number;
  /** Callback when a completed step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Orientation of the stepper */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size configurations for the stepper
 */
const stepperSizes = {
  sm: {
    indicator: 'w-8 h-8',
    iconSize: 'w-3.5 h-3.5',
    fontSize: 'text-xs',
    labelSize: 'text-xs',
    descriptionSize: 'text-[10px]',
    lineThickness: 'h-px',
    verticalLineThickness: 'w-px',
    gap: 'gap-3',
  },
  md: {
    indicator: 'w-10 h-10',
    iconSize: 'w-4 h-4',
    fontSize: 'text-sm',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    lineThickness: 'h-px',
    verticalLineThickness: 'w-px',
    gap: 'gap-4',
  },
  lg: {
    indicator: 'w-12 h-12',
    iconSize: 'w-5 h-5',
    fontSize: 'text-base',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    lineThickness: 'h-0.5',
    verticalLineThickness: 'w-0.5',
    gap: 'gap-5',
  },
};

/**
 * Animation variants for the step indicator
 */
const indicatorVariants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgb(255, 255, 255)',
    borderColor: 'rgb(226, 216, 206)',
  },
  active: {
    scale: 1,
    backgroundColor: 'rgb(246, 120, 40)',
    borderColor: 'rgb(246, 120, 40)',
  },
  completed: {
    scale: 1,
    backgroundColor: 'rgb(246, 120, 40)',
    borderColor: 'rgb(246, 120, 40)',
  },
};

const checkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

const lineVariants = {
  inactive: { scaleX: 0, backgroundColor: 'rgb(226, 216, 206)' },
  active: {
    scaleX: 1,
    backgroundColor: 'rgb(246, 120, 40)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const verticalLineVariants = {
  inactive: { scaleY: 0, backgroundColor: 'rgb(226, 216, 206)' },
  active: {
    scaleY: 1,
    backgroundColor: 'rgb(246, 120, 40)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * Stepper component for multi-step checkout flow.
 *
 * B2B professional design:
 * - Clean, minimal indicators with accent color
 * - Smooth animations for state transitions
 * - Clear visual hierarchy showing progress
 * - Accessible with proper ARIA attributes
 *
 * @example
 * const steps = [
 *   { id: 'cart', label: 'Panier' },
 *   { id: 'shipping', label: 'Livraison' },
 *   { id: 'payment', label: 'Paiement' },
 *   { id: 'confirmation', label: 'Confirmation' },
 * ];
 *
 * <Stepper steps={steps} currentStep={1} />
 */
export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  size = 'md',
  className,
}: StepperProps) {
  const sizeConfig = stepperSizes[size];
  const isHorizontal = orientation === 'horizontal';

  const getStepStatus = (index: number): 'completed' | 'active' | 'inactive' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'inactive';
  };

  const handleStepClick = (index: number) => {
    // Only allow clicking on completed steps
    if (index < currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <nav
      aria-label="Etapes de la commande"
      className={cn(
        'w-full',
        isHorizontal ? 'overflow-x-auto' : '',
        className
      )}
    >
      <ol
        className={cn(
          'flex',
          isHorizontal
            ? 'flex-row items-start justify-between'
            : 'flex-col',
          sizeConfig.gap
        )}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = status === 'completed' && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex',
                isHorizontal
                  ? 'flex-1 flex-col items-center'
                  : 'flex-row items-start gap-4'
              )}
            >
              {/* Step Content */}
              <div
                className={cn(
                  'flex',
                  isHorizontal
                    ? 'flex-col items-center'
                    : 'flex-row items-start gap-4'
                )}
              >
                {/* Step Indicator */}
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'relative z-10 flex items-center justify-center rounded-full border-2',
                    'transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    sizeConfig.indicator,
                    isClickable && 'cursor-pointer hover:scale-105',
                    !isClickable && status !== 'active' && 'cursor-default',
                    status === 'active' && 'cursor-default',
                    // Status-based colors
                    status === 'inactive' && 'border-neutral-200 bg-white',
                    status === 'active' && 'border-accent bg-accent',
                    status === 'completed' && 'border-accent bg-accent'
                  )}
                  aria-label={`${step.label}${status === 'completed' ? ' (termine)' : status === 'active' ? ' (en cours)' : ''}`}
                  aria-current={status === 'active' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <motion.span
                      variants={checkVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Check
                        className={cn(sizeConfig.iconSize, 'text-white')}
                        strokeWidth={2.5}
                      />
                    </motion.span>
                  ) : (
                    <span
                      className={cn(
                        'font-sans font-medium',
                        sizeConfig.fontSize,
                        status === 'active' ? 'text-white' : 'text-neutral-500'
                      )}
                    >
                      {step.icon || index + 1}
                    </span>
                  )}
                </button>

                {/* Label and Description */}
                <div
                  className={cn(
                    isHorizontal ? 'mt-3 text-center' : 'pt-0.5'
                  )}
                >
                  <span
                    className={cn(
                      'block font-sans font-medium',
                      sizeConfig.labelSize,
                      status === 'active'
                        ? 'text-neutral-900'
                        : status === 'completed'
                        ? 'text-neutral-600'
                        : 'text-neutral-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        'mt-0.5 block font-sans',
                        sizeConfig.descriptionSize,
                        'text-neutral-400'
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute',
                    isHorizontal
                      ? cn(
                          'top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)]',
                          sizeConfig.lineThickness
                        )
                      : cn(
                          'left-5 top-12 bottom-0 -translate-x-1/2',
                          sizeConfig.verticalLineThickness,
                          'h-8'
                        )
                  )}
                >
                  {/* Background line */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-neutral-200',
                      isHorizontal ? '' : ''
                    )}
                  />
                  {/* Progress line */}
                  <motion.div
                    className={cn(
                      'absolute inset-0 bg-accent',
                      isHorizontal ? 'origin-left' : 'origin-top'
                    )}
                    initial={false}
                    animate={
                      index < currentStep
                        ? isHorizontal
                          ? { scaleX: 1 }
                          : { scaleY: 1 }
                        : isHorizontal
                        ? { scaleX: 0 }
                        : { scaleY: 0 }
                    }
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Compact stepper for mobile or constrained spaces
 * Shows only current step with progress indicators
 */
export interface CompactStepperProps {
  /** Array of steps */
  steps: Step[];
  /** Current step index */
  currentStep: number;
  /** Additional CSS classes */
  className?: string;
}

export function CompactStepper({
  steps,
  currentStep,
  className,
}: CompactStepperProps) {
  const currentStepData = steps[currentStep];

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Step indicator dots */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={cn(
              'rounded-full',
              index === currentStep
                ? 'h-2.5 w-2.5 bg-accent'
                : index < currentStep
                ? 'h-2 w-2 bg-accent/50'
                : 'h-2 w-2 bg-neutral-200'
            )}
            initial={false}
            animate={{
              scale: index === currentStep ? 1 : 0.85,
            }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Current step label */}
      <div className="text-center">
        <span className="font-sans text-xs uppercase tracking-wide text-neutral-500">
          Etape {currentStep + 1} sur {steps.length}
        </span>
        <h2 className="mt-1 font-sans font-semibold text-lg text-neutral-900">
          {currentStepData?.label}
        </h2>
      </div>
    </div>
  );
}

export default Stepper;
