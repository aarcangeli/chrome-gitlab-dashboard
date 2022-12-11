import { useCallback, useRef } from "react";

export function useDebounce() {
  const timeout = useRef(undefined);

  return useCallback((fn: () => unknown, debounceTime: number) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fn();
    }, debounceTime);
  }, []);
}
