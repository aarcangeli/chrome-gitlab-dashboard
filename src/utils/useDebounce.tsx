import { useCallback, useRef } from "react";

export function useDebounce<Args extends any[]>(fn: (...args: Args) => unknown, debounceTime: number): (...args: Args) => void {
  const timeout = useRef(undefined);
  return (...args: Args) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fn(...args);
    }, debounceTime);
  };
}

export function useDebounceFactory() {
  const timeout = useRef(undefined);

  return useCallback((fn: () => unknown, debounceTime: number) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fn();
    }, debounceTime);
  }, []);
}
