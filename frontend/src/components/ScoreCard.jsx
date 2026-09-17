import { Award, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

/**
 * ScoreCard.jsx
 * Displays the ML score returned by the backend.
 * NOTE: Never calculates or invents a score. Only accepts and displays the raw ML score prop.
 *
 * Props:
 *  - score:       number | string | null — score value returned from backend (e.g. 85, 8.5)
 *  - maxScore:    number — maximum potential score scale (default 100)
 *  - label:       string — title of score (e.g. "Overall Score", "Semantic Similarity", "Relevance")
 *  - subtitle:    string — optional secondary explanation
 *  - status:      string — optional evaluation status (e.g. "pending", "completed")
 *  - compact:     boolean — compact display mode for list items
 */
export default function ScoreCard({
  score = null,
  maxScore = 100,
  label = "Overall Score",
  subtitle,
  status = "completed",
  compact = false,
}) {
  const isPending = score === null || score === undefined || status === "pending";
  const numericScore = typeof score === "number" ? score : parseFloat(score);
  const isValidNumber = !isNaN(numericScore);

  // Determine badge styling based on score thresholds
  let scoreColor = "var(--mm-accent-glow)";
  let badgeBg = "rgba(99, 102, 241, 0.15)";
  let badgeBorder = "rgba(99, 102, 241, 0.3)";
  let StatusIcon = Award;

  if (isValidNumber) {
    const ratio = numericScore / maxScore;
    if (ratio >= 0.8) {
      scoreColor = "var(--mm-success)";
      badgeBg = "rgba(16, 185, 129, 0.15)";
      badgeBorder = "rgba(16, 185, 129, 0.3)";
      StatusIcon = CheckCircle2;
    } else if (ratio >= 0.6) {
      scoreColor = "var(--mm-warning)";
      badgeBg = "rgba(245, 158, 11, 0.15)";
      badgeBorder = "rgba(245, 158, 11, 0.3)";
      StatusIcon = TrendingUp;
    } else {
      scoreColor = "var(--mm-danger)";
      badgeBg = "rgba(239, 68, 68, 0.15)";
      badgeBorder = "rgba(239, 68, 68, 0.3)";
      StatusIcon = AlertTriangle;
    }
  }

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "0.5rem",
          background: "var(--mm-bg-card)",
          border: "1px solid var(--mm-border)",
        }}
      >
        <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", fontWeight: 500 }}>
          {label}:
        </span>
        {isPending ? (
          <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)", fontStyle: "italic" }}>
            Awaiting ML scoring
          </span>
        ) : (
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: scoreColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
            <span style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", fontWeight: 500 }}>
              /{maxScore}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--mm-bg-card)",
        border: "1px solid var(--mm-border)",
        borderRadius: "1rem",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "1rem",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Header icon / tag */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "0.75rem",
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: scoreColor,
        }}
      >
        <StatusIcon size={22} />
      </div>

      <div>
        <h4
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--mm-text-muted)",
            marginBottom: "0.25rem",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </h4>
        {subtitle && (
          <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Main score display */}
      <div style={{ margin: "0.25rem 0" }}>
        {isPending ? (
          <div
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "0.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px dashed var(--mm-border)",
              color: "var(--mm-text-faint)",
              fontSize: "0.875rem",
            }}
          >
            Pending ML Evaluation
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem" }}>
            <span
              style={{
                fontSize: "clamp(2.5rem, 5vw, 3.25rem)",
                fontWeight: 800,
                lineHeight: 1,
                color: scoreColor,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.03em",
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--mm-text-faint)",
              }}
            >
              /{maxScore}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--mm-text-faint)",
          borderTop: "1px solid var(--mm-border)",
          paddingTop: "0.75rem",
          width: "100%",
        }}
      >
        Backend ML Model Score
      </div>
    </div>
  );
}
