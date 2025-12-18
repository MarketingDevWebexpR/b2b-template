/**
 * Type declarations to fix React 18/19 compatibility issues
 * with @medusajs/ui components
 *
 * This file resolves the "cannot be used as a JSX component" TypeScript errors
 * caused by differences between React 18 and React 19 type definitions.
 */

import type { ReactNode as React19ReactNode } from 'react';

declare global {
  namespace React {
    // Make ReactNode compatible with both React 18 and 19
    type ReactNode = React19ReactNode | bigint;
  }
}

export {};
