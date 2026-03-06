import { useState, useEffect, useRef } from 'react';

/**
 * A reusable countdown timer hook.
 * Usage:
 *   const { remaining, pct, display } = useCountdown(120, uiState === 'incoming');
*/
export function useCountdown(seconds, active) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  // Reset when `seconds` prop changes (new match arrives)
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [active]);

  const pct     = Math.round((remaining / seconds) * 100);
  const mm      = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss      = String(remaining % 60).padStart(2, '0');

  return { remaining, pct, display: `${mm}:${ss}` };
}