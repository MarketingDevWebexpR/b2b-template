'use client';

import { useSession } from 'next-auth/react';
import { Check, AlertCircle, Package, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockDisplayProps {
  stock: number;
  className?: string;
  showDetailedInfo?: boolean;
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  return 'in_stock';
}

/**
 * StockDisplay Component
 * Shows stock information with enhanced details for logged-in users.
 * - Anonymous users see: "En stock", "Stock limité", "Rupture de stock"
 * - Logged-in users see: exact quantity and detailed stock information
 */
export function StockDisplay({ stock, className, showDetailedInfo = true }: StockDisplayProps) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isLoggedIn = !!session;
  const stockStatus = getStockStatus(stock);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // Config for each stock status
  const config = {
    in_stock: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    low_stock: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    out_of_stock: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = config[stockStatus];

  // For logged-in users: show detailed stock information
  if (isLoggedIn && showDetailedInfo) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Main stock indicator */}
        <div className={cn('flex items-center gap-2', color)}>
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {stockStatus === 'out_of_stock'
              ? 'Rupture de stock'
              : stockStatus === 'low_stock'
              ? `Stock limité - ${stock} disponible${stock > 1 ? 's' : ''}`
              : `En stock - ${stock} disponible${stock > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Detailed stock panel for logged-in users */}
        <div
          className={cn(
            'p-4 border rounded-lg',
            bgColor,
            borderColor
          )}
        >
          <div className="flex items-start gap-3">
            <Package className={cn('w-5 h-5 mt-0.5', color)} />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary mb-1">
                Information stock détaillée
              </p>
              <div className="space-y-1 text-sm text-text-muted">
                <p>
                  <span className="font-medium">Quantité en stock:</span>{' '}
                  <span className={cn('font-semibold', color)}>{stock}</span> unité{stock > 1 ? 's' : ''}
                </p>
                {stockStatus === 'in_stock' && stock > 10 && (
                  <p className="text-green-600">
                    Disponibilité immédiate
                  </p>
                )}
                {stockStatus === 'low_stock' && (
                  <p className="text-amber-600">
                    Commandez rapidement, stock limité
                  </p>
                )}
                {stockStatus === 'out_of_stock' && (
                  <p className="text-red-600">
                    Temporairement indisponible - Contactez-nous pour plus d'informations
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For anonymous users: show simple stock status
  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex items-center gap-2', color)}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {stockStatus === 'out_of_stock'
            ? 'Rupture de stock'
            : stockStatus === 'low_stock'
            ? 'Stock limité'
            : 'En stock'}
        </span>
      </div>

      {/* Hint to log in for detailed info */}
      {!isLoggedIn && stockStatus !== 'out_of_stock' && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Lock className="w-3 h-3" />
          <span>Connectez-vous pour voir le stock exact</span>
        </div>
      )}
    </div>
  );
}

export default StockDisplay;
