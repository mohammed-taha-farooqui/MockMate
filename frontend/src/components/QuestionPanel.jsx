import { HelpCircle, Loader2 } from "lucide-react";

/**
 * QuestionPanel.jsx
 * Displays the current interview question with question number.
 *
 * Props:
 *  - question:       string — the question text
 *  - questionNumber: number (1-based)
 *  - total:          number — total questions
 *  - isLoading:      boolean — skeleton loading state
 *  - category:       optional string — e.g. "Behavioural", "Technical"
 *  - hint:           optional string — subtle hint text
 */
export default function QuestionPanel({
  question,
  questionNumber = 1,
  total,
  isLoading = false,
  category,
  hint,
}) {
  return (
    <div
      style={{
        background: "var(--mm-bg-card)",
        border: "1px solid var(--mm-border)",
        borderRadius: "1rem",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* Header row: question number + category */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--mm-accent-glow)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Q{questionNumber}
          {total ? ` / ${total}` : ""}
        </span>
        {category && (
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--mm-text-muted)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--mm-border)",
              borderRadius: "999px",
              padding: "0.2rem 0.65rem",
            }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Question body */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {[100, 90, 70].map((w) => (
            <div
              key={w}
              style={{
                height: "1rem",
                borderRadius: "0.25rem",
                background: "var(--mm-border)",
                width: `${w}%`,
                animation: "mm-shimmer 1.4s ease-in-out infinite",
              }}
            />
          ))}
          <Loader2
            size={18}
            style={{
              color: "var(--mm-text-muted)",
              animation: "mm-spin 0.8s linear infinite",
              marginTop: "0.25rem",
            }}
          />
        </div>
      ) : (
        <p
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--mm-text-primary)",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {question || "\u2014"}
        </p>
      )}

      {/* Hint */}
      {hint && !isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.5rem",
            background: "rgba(99,102,241,0.07)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <HelpCircle size={14} style={{ color: "var(--mm-accent-glow)", marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.8125rem", lineHeight: 1.55, margin: 0 }}>
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}
