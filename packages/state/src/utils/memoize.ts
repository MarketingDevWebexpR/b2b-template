/**
 * Memoization Utilities
 *
 * Provides memoization functions for selectors to prevent unnecessary re-renders
 * by caching results and returning the same reference when inputs haven't changed.
 *
 * @packageDocumentation
 */

/**
 * Creates a memoized selector that caches its result.
 * Returns the cached result if the input state reference is unchanged.
 *
 * @param selector - The selector function to memoize
 * @returns A memoized version of the selector
 *
 * @example
 * ```ts
 * const selectFilteredItems = createSelector(
 *   (state: RootState) => state.items.filter(item => item.active)
 * );
 * ```
 */
export function createSelector<TState, TResult>(
  selector: (state: TState) => TResult
): (state: TState) => TResult {
  let lastState: TState | undefined;
  let lastResult: TResult | undefined;

  return (state: TState): TResult => {
    if (lastState === state && lastResult !== undefined) {
      return lastResult;
    }

    const result = selector(state);
    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Selector function type for derived selectors
 */
type SelectorFunction<TState, TResult> = (state: TState) => TResult;

/**
 * Creates a memoized selector that derives data from multiple input selectors.
 * Only recalculates when any of the input selectors return a new reference.
 *
 * @param dependencies - Array of input selector functions
 * @param combiner - Function that combines the results of input selectors
 * @returns A memoized derived selector
 *
 * @example
 * ```ts
 * const selectFilteredQuotes = createDerivedSelector(
 *   [selectQuotes, selectActiveStatusFilter, selectSearchQuery],
 *   (quotes, statusFilter, searchQuery) => {
 *     // Only recalculates when quotes, statusFilter, or searchQuery changes
 *     return quotes.filter(q => q.status === statusFilter);
 *   }
 * );
 * ```
 */
export function createDerivedSelector<TState, T1, TResult>(
  dependencies: [SelectorFunction<TState, T1>],
  combiner: (dep1: T1) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, T1, T2, TResult>(
  dependencies: [SelectorFunction<TState, T1>, SelectorFunction<TState, T2>],
  combiner: (dep1: T1, dep2: T2) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, T1, T2, T3, TResult>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, T1, T2, T3, T4, TResult>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, T1, T2, T3, T4, T5, TResult>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, T1, T2, T3, T4, T5, T6, TResult>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>,
    SelectorFunction<TState, T6>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5, dep6: T6) => TResult
): (state: TState) => TResult;

export function createDerivedSelector<TState, TResult>(
  dependencies: SelectorFunction<TState, unknown>[],
  combiner: (...deps: unknown[]) => TResult
): (state: TState) => TResult {
  let lastDeps: unknown[] | undefined;
  let lastResult: TResult | undefined;

  return (state: TState): TResult => {
    const deps = dependencies.map((dep) => dep(state));

    // Check if all dependencies are unchanged (strict equality)
    if (lastDeps !== undefined && deps.every((dep, i) => Object.is(dep, lastDeps![i]))) {
      return lastResult!;
    }

    const result = combiner(...deps);
    lastDeps = deps;
    lastResult = result;
    return result;
  };
}

/**
 * Performs a shallow equality check between two objects.
 * Returns true if both objects have the same keys with strictly equal values.
 *
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns True if objects are shallowly equal
 */
function shallowEqual<T extends Record<string, unknown>>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a memoized selector with shallow equality checking on the result.
 * Returns the cached result if the new result is shallowly equal to the previous one.
 * Useful for selectors that return objects with primitive values.
 *
 * @param selector - The selector function to memoize
 * @returns A memoized version with shallow equality checking
 *
 * @example
 * ```ts
 * const selectSpendingLimits = createShallowEqualSelector(
 *   (state: RootState) => ({
 *     perOrder: state.employee?.spendingLimitPerOrder ?? null,
 *     daily: state.employee?.spendingLimitDaily ?? null,
 *   })
 * );
 * ```
 */
export function createShallowEqualSelector<TState, TResult extends Record<string, unknown>>(
  selector: (state: TState) => TResult
): (state: TState) => TResult {
  let lastState: TState | undefined;
  let lastResult: TResult | undefined;

  return (state: TState): TResult => {
    if (lastState === state && lastResult !== undefined) {
      return lastResult;
    }

    const result = selector(state);

    // Check shallow equality with previous result
    if (lastResult !== undefined && shallowEqual(result, lastResult)) {
      lastState = state;
      return lastResult;
    }

    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Creates a memoized selector for parameterized access with a fixed cache size.
 * Caches results based on both state and a parameter.
 *
 * @param selector - The selector function that takes state and a parameter
 * @param cacheSize - Maximum number of cached entries (default: 10)
 * @returns A memoized version of the parameterized selector
 *
 * @example
 * ```ts
 * const selectQuotesByStatus = createParameterizedSelector(
 *   (state: RootState, status: QuoteStatus) =>
 *     state.quotes.quotes.filter(q => q.status === status)
 * );
 * ```
 */
export function createParameterizedSelector<TState, TParam, TResult>(
  selector: (state: TState, param: TParam) => TResult,
  cacheSize: number = 10
): (state: TState, param: TParam) => TResult {
  const cache = new Map<TParam, { state: TState; result: TResult }>();

  return (state: TState, param: TParam): TResult => {
    const cached = cache.get(param);

    if (cached !== undefined && cached.state === state) {
      return cached.result;
    }

    const result = selector(state, param);

    // Maintain cache size limit using LRU eviction
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(param, { state, result });
    return result;
  };
}

/**
 * Creates a derived selector with shallow equality checking on the result.
 * Combines the benefits of derived selectors with result stability.
 *
 * @param dependencies - Array of input selector functions
 * @param combiner - Function that combines the results of input selectors
 * @returns A memoized derived selector with shallow equality
 */
export function createDerivedShallowSelector<TState, T1, TResult extends Record<string, unknown>>(
  dependencies: [SelectorFunction<TState, T1>],
  combiner: (dep1: T1) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, T1, T2, TResult extends Record<string, unknown>>(
  dependencies: [SelectorFunction<TState, T1>, SelectorFunction<TState, T2>],
  combiner: (dep1: T1, dep2: T2) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, T1, T2, T3, TResult extends Record<string, unknown>>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, T1, T2, T3, T4, TResult extends Record<string, unknown>>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, T1, T2, T3, T4, T5, TResult extends Record<string, unknown>>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, T1, T2, T3, T4, T5, T6, TResult extends Record<string, unknown>>(
  dependencies: [
    SelectorFunction<TState, T1>,
    SelectorFunction<TState, T2>,
    SelectorFunction<TState, T3>,
    SelectorFunction<TState, T4>,
    SelectorFunction<TState, T5>,
    SelectorFunction<TState, T6>
  ],
  combiner: (dep1: T1, dep2: T2, dep3: T3, dep4: T4, dep5: T5, dep6: T6) => TResult
): (state: TState) => TResult;

export function createDerivedShallowSelector<TState, TResult extends Record<string, unknown>>(
  dependencies: SelectorFunction<TState, unknown>[],
  combiner: (...deps: unknown[]) => TResult
): (state: TState) => TResult {
  let lastDeps: unknown[] | undefined;
  let lastResult: TResult | undefined;

  return (state: TState): TResult => {
    const deps = dependencies.map((dep) => dep(state));

    // Check if all dependencies are unchanged
    if (lastDeps !== undefined && deps.every((dep, i) => Object.is(dep, lastDeps![i]))) {
      return lastResult!;
    }

    const result = combiner(...deps);

    // Check shallow equality with previous result
    if (lastResult !== undefined && shallowEqual(result, lastResult)) {
      lastDeps = deps;
      return lastResult;
    }

    lastDeps = deps;
    lastResult = result;
    return result;
  };
}
