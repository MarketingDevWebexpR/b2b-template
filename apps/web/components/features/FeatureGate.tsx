'use client';

/**
 * FeatureGate Components
 *
 * Composants pour conditionner l'affichage de fonctionnalites
 * en fonction de la configuration des feature flags.
 *
 * @packageDocumentation
 */

import { type ReactNode, type ComponentType } from 'react';
import { useFeatures } from '@/contexts/FeatureContext';
import type { ModuleName, SubFeatureName } from '@maison/types';

// ============================================================================
// ModuleGate - Gating au niveau module
// ============================================================================

export interface ModuleGateProps {
  /** Nom du module a verifier */
  module: ModuleName;
  /** Contenu a afficher si le module est active */
  children: ReactNode;
  /** Contenu de fallback si le module est desactive */
  fallback?: ReactNode;
}

/**
 * Affiche son contenu uniquement si le module est active.
 *
 * @example
 * ```tsx
 * <ModuleGate module="quotes">
 *   <QuoteRequestButton />
 * </ModuleGate>
 *
 * <ModuleGate module="approvals" fallback={<SimpleBuyButton />}>
 *   <ApprovalWorkflowButton />
 * </ModuleGate>
 * ```
 */
export function ModuleGate({
  module,
  children,
  fallback = null,
}: ModuleGateProps) {
  const { isModuleEnabled } = useFeatures();

  if (!isModuleEnabled(module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// SubFeatureGate - Gating au niveau sous-fonctionnalite
// ============================================================================

export interface SubFeatureGateProps<M extends ModuleName> {
  /** Nom du module parent */
  module: M;
  /** Nom de la sous-fonctionnalite a verifier */
  subFeature: SubFeatureName<M>;
  /** Contenu a afficher si la sous-fonctionnalite est activee */
  children: ReactNode;
  /** Contenu de fallback si la sous-fonctionnalite est desactivee */
  fallback?: ReactNode;
}

/**
 * Affiche son contenu uniquement si la sous-fonctionnalite est activee.
 * Verifie aussi que le module parent est active.
 *
 * @example
 * ```tsx
 * <SubFeatureGate module="catalog" subFeature="quickView">
 *   <QuickViewButton product={product} />
 * </SubFeatureGate>
 *
 * <SubFeatureGate module="cart" subFeature="savedCarts" fallback={<span>-</span>}>
 *   <SaveCartButton />
 * </SubFeatureGate>
 * ```
 */
export function SubFeatureGate<M extends ModuleName>({
  module,
  subFeature,
  children,
  fallback = null,
}: SubFeatureGateProps<M>) {
  const { isSubFeatureEnabled } = useFeatures();

  if (!isSubFeatureEnabled(module, subFeature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// HOC - Higher Order Components pour le gating
// ============================================================================

/**
 * HOC pour wrapper un composant avec un ModuleGate.
 *
 * @example
 * ```tsx
 * const GatedQuoteSection = withModuleGate(QuoteSection, 'quotes');
 *
 * // Avec fallback
 * const GatedApprovalWidget = withModuleGate(
 *   ApprovalWidget,
 *   'approvals',
 *   () => <SimplePurchaseWidget />
 * );
 * ```
 */
export function withModuleGate<P extends object>(
  WrappedComponent: ComponentType<P>,
  module: ModuleName,
  FallbackComponent?: ComponentType
): ComponentType<P> {
  function GatedComponent(props: P) {
    return (
      <ModuleGate
        module={module}
        fallback={FallbackComponent ? <FallbackComponent /> : null}
      >
        <WrappedComponent {...props} />
      </ModuleGate>
    );
  }

  GatedComponent.displayName = `withModuleGate(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return GatedComponent;
}

/**
 * HOC pour wrapper un composant avec un SubFeatureGate.
 *
 * @example
 * ```tsx
 * const GatedCompareButton = withSubFeatureGate(CompareButton, 'catalog', 'comparison');
 * ```
 */
export function withSubFeatureGate<P extends object, M extends ModuleName>(
  WrappedComponent: ComponentType<P>,
  module: M,
  subFeature: SubFeatureName<M>,
  FallbackComponent?: ComponentType
): ComponentType<P> {
  function GatedComponent(props: P) {
    return (
      <SubFeatureGate
        module={module}
        subFeature={subFeature}
        fallback={FallbackComponent ? <FallbackComponent /> : null}
      >
        <WrappedComponent {...props} />
      </SubFeatureGate>
    );
  }

  GatedComponent.displayName = `withSubFeatureGate(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return GatedComponent;
}

// ============================================================================
// MultiGate - Gating avec plusieurs conditions
// ============================================================================

export interface MultiGateCondition {
  module: ModuleName;
  subFeature?: string;
}

export interface MultiGateProps {
  /** Conditions a verifier (toutes doivent etre vraies - AND logic) */
  conditions: MultiGateCondition[];
  /** Contenu a afficher si toutes les conditions sont vraies */
  children: ReactNode;
  /** Contenu de fallback si au moins une condition est fausse */
  fallback?: ReactNode;
}

/**
 * Affiche son contenu uniquement si TOUTES les conditions sont vraies (AND logic).
 *
 * @example
 * ```tsx
 * <MultiGate
 *   conditions={[
 *     { module: 'quotes' },
 *     { module: 'approvals', subFeature: 'multiLevel' }
 *   ]}
 * >
 *   <QuoteApprovalWorkflow />
 * </MultiGate>
 * ```
 */
export function MultiGate({
  conditions,
  children,
  fallback = null,
}: MultiGateProps) {
  const { isModuleEnabled, isSubFeatureEnabled } = useFeatures();

  const allConditionsMet = conditions.every((condition) => {
    if (condition.subFeature) {
      return isSubFeatureEnabled(
        condition.module,
        condition.subFeature as SubFeatureName<typeof condition.module>
      );
    }
    return isModuleEnabled(condition.module);
  });

  if (!allConditionsMet) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// AnyGate - Gating avec logique OR
// ============================================================================

export interface AnyGateProps {
  /** Conditions a verifier (au moins une doit etre vraie - OR logic) */
  conditions: MultiGateCondition[];
  /** Contenu a afficher si au moins une condition est vraie */
  children: ReactNode;
  /** Contenu de fallback si aucune condition n'est vraie */
  fallback?: ReactNode;
}

/**
 * Affiche son contenu si AU MOINS UNE condition est vraie (OR logic).
 *
 * @example
 * ```tsx
 * <AnyGate
 *   conditions={[
 *     { module: 'lists', subFeature: 'wishlist' },
 *     { module: 'lists', subFeature: 'favorites' }
 *   ]}
 * >
 *   <AddToListButton />
 * </AnyGate>
 * ```
 */
export function AnyGate({
  conditions,
  children,
  fallback = null,
}: AnyGateProps) {
  const { isModuleEnabled, isSubFeatureEnabled } = useFeatures();

  const anyConditionMet = conditions.some((condition) => {
    if (condition.subFeature) {
      return isSubFeatureEnabled(
        condition.module,
        condition.subFeature as SubFeatureName<typeof condition.module>
      );
    }
    return isModuleEnabled(condition.module);
  });

  if (!anyConditionMet) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
