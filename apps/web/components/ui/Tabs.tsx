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

// Tab context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}

// Tabs Root
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Currently active tab value (controlled) */
  value?: string;
  /** Default active tab value (uncontrolled) */
  defaultValue?: string;
  /** Callback when tab changes */
  onValueChange?: (value: string) => void;
  /** Tabs orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Children */
  children: ReactNode;
}

const Tabs = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'horizontal',
  children,
  className,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = controlledValue !== undefined ? controlledValue : internalValue;

  const setActiveTab = useCallback(
    (newValue: string) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={cn(
          'w-full',
          orientation === 'vertical' && 'flex gap-4',
          className
        )}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList
export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const TabsList = ({ children, className, ...props }: TabsListProps) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center',
        'p-1',
        'bg-b2b-bg-tertiary',
        'rounded-lg',
        'gap-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// TabsTrigger
export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Tab value */
  value: string;
  /** Disabled state */
  disabled?: boolean;
  /** Icon before label */
  icon?: ReactNode;
  /** Children */
  children: ReactNode;
}

const TabsTrigger = ({
  value,
  disabled = false,
  icon,
  children,
  className,
  ...props
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'px-4 py-2',
        'text-b2b-body font-medium',
        'rounded-md',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2',
        isActive
          ? [
              'bg-b2b-bg-primary',
              'text-b2b-text-primary',
              'shadow-sm',
            ]
          : [
              'text-b2b-text-secondary',
              'hover:text-b2b-text-primary',
              'hover:bg-b2b-bg-secondary',
            ],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

// TabsContent
export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab value */
  value: string;
  /** Force render even when not active */
  forceMount?: boolean;
  /** Children */
  children: ReactNode;
}

const TabsContent = ({
  value,
  forceMount = false,
  children,
  className,
  ...props
}: TabsContentProps) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        'mt-4',
        'focus:outline-none',
        isActive && 'animate-in fade-in duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Exports
Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };

/**
 * Simple Pills variant for navigation-style tabs
 */
export interface PillTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon?: ReactNode;
    count?: number;
    disabled?: boolean;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PillTabs = ({ tabs, value, onChange, className }: PillTabsProps) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-2 flex-wrap',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={cn(
            'inline-flex items-center gap-2',
            'px-4 py-2',
            'text-b2b-body font-medium',
            'rounded-full',
            'border',
            'transition-all duration-200',
            value === tab.value
              ? [
                  'bg-b2b-primary',
                  'text-white',
                  'border-b2b-primary',
                ]
              : [
                  'bg-b2b-bg-primary',
                  'text-b2b-text-secondary',
                  'border-b2b-border',
                  'hover:border-b2b-primary',
                  'hover:text-b2b-primary',
                ],
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-1 px-2 py-0.5',
                'text-b2b-caption font-medium',
                'rounded-full',
                value === tab.value
                  ? 'bg-white/20'
                  : 'bg-b2b-bg-tertiary'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

PillTabs.displayName = 'PillTabs';

export { PillTabs };
