/**
 * ProgressBar.jsx
 * Displays interview progress — e.g. "Question 3 of 10".
 *
 * Props:
 *  - current:  current question / step index (1-based)
 *  - total:    total number of questions / steps
 *  - label:    optional custom label prefix (default "Question")
 *  - showFraction: boolean — show "X of Y" text (default true)
 *  - showPercent:  boolean — show percentage text (default false)
 *  - color:    accent colour override (default accent)
 *  - compact:  boolean — thinner bar with less padding
 */
export default function ProgressBar({
  current = 1,
  total = 10,
  label = "Question",
  showFraction = true,
  showPercent = false,
  compact = false,
}) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "0.375rem" : "0.625rem",
      }}
    >
      {/* Labels row */}
      {(showFraction || showPercent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {showFraction && (
            <span
              style={{
                fontSize: compact ? "0.78rem" : "0.875rem",
                color: "var(--mm-text-muted)",
                fontWeight: 500,
              }}
            >
              {label}{" "}
              <span style={{ color: "var(--mm-text-primary)", fontWeight: 700 }}>
                {current}
              </span>{" "}
              of {total}
            </span>
          )}
          {showPercent && (
            <span
              style={{
                fontSize: compact ? "0.78rem" : "0.8rem",
                color: "var(--mm-accent-glow)",
                fontWeight: 600,
              }}
            >
              {pct}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${label} ${current} of ${total}`}
        style={{
          width: "100%",
          height: compact ? 4 : 6,
          borderRadius: 999,
          background: "var(--mm-border)",
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: "linear-gradient(90deg, var(--mm-accent), var(--mm-accent-glow))",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
