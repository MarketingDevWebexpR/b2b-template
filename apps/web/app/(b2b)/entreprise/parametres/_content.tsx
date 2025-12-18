'use client';


import { cn } from '@/lib/utils';
import { useCompanyFeatures } from '@/contexts/FeatureContext';
import { EmptyState } from '@/components/b2b';

/**
 * Company Settings Page
 */
export default function ParametresPage() {
  // Feature flags
  const { isEnabled: hasCompany } = useCompanyFeatures();

  // Module disabled - show message
  if (!hasCompany) {
    return (
      <EmptyState
        icon="document"
        message="Parametres entreprise desactives"
        description="Les parametres d'entreprise ne sont pas disponibles pour votre compte."
        action={{ label: 'Retour a l\'entreprise', href: '/entreprise' }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans text-heading-3 text-content-primary">
          Parametres
        </h1>
        <p className="mt-1 font-sans text-body text-content-muted">
          Configurez les preferences de votre entreprise
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-stroke-light">
        <div className="p-6 border-b border-stroke-light">
          <h2 className="font-sans text-heading-5 text-content-primary">
            Notifications
          </h2>
          <p className="mt-1 font-sans text-body-sm text-content-muted">
            Gerez les emails de notification pour votre entreprise
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Confirmations de commande
              </p>
              <p className="font-sans text-caption text-content-muted">
                Recevoir un email a chaque nouvelle commande
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Mises a jour de livraison
              </p>
              <p className="font-sans text-caption text-content-muted">
                Notifications sur le statut des livraisons
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Alertes de depenses
              </p>
              <p className="font-sans text-caption text-content-muted">
                Alerte quand un employe approche de sa limite
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Demandes dapprobation
              </p>
              <p className="font-sans text-caption text-content-muted">
                Notifications pour les nouvelles demandes dapprobation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Reponses aux devis
              </p>
              <p className="font-sans text-caption text-content-muted">
                Etre notifie quand un devis recoit une reponse
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="bg-white rounded-lg border border-stroke-light">
        <div className="p-6 border-b border-stroke-light">
          <h2 className="font-sans text-heading-5 text-content-primary">
            Regles dapprobation
          </h2>
          <p className="mt-1 font-sans text-body-sm text-content-muted">
            Definissez quand une approbation est requise
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-content-primary">
                Exiger approbation pour toutes les commandes
              </p>
              <p className="font-sans text-caption text-content-muted">
                Chaque commande doit etre approuvee par un manager
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div>
            <label className="block font-sans text-body-sm font-medium text-content-primary mb-2">
              Seuil dapprobation automatique
            </label>
            <p className="font-sans text-caption text-content-muted mb-3">
              Les commandes en dessous de ce montant ne necessitent pas dapprobation
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={500}
                className={cn(
                  'w-32 px-3 py-2',
                  'bg-white border border-stroke-light rounded-lg',
                  'font-sans text-body-sm text-content-primary',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                )}
              />
              <span className="font-sans text-body-sm text-content-muted">EUR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Settings */}
      <div className="bg-white rounded-lg border border-stroke-light">
        <div className="p-6 border-b border-stroke-light">
          <h2 className="font-sans text-heading-5 text-content-primary">
            Preferences de commande
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block font-sans text-body-sm font-medium text-content-primary mb-2">
              Reference de commande par defaut
            </label>
            <input
              type="text"
              placeholder="Ex: PO-[ANNEE]-[NUMERO]"
              defaultValue="PO-2024-"
              className={cn(
                'w-full max-w-md px-3 py-2',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'placeholder:text-content-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              )}
            />
          </div>
          <div>
            <label className="block font-sans text-body-sm font-medium text-content-primary mb-2">
              Instructions de livraison par defaut
            </label>
            <textarea
              rows={3}
              placeholder="Instructions speciales pour toutes les livraisons..."
              className={cn(
                'w-full max-w-md px-3 py-2',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'placeholder:text-content-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'resize-none'
              )}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className={cn(
            'px-6 py-2.5',
            'bg-primary text-white rounded-lg',
            'font-sans text-body-sm font-medium',
            'hover:bg-primary-600 transition-colors duration-200'
          )}
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
