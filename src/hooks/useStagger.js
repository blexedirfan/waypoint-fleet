import { useMemo } from "react";

export function useStagger(count, baseDelay = 55, start = 0) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => start + i * baseDelay),
    [count, baseDelay, start]
  );
}
