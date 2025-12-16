/**
 * Feature Config Loader
 *
 * Charge la configuration des features depuis differentes sources:
 * - local: Configuration par defaut (developpement)
 * - env: Variables d'environnement
 * - medusa: Back-office Medusa (futur)
 *
 * @packageDocumentation
 */

import type {
  FeaturesConfig,
  FeaturesSource,
  FeaturesLoaderOptions,
  FeaturesLoaderResponse,
  PartialFeaturesConfig,
} from '@maison/types';
import { deepMerge } from '@/lib/utils';
import { defaultFeaturesConfig } from './default';

/**
 * Charge la configuration des features depuis les variables d'environnement
 */
function loadFromEnv(): PartialFeaturesConfig {
  const overrides: PartialFeaturesConfig = {};

  // Module-level overrides via NEXT_PUBLIC_FEATURE_<MODULE>=true/false
  const moduleNames = [
    'catalog',
    'cart',
    'checkout',
    'orders',
    'quotes',
    'approvals',
    'company',
    'lists',
    'comparison',
    'dashboard',
    'quickOrder',
    'warehouse',
  ] as const;

  for (const module of moduleNames) {
    const envKey = `NEXT_PUBLIC_FEATURE_${module.toUpperCase()}`;
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      const enabled = envValue === 'true' || envValue === '1';
      overrides[module] = { enabled };
    }
  }

  return overrides;
}

/**
 * Charge la configuration depuis le back-office Medusa
 * (Implementation future)
 */
async function loadFromMedusa(clientId?: string): Promise<PartialFeaturesConfig> {
  // TODO: Implementer l'appel API vers Medusa
  // Pour l'instant, retourne une config vide (pas d'overrides)
  console.log('[Features] Medusa loader not implemented yet, clientId:', clientId);
  return {};
}

/**
 * Charge la configuration des features selon la source specifiee.
 *
 * @param options - Options du loader
 * @returns Configuration des features
 *
 * @example
 * ```ts
 * // Charger depuis local (defaut)
 * const { config } = await loadFeaturesConfig({ source: 'local' });
 *
 * // Charger avec overrides depuis env
 * const { config } = await loadFeaturesConfig({ source: 'env' });
 *
 * // Charger depuis Medusa (futur)
 * const { config } = await loadFeaturesConfig({ source: 'medusa', clientId: 'client-123' });
 * ```
 */
export async function loadFeaturesConfig(
  options: Partial<FeaturesLoaderOptions> = {}
): Promise<FeaturesLoaderResponse> {
  const {
    source = (process.env.NEXT_PUBLIC_FEATURES_SOURCE as FeaturesSource) || 'local',
    clientId,
    fallbackToDefault = true,
  } = options;

  let overrides: PartialFeaturesConfig = {};

  try {
    switch (source) {
      case 'env':
        overrides = loadFromEnv();
        break;

      case 'medusa':
        overrides = await loadFromMedusa(clientId);
        break;

      case 'local':
      default:
        // Pas d'overrides, utilise la config par defaut
        break;
    }
  } catch (error) {
    console.error('[Features] Error loading config from source:', source, error);
    if (!fallbackToDefault) {
      throw error;
    }
  }

  // Merge les overrides avec la config par defaut
  const config = deepMerge(
    defaultFeaturesConfig as unknown as Record<string, unknown>,
    overrides as unknown as Record<string, unknown>
  ) as unknown as FeaturesConfig;

  return {
    config,
    source,
    loadedAt: new Date().toISOString(),
    clientId,
  };
}

/**
 * Charge la configuration de maniere synchrone (pour SSR/SSG)
 * Utilise uniquement les sources synchrones (local, env)
 */
export function loadFeaturesConfigSync(
  options: Partial<Omit<FeaturesLoaderOptions, 'source'>> & { source?: 'local' | 'env' } = {}
): FeaturesConfig {
  const { source = 'local' } = options;

  let overrides: PartialFeaturesConfig = {};

  if (source === 'env') {
    overrides = loadFromEnv();
  }

  return deepMerge(
    defaultFeaturesConfig as unknown as Record<string, unknown>,
    overrides as unknown as Record<string, unknown>
  ) as unknown as FeaturesConfig;
}

/**
 * Verifie si le mode mock est active
 */
export function isMockDataEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_DATA === 'true';
}
