'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Toast types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Toast variant configurations
 */
const toastVariants: Record<ToastVariant, { icon: ReactNode; className: string }> = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    className: 'bg-b2b-success text-white',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    className: 'bg-b2b-danger text-white',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    className: 'bg-b2b-warning text-white',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    className: 'bg-b2b-info text-white',
  },
};

/**
 * Position configurations
 */
const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

/**
 * Individual Toast component
 */
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const { icon, className } = toastVariants[toast.variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        'min-w-[300px] max-w-[400px]',
        'p-4',
        'rounded-lg shadow-lg',
        'animate-in slide-in-from-right fade-in duration-300',
        className
      )}
      role="alert"
    >
      {/* Icon */}
      <span className="flex-shrink-0">{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-medium text-b2b-body">{toast.title}</p>
        )}
        <p className={cn('text-b2b-body-sm', toast.title && 'mt-1 opacity-90')}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className={cn(
              'mt-2',
              'text-b2b-body-sm font-medium',
              'underline underline-offset-2',
              'hover:opacity-80',
              'transition-opacity duration-200'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className={cn(
          'flex-shrink-0',
          'p-1 -m-1',
          'opacity-70 hover:opacity-100',
          'transition-opacity duration-200',
          'focus:outline-none'
        )}
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast Provider component
 */
export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });

      // Auto remove after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, newToast.duration);
      }

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toastContainer = toasts.length > 0 && (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-2',
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      {typeof window !== 'undefined' && toastContainer &&
        createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
};

/**
 * Convenience functions for common toast types
 */
export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) => ({
    message,
    variant: 'success' as const,
    ...options,
  }),
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) => ({
    message,
    variant: 'error' as const,
    ...options,
  }),
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) => ({
    message,
    variant: 'warning' as const,
    ...options,
  }),
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) => ({
    message,
    variant: 'info' as const,
    ...options,
  }),
};

export { ToastItem };
