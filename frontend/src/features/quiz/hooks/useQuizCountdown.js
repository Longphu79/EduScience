import { useEffect } from "react";

export default function useQuizCountdown({
  enabled = false,
  timeLeft = null,
  onTick,
  onTimeUp,
}) {
  useEffect(() => {
    if (!enabled) return;
    if (timeLeft === null) return;
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      onTick?.((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [enabled, timeLeft, onTick]);

  useEffect(() => {
    if (!enabled) return;
    if (timeLeft !== 0) return;
    onTimeUp?.();
  }, [enabled, timeLeft, onTimeUp]);
}