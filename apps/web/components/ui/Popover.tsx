'use client';

import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  /** Trigger element */
  trigger: ReactNode;
  /** Whether the popover is controlled */
  isOpen?: boolean;
  /** Callback when open state changes (controlled mode) */
  onOpenChange?: (isOpen: boolean) => void;
  /** Default open state (uncontrolled mode) */
  defaultOpen?: boolean;
  /** Popover placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment within placement */
  align?: 'start' | 'center' | 'end';
  /** Trigger behavior */
  triggerType?: 'click' | 'hover';
  /** Whether clicking outside closes the popover */
  closeOnClickOutside?: boolean;
  /** Whether pressing Escape closes the popover */
  closeOnEscape?: boolean;
  /** Show arrow */
  showArrow?: boolean;
  /** Offset from trigger (in pixels) */
  offset?: number;
  /** Children content */
  children: ReactNode;
}

/**
 * Calculate popover position based on trigger element and placement
 */
function calculatePosition(
  triggerRect: DOMRect,
  popoverRect: DOMRect,
  placement: PopoverProps['placement'],
  align: PopoverProps['align'],
  offset: number
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  // Base position based on placement
  switch (placement) {
    case 'top':
      top = triggerRect.top - popoverRect.height - offset;
      break;
    case 'bottom':
      top = triggerRect.bottom + offset;
      break;
    case 'left':
      left = triggerRect.left - popoverRect.width - offset;
      break;
    case 'right':
      left = triggerRect.right + offset;
      break;
  }

  // Alignment
  if (placement === 'top' || placement === 'bottom') {
    switch (align) {
      case 'start':
        left = triggerRect.left;
        break;
      case 'center':
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'end':
        left = triggerRect.right - popoverRect.width;
        break;
    }
  } else {
    switch (align) {
      case 'start':
        top = triggerRect.top;
        break;
      case 'center':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        break;
      case 'end':
        top = triggerRect.bottom - popoverRect.height;
        break;
    }
  }

  // Add scroll offset
  top += window.scrollY;
  left += window.scrollX;

  // Boundary corrections
  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight + window.scrollY;

  if (left < padding) left = padding;
  if (left + popoverRect.width > viewportWidth - padding) {
    left = viewportWidth - popoverRect.width - padding;
  }
  if (top < window.scrollY + padding) top = window.scrollY + padding;
  if (top + popoverRect.height > viewportHeight - padding) {
    top = viewportHeight - popoverRect.height - padding;
  }

  return { top, left };
}

/**
 * Professional B2B Popover component.
 * Used for dropdown menus, tooltips, and contextual information.
 */
const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      trigger,
      isOpen: controlledIsOpen,
      onOpenChange,
      defaultOpen = false,
      placement = 'bottom',
      align = 'center',
      triggerType = 'click',
      closeOnClickOutside = true,
      closeOnEscape = true,
      showArrow = false,
      offset = 8,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

    const setOpen = useCallback(
      (open: boolean) => {
        if (controlledIsOpen === undefined) {
          setInternalOpen(open);
        }
        onOpenChange?.(open);
      },
      [controlledIsOpen, onOpenChange]
    );

    // Update position when open
    useEffect(() => {
      if (isOpen && triggerRef.current && popoverRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        const newPosition = calculatePosition(
          triggerRect,
          popoverRect,
          placement,
          align,
          offset
        );
        setPosition(newPosition);
      }
    }, [isOpen, placement, align, offset]);

    // Handle click outside
    useEffect(() => {
      if (!isOpen || !closeOnClickOutside) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          popoverRef.current &&
          !popoverRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeOnClickOutside, setOpen]);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, setOpen]);

    // Handle trigger interactions
    const triggerProps = {
      onClick: triggerType === 'click' ? () => setOpen(!isOpen) : undefined,
      onMouseEnter: triggerType === 'hover' ? () => setOpen(true) : undefined,
      onMouseLeave: triggerType === 'hover' ? () => setOpen(false) : undefined,
    };

    const popoverContent = isOpen && (
      <div
        ref={popoverRef}
        className={cn(
          'fixed z-50',
          'bg-white',
          'border border-neutral-200',
          'rounded-lg shadow-lg',
          'animate-in fade-in zoom-in-95 duration-150',
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onMouseEnter={triggerType === 'hover' ? () => setOpen(true) : undefined}
        onMouseLeave={triggerType === 'hover' ? () => setOpen(false) : undefined}
        {...props}
      >
        {/* Arrow */}
        {showArrow && (
          <div
            className={cn(
              'absolute w-3 h-3',
              'bg-white',
              'border border-neutral-200',
              'transform rotate-45',
              placement === 'top' && 'bottom-[-7px] border-t-0 border-l-0',
              placement === 'bottom' && 'top-[-7px] border-b-0 border-r-0',
              placement === 'left' && 'right-[-7px] border-t-0 border-r-0',
              placement === 'right' && 'left-[-7px] border-b-0 border-l-0',
              align === 'start' && (placement === 'top' || placement === 'bottom') && 'left-4',
              align === 'center' && (placement === 'top' || placement === 'bottom') && 'left-1/2 -translate-x-1/2',
              align === 'end' && (placement === 'top' || placement === 'bottom') && 'right-4'
            )}
          />
        )}
        {children}
      </div>
    );

    return (
      <>
        <div
          ref={triggerRef}
          className="inline-block"
          {...triggerProps}
        >
          {trigger}
        </div>
        {typeof window !== 'undefined' && popoverContent &&
          createPortal(popoverContent, document.body)}
      </>
    );
  }
);

Popover.displayName = 'Popover';

/**
 * Dropdown Menu component built on Popover
 */
export interface DropdownMenuProps {
  /** Trigger element */
  trigger: ReactNode;
  /** Menu items */
  items: DropdownMenuItem[];
  /** Popover placement */
  placement?: PopoverProps['placement'];
  /** Alignment */
  align?: PopoverProps['align'];
}

export interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

const DropdownMenu = ({
  trigger,
  items,
  placement = 'bottom',
  align = 'start',
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement={placement}
      align={align}
      className="py-1 min-w-[180px]"
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={index}
              className="my-1 border-t border-neutral-200"
            />
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              item.onClick?.();
              setIsOpen(false);
            }}
            disabled={item.disabled}
            className={cn(
              'w-full px-4 py-2',
              'flex items-center gap-3',
              'text-sm text-left',
              'transition-colors duration-150',
              item.danger
                ? 'text-red-500 hover:bg-red-50'
                : 'text-neutral-900 hover:bg-neutral-100',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:bg-neutral-100'
            )}
          >
            {item.icon && (
              <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
            )}
            {item.label}
          </button>
        );
      })}
    </Popover>
  );
};

DropdownMenu.displayName = 'DropdownMenu';

export { Popover, DropdownMenu };
