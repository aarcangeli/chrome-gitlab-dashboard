import { useRef } from "react";

export function useConstant<T>(gen: () => T): T {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = gen();
  }
  return ref.current;
}
