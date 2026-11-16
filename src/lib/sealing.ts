import { useEffect, useSyncExternalStore } from "react";

let open = 0;
const listeners = new Set<() => void>();

function change(by: number) {
  open += by;
  listeners.forEach((listener) => listener());
}

export function useSealingOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    () => open > 0,
    () => false,
  );
}

export function useHoldMatchPopup(held: boolean) {
  useEffect(() => {
    if (!held) return;
    change(1);
    return () => change(-1);
  }, [held]);
}
