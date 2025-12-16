import { useState, useEffect } from 'react';

// src/hooks/useDebounce.ts
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export { useDebounce };
//# sourceMappingURL=chunk-U7I57JNO.js.map
//# sourceMappingURL=chunk-U7I57JNO.js.map