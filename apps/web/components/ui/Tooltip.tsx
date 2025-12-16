'use client';

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Tooltip content */
  tooltipContent: ReactNode;
  /** Trigger element */
  children: ReactNode;
  /** Tooltip placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Maximum width */
  maxWidth?: number;
}

/**
 * Calculate tooltip position based on trigger element and placement
 */
function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  placement: TooltipProps['placement'],
  offset: number = 8
): { top: number; left: number; actualPlacement: TooltipProps['placement'] } {
  let top = 0;
  let left = 0;
  let actualPlacement = placement;

  // Calculate position based on placement
  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + offset;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - offset;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + offset;
      break;
  }

  // Add scroll offset
  top += window.scrollY;
  left += window.scrollX;

  // Boundary corrections - flip if necessary
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;

  // Flip vertically if needed
  if (placement === 'top' && top < window.scrollY + padding) {
    top = triggerRect.bottom + window.scrollY + offset;
    actualPlacement = 'bottom';
  } else if (placement === 'bottom' && top + tooltipRect.height > window.scrollY + viewportHeight - padding) {
    top = triggerRect.top + window.scrollY - tooltipRect.height - offset;
    actualPlacement = 'top';
  }

  // Flip horizontally if needed
  if (placement === 'left' && left < window.scrollX + padding) {
    left = triggerRect.right + window.scrollX + offset;
    actualPlacement = 'right';
  } else if (placement === 'right' && left + tooltipRect.width > window.scrollX + viewportWidth - padding) {
    left = triggerRect.left + window.scrollX - tooltipRect.width - offset;
    actualPlacement = 'left';
  }

  // Keep within horizontal bounds
  if (left < padding) left = padding;
  if (left + tooltipRect.width > viewportWidth - padding) {
    left = viewportWidth - tooltipRect.width - padding;
  }

  return { top, left, actualPlacement };
}

/**
 * Professional B2B Tooltip component.
 * Used for contextual help, abbreviations, and additional information.
 */
const Tooltip = ({
  tooltipContent,
  children,
  placement = 'top',
  showDelay = 200,
  hideDelay = 0,
  disabled = false,
  maxWidth = 250,
  className,
  ...props
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipProps['placement']>(placement);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // Update position when visible
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const { top, left, actualPlacement: newPlacement } = calculatePosition(
        triggerRect,
        tooltipRect,
        placement
      );
      setPosition({ top, left });
      setActualPlacement(newPlacement);
    }
  }, [isVisible, placement]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Arrow position based on placement
  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l',
  };

  const tooltipElement = isVisible && (
    <div
      ref={tooltipRef}
      role="tooltip"
      className={cn(
        'fixed z-50',
        'px-3 py-2',
        'bg-neutral-900 text-white',
        'text-sm',
        'rounded-md shadow-lg',
        'animate-in fade-in zoom-in-95 duration-150',
        'pointer-events-none',
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: `${maxWidth}px`,
      }}
      {...props}
    >
      {tooltipContent}
      {/* Arrow */}
      <div
        className={cn(
          'absolute w-2 h-2',
          'bg-neutral-900',
          'transform rotate-45',
          arrowClasses[actualPlacement || 'top']
        )}
      />
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof window !== 'undefined' && tooltipElement &&
        createPortal(tooltipElement, document.body)}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

/**
 * Info Tooltip - Tooltip with an info icon trigger
 */
export interface InfoTooltipProps extends Omit<TooltipProps, 'children'> {
  /** Size of the info icon */
  size?: 'sm' | 'md' | 'lg';
}

const infoIconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const InfoTooltip = ({
  tooltipContent,
  size = 'md',
  ...props
}: InfoTooltipProps) => {
  return (
    <Tooltip tooltipContent={tooltipContent} {...props}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center',
          'text-neutral-500 hover:text-accent',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2',
          'rounded-full'
        )}
        aria-label="Plus d'informations"
      >
        <svg
          className={infoIconSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </Tooltip>
  );
};

InfoTooltip.displayName = 'InfoTooltip';

export { Tooltip, InfoTooltip };
