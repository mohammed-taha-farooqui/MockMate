import { CheckCircle, AlertCircle, Lightbulb, HelpCircle } from "lucide-react";

/**
 * FeedbackCard.jsx
 * Displays structured interview feedback generated for a candidate's response.
 *
 * Props:
 *  - strengths:             string[] — list of strengths identified in response
 *  - missingPoints:         string[] — list of key omitted points / concepts
 *  - actionableImprovement: string   — one primary, concrete suggestion for improvement
 *  - followUpQuestion:      string   — optional follow-up question for deeper assessment
 *  - questionNumber:        number   — optional question number
 *  - questionText:          string   — optional question text
 */
export default function FeedbackCard({
  strengths = [],
  missingPoints = [],
  actionableImprovement = "",
  followUpQuestion = "",
  questionNumber,
  questionText,
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
        gap: "1.5rem",
        width: "100%",
        textAlign: "left",
      }}
    >
      {/* Optional question header */}
      {(questionNumber || questionText) && (
        <div
          style={{
            borderBottom: "1px solid var(--mm-border)",
            paddingBottom: "1rem",
          }}
        >
          {questionNumber && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--mm-accent-glow)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Question {questionNumber}
            </span>
          )}
          {questionText && (
            <h4
              style={{
                fontSize: "1.0625rem",
                fontWeight: 600,
                color: "var(--mm-text-primary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {questionText}
            </h4>
          )}
        </div>
      )}

      {/* 1. Strengths section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            color: "var(--mm-success)",
          }}
        >
          <CheckCircle size={18} />
          <h5 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--mm-text-primary)", margin: 0 }}>
            Strengths
          </h5>
        </div>
        {strengths && strengths.length > 0 ? (
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {strengths.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "var(--mm-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    color: "var(--mm-success)",
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "0.875rem", color: "var(--mm-text-faint)", fontStyle: "italic", margin: 0 }}>
            No specific strengths recorded for this response.
          </p>
        )}
      </div>

      {/* 2. Missing Points section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            color: "var(--mm-warning)",
          }}
        >
          <AlertCircle size={18} />
          <h5 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--mm-text-primary)", margin: 0 }}>
            Missing Points
          </h5>
        </div>
        {missingPoints && missingPoints.length > 0 ? (
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {missingPoints.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "var(--mm-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    color: "var(--mm-warning)",
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "0.875rem", color: "var(--mm-text-faint)", fontStyle: "italic", margin: 0 }}>
            No major missing points identified.
          </p>
        )}
      </div>

      {/* 3. Actionable Improvement section */}
      {actionableImprovement && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <Lightbulb
            size={20}
            style={{ color: "var(--mm-accent-glow)", flexShrink: 0, marginTop: "0.15rem" }}
          />
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--mm-accent-glow)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Actionable Improvement
            </span>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--mm-text-primary)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {actionableImprovement}
            </p>
          </div>
        </div>
      )}

      {/* 4. Optional Follow-Up Question */}
      {followUpQuestion && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px dashed var(--mm-border)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <HelpCircle
            size={18}
            style={{ color: "var(--mm-text-muted)", flexShrink: 0, marginTop: "0.15rem" }}
          />
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--mm-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Suggested Follow-up Question
            </span>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--mm-text-muted)",
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              &ldquo;{followUpQuestion}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
