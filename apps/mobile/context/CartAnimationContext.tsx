/**
 * CartAnimationContext
 * Manages the premium fly-to-cart animation state and coordinates
 * between the product page and the cart icon in the tab bar.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

// Types for position coordinates
export interface Position {
  x: number;
  y: number;
}

// Parameters for triggering the fly animation
export interface FlyToCartParams {
  productImage: string;
  startPosition: Position;
}

// Animation state for the flying thumbnail
export interface FlyingItem {
  id: string;
  productImage: string;
  startPosition: Position;
  endPosition: Position;
}

// Context type definition
interface CartAnimationContextType {
  /** Trigger the fly-to-cart animation */
  triggerFlyToCart: (params: FlyToCartParams) => void;
  /** Register the cart icon position (called from AnimatedCartIcon) */
  registerCartIconPosition: (position: Position) => void;
  /** Trigger the badge bounce animation on the cart icon */
  triggerBadgeBounce: () => void;
  /** Current cart icon position */
  cartIconPosition: Position | null;
  /** Currently flying item (null when no animation) */
  flyingItem: FlyingItem | null;
  /** Clear the flying item after animation completes */
  clearFlyingItem: () => void;
  /** Flag to trigger badge bounce */
  badgeBounceCount: number;
  /** Whether an animation is currently in progress */
  isAnimating: boolean;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

interface CartAnimationProviderProps {
  children: ReactNode;
}

export function CartAnimationProvider({ children }: CartAnimationProviderProps) {
  // Cart icon position (measured from AnimatedCartIcon)
  const [cartIconPosition, setCartIconPosition] = useState<Position | null>(null);

  // Currently flying item
  const [flyingItem, setFlyingItem] = useState<FlyingItem | null>(null);

  // Badge bounce trigger counter (increment to trigger bounce)
  const [badgeBounceCount, setBadgeBounceCount] = useState(0);

  // Animation queue for rapid-fire adds
  const animationQueue = useRef<FlyToCartParams[]>([]);
  const isProcessing = useRef(false);

  // Track animation state
  const isAnimating = flyingItem !== null;

  // Register the cart icon position
  const registerCartIconPosition = useCallback((position: Position) => {
    setCartIconPosition(position);
  }, []);

  // Trigger badge bounce
  const triggerBadgeBounce = useCallback(() => {
    setBadgeBounceCount((prev) => prev + 1);
  }, []);

  // Clear the flying item
  const clearFlyingItem = useCallback(() => {
    setFlyingItem(null);

    // Process next item in queue if any
    if (animationQueue.current.length > 0) {
      const nextItem = animationQueue.current.shift();
      if (nextItem) {
        // Small delay before starting next animation
        setTimeout(() => {
          processAnimation(nextItem);
        }, 100);
      }
    } else {
      isProcessing.current = false;
    }
  }, []);

  // Process a single animation
  const processAnimation = useCallback((params: FlyToCartParams) => {
    if (!cartIconPosition) {
      console.warn('Cart icon position not registered yet');
      isProcessing.current = false;
      return;
    }

    const newFlyingItem: FlyingItem = {
      id: `fly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productImage: params.productImage,
      startPosition: params.startPosition,
      endPosition: cartIconPosition,
    };

    setFlyingItem(newFlyingItem);
  }, [cartIconPosition]);

  // Trigger the fly-to-cart animation
  const triggerFlyToCart = useCallback((params: FlyToCartParams) => {
    if (!cartIconPosition) {
      console.warn('Cart icon position not registered yet');
      return;
    }

    // If already animating, queue this animation
    if (isProcessing.current) {
      animationQueue.current.push(params);
      return;
    }

    isProcessing.current = true;
    processAnimation(params);
  }, [cartIconPosition, processAnimation]);

  return (
    <CartAnimationContext.Provider
      value={{
        triggerFlyToCart,
        registerCartIconPosition,
        triggerBadgeBounce,
        cartIconPosition,
        flyingItem,
        clearFlyingItem,
        badgeBounceCount,
        isAnimating,
      }}
    >
      {children}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (context === undefined) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider');
  }
  return context;
}
