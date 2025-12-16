'use strict';

var react = require('react');

// src/hooks/useDebounce.ts
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = react.useState(value);
  react.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

exports.useDebounce = useDebounce;
//# sourceMappingURL=chunk-UIDLK2SK.cjs.map
//# sourceMappingURL=chunk-UIDLK2SK.cjs.map