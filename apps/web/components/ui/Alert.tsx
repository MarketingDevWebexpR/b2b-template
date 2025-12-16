'use client';

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Alert variant styles - B2B professional design
 */
const alertVariants = {
  // Success - order confirmed, payment successful
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-500',
    title: 'text-emerald-900',
    description: 'text-emerald-700',
  },

  // Error - payment failed, validation errors
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    title: 'text-red-900',
    description: 'text-red-700',
  },

  // Warning - low stock, address verification needed
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: 'text-amber-500',
    title: 'text-amber-900',
    description: 'text-amber-700',
  },

  // Info - shipping updates, general information
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    description: 'text-blue-700',
  },

  // Accent - special announcements, promotions
  accent: {
    container: 'bg-accent/5 border-accent/20 text-accent',
    icon: 'text-accent',
    title: 'text-accent',
    description: 'text-accent/80',
  },

  // Neutral - general notifications
  neutral: {
    container: 'bg-neutral-100 border-neutral-200 text-neutral-600',
    icon: 'text-neutral-500',
    title: 'text-neutral-900',
    description: 'text-neutral-500',
  },
};

/**
 * Default icons for each variant
 */
const defaultIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  accent: Info,
  neutral: Info,
};

/**
 * Alert size configurations
 */
const alertSizes = {
  sm: {
    container: 'p-3',
    icon: 'w-4 h-4',
    title: 'text-sm',
    description: 'text-xs',
    gap: 'gap-2.5',
  },
  md: {
    container: 'p-4',
    icon: 'w-5 h-5',
    title: 'text-base',
    description: 'text-sm',
    gap: 'gap-3',
  },
  lg: {
    container: 'p-5',
    icon: 'w-6 h-6',
    title: 'text-lg',
    description: 'text-base',
    gap: 'gap-4',
  },
};

/**
 * Animation variants for alert entrance/exit
 */
const alertAnimationVariants = {
  initial: {
    opacity: 0,
    y: -10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: keyof typeof alertVariants;
  /** Size of the alert */
  size?: keyof typeof alertSizes;
  /** Alert title */
  title?: string;
  /** Alert description/message */
  children?: ReactNode;
  /** Custom icon to display */
  icon?: ReactNode;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Whether to animate the alert */
  animate?: boolean;
  /** Whether the alert is visible (for controlled animations) */
  isVisible?: boolean;
}

/**
 * Alert component for displaying feedback messages.
 *
 * B2B professional design:
 * - Clean backgrounds
 * - Clear iconography for quick recognition
 * - Smooth entrance/exit animations
 * - Accessible with proper ARIA roles
 *
 * @example
 * // Success alert
 * <Alert variant="success" title="Commande confirmee">
 *   Votre commande #12345 a ete placee avec succes.
 * </Alert>
 *
 * // Dismissible error alert
 * <Alert variant="error" title="Erreur de paiement" dismissible onDismiss={handleDismiss}>
 *   Le paiement n'a pas pu etre traite. Veuillez reessayer.
 * </Alert>
 */
const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      size = 'md',
      title,
      children,
      icon,
      showIcon = true,
      dismissible = false,
      onDismiss,
      animate = true,
      isVisible = true,
      className,
      ...props
    },
    ref
  ) => {
    const variantStyles = alertVariants[variant];
    const sizeStyles = alertSizes[size];
    const DefaultIcon = defaultIcons[variant];

    const alertContent = (
      <div
        ref={ref}
        role="alert"
        className={cn(
          // Base styles
          'relative flex rounded-lg border',
          // Variant styles
          variantStyles.container,
          // Size styles
          sizeStyles.container,
          sizeStyles.gap,
          className
        )}
        {...props}
      >
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            {icon || (
              <DefaultIcon
                className={cn(sizeStyles.icon, variantStyles.icon)}
                strokeWidth={1.5}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4
              className={cn(
                'font-sans font-medium leading-tight',
                sizeStyles.title,
                variantStyles.title
              )}
            >
              {title}
            </h4>
          )}
          {children && (
            <div
              className={cn(
                'font-sans leading-relaxed',
                sizeStyles.description,
                variantStyles.description,
                title && 'mt-1'
              )}
            >
              {children}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 rounded-lg p-1',
              'transition-colors duration-200',
              'hover:bg-black/5',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              variant === 'success' && 'focus-visible:ring-emerald-500',
              variant === 'error' && 'focus-visible:ring-red-500',
              variant === 'warning' && 'focus-visible:ring-amber-500',
              variant === 'info' && 'focus-visible:ring-blue-500',
              variant === 'accent' && 'focus-visible:ring-accent',
              variant === 'neutral' && 'focus-visible:ring-neutral-500'
            )}
            aria-label="Fermer l'alerte"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    );

    if (animate) {
      return (
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              variants={alertAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {alertContent}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    return isVisible ? alertContent : null;
  }
);

Alert.displayName = 'Alert';

/**
 * Inline Alert - compact version for form validation, inline messages
 */
export interface InlineAlertProps {
  /** Visual style variant */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Alert message */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function InlineAlert({
  variant = 'info',
  children,
  className,
}: InlineAlertProps) {
  const variantStyles = alertVariants[variant];
  const Icon = defaultIcons[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'font-sans text-sm',
        variantStyles.description,
        className
      )}
      role="alert"
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', variantStyles.icon)} strokeWidth={1.5} />
      <span>{children}</span>
    </div>
  );
}

/**
 * Toast Alert - floating notification style
 */
export interface ToastAlertProps extends AlertProps {
  /** Position of the toast */
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
}

const toastPositions = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
};

const toastAnimationVariants = {
  'top-right': {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  'top-center': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'top-left': {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  'bottom-right': {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
  'bottom-center': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  'bottom-left': {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
};

export function ToastAlert({
  position = 'top-right',
  duration = 5000,
  isVisible = true,
  onDismiss,
  className,
  ...props
}: ToastAlertProps) {
  // Auto-dismiss effect would be handled by parent component
  // using useEffect with duration

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed z-50 max-w-sm shadow-lg',
            toastPositions[position],
            className
          )}
          variants={toastAnimationVariants[position]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Alert
            {...props}
            dismissible
            onDismiss={onDismiss}
            animate={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Alert, alertVariants, alertSizes };
