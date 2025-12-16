'use client';

import { cn } from '@/lib/utils';

/**
 * Company Settings Page
 */
export default function ParametresPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-heading-3 text-text-primary">
          Parametres
        </h1>
        <p className="mt-1 font-sans text-body text-text-muted">
          Configurez les preferences de votre entreprise
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-soft border border-border-light">
        <div className="p-6 border-b border-border-light">
          <h2 className="font-serif text-heading-5 text-text-primary">
            Notifications
          </h2>
          <p className="mt-1 font-sans text-body-sm text-text-muted">
            Gerez les emails de notification pour votre entreprise
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Confirmations de commande
              </p>
              <p className="font-sans text-caption text-text-muted">
                Recevoir un email a chaque nouvelle commande
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Mises a jour de livraison
              </p>
              <p className="font-sans text-caption text-text-muted">
                Notifications sur le statut des livraisons
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Alertes de depenses
              </p>
              <p className="font-sans text-caption text-text-muted">
                Alerte quand un employe approche de sa limite
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Demandes dapprobation
              </p>
              <p className="font-sans text-caption text-text-muted">
                Notifications pour les nouvelles demandes dapprobation
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Reponses aux devis
              </p>
              <p className="font-sans text-caption text-text-muted">
                Etre notifie quand un devis recoit une reponse
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="bg-white rounded-soft border border-border-light">
        <div className="p-6 border-b border-border-light">
          <h2 className="font-serif text-heading-5 text-text-primary">
            Regles dapprobation
          </h2>
          <p className="mt-1 font-sans text-body-sm text-text-muted">
            Definissez quand une approbation est requise
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-body-sm font-medium text-text-primary">
                Exiger approbation pour toutes les commandes
              </p>
              <p className="font-sans text-caption text-text-muted">
                Chaque commande doit etre approuvee par un manager
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-hermes-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-hermes-500"></div>
            </label>
          </div>
          <div>
            <label className="block font-sans text-body-sm font-medium text-text-primary mb-2">
              Seuil dapprobation automatique
            </label>
            <p className="font-sans text-caption text-text-muted mb-3">
              Les commandes en dessous de ce montant ne necessitent pas dapprobation
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={500}
                className={cn(
                  'w-32 px-3 py-2',
                  'bg-white border border-border-light rounded-soft',
                  'font-sans text-body-sm text-text-primary',
                  'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
                )}
              />
              <span className="font-sans text-body-sm text-text-muted">EUR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Settings */}
      <div className="bg-white rounded-soft border border-border-light">
        <div className="p-6 border-b border-border-light">
          <h2 className="font-serif text-heading-5 text-text-primary">
            Preferences de commande
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block font-sans text-body-sm font-medium text-text-primary mb-2">
              Reference de commande par defaut
            </label>
            <input
              type="text"
              placeholder="Ex: PO-[ANNEE]-[NUMERO]"
              defaultValue="PO-2024-"
              className={cn(
                'w-full max-w-md px-3 py-2',
                'bg-white border border-border-light rounded-soft',
                'font-sans text-body-sm text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
              )}
            />
          </div>
          <div>
            <label className="block font-sans text-body-sm font-medium text-text-primary mb-2">
              Instructions de livraison par defaut
            </label>
            <textarea
              rows={3}
              placeholder="Instructions speciales pour toutes les livraisons..."
              className={cn(
                'w-full max-w-md px-3 py-2',
                'bg-white border border-border-light rounded-soft',
                'font-sans text-body-sm text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500',
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
            'bg-hermes-500 text-white rounded-soft',
            'font-sans text-body-sm font-medium',
            'hover:bg-hermes-600 transition-colors duration-200'
          )}
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
