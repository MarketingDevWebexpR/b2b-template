/**
 * Feature Components - Exports
 *
 * Composants pour le systeme de feature flags modulaire.
 *
 * @packageDocumentation
 */

export {
  ModuleGate,
  SubFeatureGate,
  MultiGate,
  AnyGate,
  withModuleGate,
  withSubFeatureGate,
} from './FeatureGate';

export type {
  ModuleGateProps,
  SubFeatureGateProps,
  MultiGateProps,
  AnyGateProps,
  MultiGateCondition,
} from './FeatureGate';
