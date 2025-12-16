'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// Accordion context
interface AccordionContextValue {
  expandedItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion provider');
  }
  return context;
}

// Accordion Root
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Type of accordion - single allows one item open, multiple allows many */
  type?: 'single' | 'multiple';
  /** Currently expanded items (controlled) */
  value?: string[];
  /** Default expanded items (uncontrolled) */
  defaultValue?: string[];
  /** Callback when expanded items change */
  onValueChange?: (value: string[]) => void;
  /** Whether accordion items are collapsible when type is single */
  collapsible?: boolean;
  /** Children */
  children: ReactNode;
}

const Accordion = ({
  type = 'single',
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  collapsible = true,
  children,
  className,
  ...props
}: AccordionProps) => {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const expandedItems = controlledValue !== undefined ? controlledValue : internalValue;

  const toggleItem = useCallback(
    (itemValue: string) => {
      let newValue: string[];

      if (type === 'single') {
        if (expandedItems.includes(itemValue)) {
          newValue = collapsible ? [] : expandedItems;
        } else {
          newValue = [itemValue];
        }
      } else {
        if (expandedItems.includes(itemValue)) {
          newValue = expandedItems.filter((v) => v !== itemValue);
        } else {
          newValue = [...expandedItems, itemValue];
        }
      }

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [type, expandedItems, collapsible, controlledValue, onValueChange]
  );

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
      <div
        className={cn('w-full divide-y divide-neutral-200', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// AccordionItem
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique value for the item */
  value: string;
  /** Disabled state */
  disabled?: boolean;
  /** Children */
  children: ReactNode;
}

// Item context
const AccordionItemContext = createContext<{ value: string; disabled: boolean } | null>(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within an AccordionItem');
  }
  return context;
}

const AccordionItem = ({
  value,
  disabled = false,
  children,
  className,
  ...props
}: AccordionItemProps) => {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div
        className={cn(
          'py-0',
          disabled && 'opacity-50',
          className
        )}
        data-state={disabled ? 'disabled' : undefined}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

// AccordionTrigger
export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Icon before the title */
  icon?: ReactNode;
  /** Children */
  children: ReactNode;
}

const AccordionTrigger = ({
  icon,
  children,
  className,
  ...props
}: AccordionTriggerProps) => {
  const { expandedItems, toggleItem } = useAccordionContext();
  const { value, disabled } = useAccordionItemContext();
  const isExpanded = expandedItems.includes(value);

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={`accordion-content-${value}`}
      id={`accordion-trigger-${value}`}
      disabled={disabled}
      onClick={() => toggleItem(value)}
      className={cn(
        'flex items-center justify-between w-full',
        'py-4',
        'text-sm font-medium text-left',
        'text-neutral-900',
        'hover:text-accent',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:hover:text-neutral-900',
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-3">
        {icon && <span className="w-5 h-5 text-neutral-500">{icon}</span>}
        {children}
      </span>
      <svg
        className={cn(
          'w-5 h-5 text-neutral-500',
          'transform transition-transform duration-200',
          isExpanded && 'rotate-180'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

// AccordionContent
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Force render even when collapsed */
  forceMount?: boolean;
  /** Children */
  children: ReactNode;
}

const AccordionContent = ({
  forceMount = false,
  children,
  className,
  ...props
}: AccordionContentProps) => {
  const { expandedItems } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isExpanded = expandedItems.includes(value);

  if (!isExpanded && !forceMount) {
    return null;
  }

  return (
    <div
      id={`accordion-content-${value}`}
      aria-labelledby={`accordion-trigger-${value}`}
      role="region"
      hidden={!isExpanded}
      className={cn(
        'overflow-hidden',
        isExpanded && 'animate-in slide-in-from-top-2 duration-200',
        className
      )}
      {...props}
    >
      <div className="pb-4 text-sm text-neutral-600">
        {children}
      </div>
    </div>
  );
};

// Exports
Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

/**
 * Simple FAQ Accordion preset
 */
export interface FAQItem {
  question: string;
  answer: ReactNode;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  defaultOpen?: number;
  className?: string;
}

const FAQAccordion = ({ items, defaultOpen, className }: FAQAccordionProps) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen !== undefined ? [`faq-${defaultOpen}`] : undefined}
      className={className}
    >
      {items.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

FAQAccordion.displayName = 'FAQAccordion';

export { FAQAccordion };
