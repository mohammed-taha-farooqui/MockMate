import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

/**
 * Timer.jsx
 * Reusable interview countdown/count-up timer.
 *
 * Props:
 *  - initialSeconds:  number  — start value in seconds (default 0 = count up)
 *  - countDown:       boolean — count down to 0 instead of counting up
 *  - autoStart:       boolean — start immediately on mount (default false)
 *  - onComplete:      callback called when countdown reaches 0
 *  - showIcon:        boolean (default true)
 *  - compact:         boolean — smaller inline layout
 *  - warningAt:       seconds remaining threshold to show warning colour (default 30)
 *
 * Exposes start/pause/reset through a ref via the `timerRef` prop:
 *   <Timer timerRef={myRef} />
 *   myRef.current.start()
 *   myRef.current.pause()
 *   myRef.current.reset()
 */
export default function Timer({
  initialSeconds = 0,
  countDown = false,
  autoStart = false,
  onComplete,
  showIcon = true,
  compact = false,
  warningAt = 30,
  timerRef,
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const secondsRef = useRef(initialSeconds);

  /* Keep ref in sync so interval closure has fresh value */
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  /* Ticker */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (countDown) {
            if (prev <= 1) {
              setRunning(false);
              onComplete?.();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, countDown, onComplete]);

  /* Expose imperative controls */
  useEffect(() => {
    if (timerRef) {
      timerRef.current = {
        start: () => setRunning(true),
        pause: () => setRunning(false),
        reset: () => {
          setRunning(false);
          setSeconds(initialSeconds);
        },
      };
    }
  }, [timerRef, initialSeconds]);

  /* Format mm:ss */
  const fmt = (s) => {
    const m = Math.floor(Math.abs(s) / 60)
      .toString()
      .padStart(2, "0");
    const sec = (Math.abs(s) % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isWarning = countDown && seconds <= warningAt && seconds > 0;
  const isDone = countDown && seconds === 0;

  const colour = isDone
    ? "var(--mm-danger)"
    : isWarning
    ? "var(--mm-warning)"
    : "var(--mm-text-primary)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "0.35rem" : "0.5rem",
        padding: compact ? "0.3rem 0.75rem" : "0.5rem 1rem",
        borderRadius: "0.5rem",
        background: "var(--mm-bg-card)",
        border: `1px solid ${isWarning || isDone ? "rgba(239,68,68,0.3)" : "var(--mm-border)"}`,
        color: colour,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {showIcon && <Clock size={compact ? 14 : 16} />}
      <span
        style={{
          fontSize: compact ? "0.9rem" : "1.25rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          lineHeight: 1,
        }}
      >
        {fmt(seconds)}
      </span>
      {isDone && (
        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Time&apos;s up</span>
      )}
    </div>
  );
}
