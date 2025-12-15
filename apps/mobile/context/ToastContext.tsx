/**
 * Toast Context
 *
 * Global toast notification management for the Maison Bijoux app.
 * Provides a centralized way to show/hide toasts throughout the application.
 *
 * @module context/ToastContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface WelcomeToastData {
  userName: string;
  tagline?: string;
  autoDismissMs?: number;
}

export interface ToastContextType {
  /** Show the welcome toast for a logged-in user */
  showWelcomeToast: (data: WelcomeToastData) => void;
  /** Hide the welcome toast */
  hideWelcomeToast: () => void;
  /** Current welcome toast state */
  welcomeToast: {
    visible: boolean;
    data: WelcomeToastData | null;
  };
}

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  // Welcome toast state
  const [welcomeToastVisible, setWelcomeToastVisible] = useState(false);
  const [welcomeToastData, setWelcomeToastData] = useState<WelcomeToastData | null>(null);

  // Show welcome toast
  const showWelcomeToast = useCallback((data: WelcomeToastData) => {
    setWelcomeToastData(data);
    setWelcomeToastVisible(true);
  }, []);

  // Hide welcome toast
  const hideWelcomeToast = useCallback(() => {
    setWelcomeToastVisible(false);
    // Clear data after animation completes
    setTimeout(() => {
      setWelcomeToastData(null);
    }, 400);
  }, []);

  // Context value
  const value: ToastContextType = {
    showWelcomeToast,
    hideWelcomeToast,
    welcomeToast: {
      visible: welcomeToastVisible,
      data: welcomeToastData,
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access toast functionality
 *
 * @example
 * ```typescript
 * const { showWelcomeToast } = useToast();
 *
 * // After successful login
 * showWelcomeToast({
 *   userName: 'Marie Dupont',
 *   tagline: 'Votre experience joailliere vous attend',
 * });
 * ```
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default ToastProvider;
