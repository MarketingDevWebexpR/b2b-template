'use client';


import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuotesFeatures } from '@/contexts/FeatureContext';
import { useB2BPermissions } from '@/contexts/B2BContext';
import { EmptyState } from '@/components/b2b';

interface QuoteItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  requestedDiscount: number;
}

/**
 * Mock product catalog for search
 */
const productCatalog = [
  { sku: 'BRA-001', name: 'Bracelet Or 18K - Maille Figaro', price: 450 },
  { sku: 'BRA-002', name: 'Bracelet Argent 925 - Maille Venitienne', price: 120 },
  { sku: 'COL-001', name: 'Collier Or 18K - Pendentif Coeur', price: 680 },
  { sku: 'COL-002', name: 'Collier Argent - Perles Eau Douce', price: 220 },
  { sku: 'BAG-001', name: 'Bague Or Blanc - Solitaire Diamant', price: 1200 },
  { sku: 'BAG-002', name: 'Bague Or Jaune - Alliance Classique', price: 350 },
  { sku: 'BOU-001', name: 'Boucles Or Rose - Creoles Petites', price: 280 },
  { sku: 'BOU-002', name: 'Boucles Argent - Puces Zirconium', price: 85 },
];

/**
 * New Quote Page
 */
export default function NouveauDevisPage() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Feature flags and permissions
  const { isEnabled: hasQuotes, hasRequestQuote } = useQuotesFeatures();
  const { canCreateQuote } = useB2BPermissions();

  // Module or feature disabled - show message
  if (!hasQuotes || !hasRequestQuote) {
    return (
      <EmptyState
        icon="document"
        message="Creation de devis desactivee"
        description="La fonctionnalite de demande de devis n'est pas disponible pour votre compte."
        action={{ label: 'Retour aux devis', href: '/devis' }}
      />
    );
  }

  // Permission check
  if (!canCreateQuote) {
    return (
      <EmptyState
        icon="document"
        message="Acces refuse"
        description="Vous n'avez pas les droits necessaires pour creer des devis."
        action={{ label: 'Retour aux devis', href: '/devis' }}
      />
    );
  }

  const filteredProducts = productCatalog.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addProduct = useCallback((product: typeof productCatalog[0]) => {
    const existingIndex = items.findIndex((item) => item.sku === product.sku);
    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          sku: product.sku,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          requestedDiscount: 0,
        },
      ]);
    }
    setSearchQuery('');
    setShowSearch(false);
  }, [items]);

  const updateItem = useCallback((id: string, updates: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice * item.requestedDiscount) / 100,
    0
  );
  const total = subtotal - totalDiscount;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/devis"
              className="text-content-muted hover:text-content-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="font-sans text-heading-3 text-content-primary">
              Nouveau devis
            </h1>
          </div>
          <p className="font-sans text-body text-content-muted">
            Selectionnez les produits et indiquez les quantites souhaitees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <div className="bg-white rounded-lg border border-stroke-light p-6">
            <h2 className="font-sans text-heading-5 text-content-primary mb-4">
              Ajouter des produits
            </h2>
            <div className="relative">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearch(searchQuery.length > 0)}
                  className={cn(
                    'w-full pl-10 pr-4 py-3',
                    'bg-white border border-stroke-light rounded-lg',
                    'font-sans text-body-sm text-content-primary',
                    'placeholder:text-content-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  )}
                />
              </div>

              {/* Search Results */}
              {showSearch && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg border border-stroke-light shadow-lg max-h-80 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.sku}
                        onClick={() => addProduct(product)}
                        className={cn(
                          'w-full px-4 py-3 text-left',
                          'hover:bg-surface-secondary transition-colors',
                          'border-b border-stroke-light last:border-b-0'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-sans text-body-sm font-medium text-content-primary">
                              {product.name}
                            </p>
                            <p className="font-mono text-caption text-content-muted">
                              {product.sku}
                            </p>
                          </div>
                          <p className="font-sans text-body-sm text-content-primary">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 font-sans text-body-sm text-content-muted">
                      Aucun produit trouve
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 ? (
            <div className="bg-white rounded-lg border border-stroke-light">
              <div className="p-4 border-b border-stroke-light">
                <h2 className="font-sans text-heading-5 text-content-primary">
                  Produits selectionnes ({items.length})
                </h2>
              </div>
              <div className="divide-y divide-border-light">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-surface-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-sans text-body-sm font-medium text-content-primary">
                              {item.name}
                            </p>
                            <p className="font-mono text-caption text-content-muted">
                              {item.sku}
                            </p>
                            <p className="mt-1 font-sans text-caption text-content-muted">
                              Prix unitaire: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.unitPrice)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className={cn(
                              'p-2 rounded-lg',
                              'text-content-muted hover:text-red-600 hover:bg-red-50',
                              'transition-colors duration-200'
                            )}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <div>
                            <label className="block font-sans text-caption text-content-muted mb-1">
                              Quantite
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center rounded-lg',
                                  'bg-surface-secondary text-content-secondary hover:bg-border-light',
                                  'transition-colors duration-200'
                                )}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                className={cn(
                                  'w-16 px-2 py-1 text-center',
                                  'bg-white border border-stroke-light rounded-lg',
                                  'font-sans text-body-sm text-content-primary',
                                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                                )}
                              />
                              <button
                                onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center rounded-lg',
                                  'bg-surface-secondary text-content-secondary hover:bg-border-light',
                                  'transition-colors duration-200'
                                )}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block font-sans text-caption text-content-muted mb-1">
                              Remise demandee (%)
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={item.requestedDiscount}
                              onChange={(e) => updateItem(item.id, { requestedDiscount: Math.min(50, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                              className={cn(
                                'w-20 px-2 py-1.5 text-center',
                                'bg-white border border-stroke-light rounded-lg',
                                'font-sans text-body-sm text-content-primary',
                                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                              )}
                            />
                          </div>
                          <div className="ml-auto text-right">
                            <p className="font-sans text-body-sm font-medium text-content-primary">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.quantity * item.unitPrice)}
                            </p>
                            {item.requestedDiscount > 0 && (
                              <p className="font-sans text-caption text-primary-600">
                                -{item.requestedDiscount}% demande
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-stroke-light p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 font-sans text-body text-content-muted">
                Aucun produit selectionne
              </p>
              <p className="mt-1 font-sans text-caption text-content-muted">
                Utilisez la recherche ci-dessus pour ajouter des produits
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg border border-stroke-light p-6">
            <h2 className="font-sans text-heading-5 text-content-primary mb-4">
              Notes et commentaires
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes ou des demandes specifiques pour ce devis..."
              rows={4}
              className={cn(
                'w-full px-3 py-2',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'placeholder:text-content-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'resize-none'
              )}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg border border-stroke-light sticky top-6">
            <div className="p-6 border-b border-stroke-light">
              <h2 className="font-sans text-heading-5 text-content-primary">
                Recapitulatif
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">Articles</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {items.length} produits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">Quantite totale</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} unites
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">Sous-total</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(subtotal)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span className="font-sans text-body-sm">Remises demandees</span>
                  <span className="font-sans text-body-sm">
                    -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalDiscount)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-stroke-light flex justify-between">
                <span className="font-sans text-body font-medium text-content-primary">Total estime</span>
                <span className="font-sans text-heading-4 text-content-primary">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                </span>
              </div>
              <p className="font-sans text-caption text-content-muted">
                * Prix final sous reserve de la reponse du fournisseur
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <button
                disabled={items.length === 0}
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'font-sans text-body-sm font-medium',
                  'bg-primary text-white hover:bg-primary-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                Soumettre le devis
              </button>
              <button
                disabled={items.length === 0}
                className={cn(
                  'w-full px-4 py-2 rounded-lg',
                  'font-sans text-body-sm font-medium',
                  'bg-white border border-stroke-light text-content-secondary',
                  'hover:bg-surface-secondary',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors duration-200'
                )}
              >
                Enregistrer comme brouillon
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <h3 className="font-sans text-body-sm font-medium text-content-primary mb-2">
              Comment ca marche ?
            </h3>
            <ol className="space-y-2 font-sans text-caption text-content-muted list-decimal list-inside">
              <li>Selectionnez les produits souhaites</li>
              <li>Indiquez les quantites et remises desirees</li>
              <li>Soumettez votre demande de devis</li>
              <li>Recevez une reponse sous 24-48h</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
