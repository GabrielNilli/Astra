import { useRef } from "react";

const LONG_PRESS_DELAY_MS = 500;
const DOUBLE_TAP_DELAY_MS = 300;

/**
 * Rileva long-press e doppio tap su touch, restituendo gli handler da
 * spread su un elemento. Non esistono eventi nativi "longpress"/"dbltap":
 * onDoubleClick di React è basato su "dblclick", che i browser mobile non
 * generano in modo affidabile da un doppio tocco — va simulato a mano,
 * insieme al long-press, sullo stesso ciclo touchstart/touchend (altrimenti
 * due hook separati si contenderebbero gli stessi eventi).
 */
export function useTapGestures({
  onLongPress,
  onDoubleTap,
}: {
  onLongPress: () => void;
  onDoubleTap: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const lastTapAtRef = useRef(0);

  function start() {
    longPressFiredRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      onLongPress();
    }, LONG_PRESS_DELAY_MS);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function end() {
    clearTimer();
    if (longPressFiredRef.current) return;

    const now = Date.now();
    if (now - lastTapAtRef.current < DOUBLE_TAP_DELAY_MS) {
      lastTapAtRef.current = 0;
      onDoubleTap();
    } else {
      lastTapAtRef.current = now;
    }
  }

  return {
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: clearTimer,
  };
}
