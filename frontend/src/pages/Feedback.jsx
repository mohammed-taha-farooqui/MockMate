import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Target,
  Lightbulb,
  MessageSquare,
  User,
  BarChart2,
  Beaker,
  CheckCircle,
} from "lucide-react";
import mockFeedback from "../data/mockFeedback";

/**
 * Feedback.jsx — Task 10: Interview Feedback + Follow-Up Page
 *
 * Displays a comprehensive post-interview feedback report:
 *   1. Header + "Interview Completed" badge
 *   2. Overall Performance section (Overall score, visual progress bar, summary)
 *   3. Strengths section (Cards/list items of candidate strengths)
 *   4. Areas for Improvement section (Actionable improvement areas)
 *   5. Question-by-Question Feedback (Collapsible cards with Question, Candidate Answer, Score, Feedback, Strengths, Improvement)
 *   6. Recommended Follow-up section (Interactive expand/collapse topics with practice guidance)
 *   7. Navigation ("View Final Report" → /final-report, "Back to Home" → /)
 *
 * Data source: mockFeedback.js (development placeholder data).
 * Safely handles missing data and gracefully merges live session answers from Interview.jsx.
 */

/* ─── Score colour helper ─────────────────────────────────────────────── */
function scoreColour(score, max = 10) {
  const ratio = score / max;
  if (ratio >= 0.8) return "var(--mm-success)";
  if (ratio >= 0.6) return "var(--mm-warning)";
  return "var(--mm-danger)";
}

function scoreLabel(score, max = 10) {
  const ratio = score / max;
  if (ratio >= 0.8) return "Strong";
  if (ratio >= 0.6) return "Good";
  return "Needs Work";
}

/* ─── Mini circular score ring ───────────────────────────────────────── */
function ScoreRing({ score, max = 10, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  const colour = scoreColour(score, max);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--mm-border)"
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colour}
        strokeWidth={5}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "center",
          fill: colour,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {score}
      </text>
    </svg>
  );
}

/* ─── Collapsible question feedback card ─────────────────────────────── */
function QuestionFeedbackItem({ item, index }) {
  const [open, setOpen] = useState(index === 0); // first card open by default
  const score = item.score ?? 0;
  const colour = scoreColour(score);

  return (
    <div
      style={{
        background: "var(--mm-bg-card)",
        border: "1px solid var(--mm-border)",
        borderRadius: "0.875rem",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "1.125rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
          {/* Score ring */}
          <ScoreRing score={score} max={10} size={52} />

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--mm-accent-glow)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Q{index + 1} {item.skill ? `· ${item.skill}` : ""}
              </span>
              {item.difficulty && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    padding: "0.1rem 0.5rem",
                    borderRadius: "999px",
                    background:
                      item.difficulty === "Hard"
                        ? "rgba(239,68,68,0.12)"
                        : item.difficulty === "Medium"
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(16,185,129,0.12)",
                    color:
                      item.difficulty === "Hard"
                        ? "var(--mm-danger)"
                        : item.difficulty === "Medium"
                        ? "var(--mm-warning)"
                        : "var(--mm-success)",
                    border: `1px solid ${
                      item.difficulty === "Hard"
                        ? "rgba(239,68,68,0.25)"
                        : item.difficulty === "Medium"
                        ? "rgba(245,158,11,0.25)"
                        : "rgba(16,185,129,0.25)"
                    }`,
                  }}
                >
                  {item.difficulty}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: colour,
                  padding: "0.1rem 0.5rem",
                  borderRadius: "999px",
                  background: `${colour}14`,
                  border: `1px solid ${colour}40`,
                }}
              >
                {scoreLabel(score)} · {score}/10
              </span>
            </div>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--mm-text-primary)",
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: open ? "normal" : "nowrap",
              }}
            >
              {item.question}
            </p>
          </div>
        </div>

        <div style={{ flexShrink: 0, color: "var(--mm-text-faint)" }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: "1px solid var(--mm-border)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Candidate's answer */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--mm-text-muted)" }}>
              <User size={15} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Candidate Answer
              </span>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--mm-border)",
                borderRadius: "0.625rem",
                padding: "0.875rem 1rem",
                fontSize: "0.875rem",
                color: "var(--mm-text-muted)",
                lineHeight: 1.65,
                fontStyle: "italic",
              }}
            >
              &ldquo;{item.candidateAnswer || "No answer recorded."}&rdquo;
            </div>
          </div>

          {/* Feedback paragraph */}
          {item.feedback && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--mm-accent-glow)" }}>
                <MessageSquare size={15} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Feedback
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--mm-text-primary)", lineHeight: 1.65, margin: 0 }}>
                {item.feedback}
              </p>
            </div>
          )}

          {/* Strengths */}
          {item.strengths && item.strengths.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--mm-success)" }}>
                <CheckCircle size={15} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Strengths
                </span>
              </div>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {item.strengths.map((s, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--mm-success)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Improvement */}
          {item.improvement && (
            <div
              style={{
                padding: "0.875rem 1.125rem",
                borderRadius: "0.625rem",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <Lightbulb size={17} style={{ color: "var(--mm-accent-glow)", flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--mm-accent-glow)", display: "block", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Improvement Suggestion
                </span>
                <p style={{ fontSize: "0.875rem", color: "var(--mm-text-primary)", lineHeight: 1.55, margin: 0 }}>
                  {item.improvement}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Follow-up topic card (expandable) ──────────────────────────────── */
function FollowUpCard({ topic }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "var(--mm-bg-card)",
        border: "1px solid var(--mm-border)",
        borderRadius: "0.875rem",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "0.5rem",
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={17} color="var(--mm-accent-glow)" />
          </div>
          <div>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mm-text-primary)", margin: 0 }}>
              {topic.topic}
            </p>
            {topic.reason && (
              <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)", margin: 0, marginTop: "0.125rem" }}>
                {topic.reason}
              </p>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0, color: "var(--mm-text-faint)" }}>
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </div>
      </button>

      {open && topic.resources && topic.resources.length > 0 && (
        <div style={{ borderTop: "1px solid var(--mm-border)", padding: "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--mm-accent-glow)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.625rem" }}>
            Suggested Practice
          </p>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {topic.resources.map((r, i) => (
              <li
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}
              >
                <span style={{ color: "var(--mm-accent-glow)", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Section heading helper ─────────────────────────────────────────── */
function SectionHeading({ icon, label, colour = "var(--mm-accent-glow)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "0.5rem",
          background: `${colour}18`,
          border: `1px solid ${colour}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colour,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{label}</h2>
    </div>
  );
}

/* ─── Overall score progress bar ─────────────────────────────────────── */
function OverallScoreBar({ score = 0 }) {
  const colour = scoreColour(score, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)", fontWeight: 500 }}>Overall Score</span>
        <span style={{ fontSize: "1.5rem", fontWeight: 800, color: colour, letterSpacing: "-0.03em" }}>
          {score}
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--mm-text-faint)" }}>/100</span>
        </span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: "var(--mm-border)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, Math.max(0, score))}%`,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${colour}, ${colour}bb)`,
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.375rem" }}>
        <span style={{ fontSize: "0.75rem", color: colour, fontWeight: 600 }}>
          {score >= 80 ? "Excellent" : score >= 65 ? "Good" : "Needs Improvement"}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN FEEDBACK PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function Feedback() {
  const location = useLocation();

  // Data source: mockFeedback as base / development placeholder.
  // Handles missing data gracefully without crashing.
  const feedbackData = mockFeedback || {};
  const isMockData = true; // Set to false once backend evaluation API is connected

  const overallScore = feedbackData.overallScore ?? 74;
  const summary =
    feedbackData.summary ||
    "You completed the interview session. Review your strengths and follow-up practice recommendations below.";
  const strengths = feedbackData.strengths || [];
  const improvementAreas = feedbackData.improvementAreas || [];
  const followUp = feedbackData.followUp || [];

  // If candidate answered during a live session, overlay their actual recorded answers
  const sessionAnswers = location?.state?.answers || {};
  const questionFeedbackList = useMemo(() => {
    const list = feedbackData.questionFeedback || [];
    return list.map((item) => {
      const liveAnswer = sessionAnswers[item.questionId];
      if (liveAnswer && liveAnswer.trim()) {
        return { ...item, candidateAnswer: liveAnswer };
      }
      return item;
    });
  }, [feedbackData, sessionAnswers]);

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem", paddingBottom: "3rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── Top navigation bar ─────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            to="/interview"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Back to Interview
          </Link>
          <span className="mm-badge mm-badge-accent">
            <CheckCircle2 size={13} style={{ marginRight: "0.25rem" }} />
            Interview Completed
          </span>
        </div>

        {/* ── Page heading ───────────────────────────────────────────── */}
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "0.625rem" }}>
            Interview Feedback
          </h1>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>
            Review your performance, understand your strengths, and get actionable steps to improve.
          </p>
        </div>

        {/* ── Dev data notice ─────────────────────────────────────────── */}
        {isMockData && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.75rem 1.125rem",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "0.625rem",
              fontSize: "0.8125rem",
              color: "#fcd34d",
            }}
          >
            <Beaker size={15} style={{ flexShrink: 0 }} />
            <span>
              <strong>Demo feedback</strong> — backend evaluation will be connected later.
              This data comes from <code>mockFeedback.js</code> and is not AI-generated.
            </span>
          </div>
        )}

        {/* ── Overall Performance ────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<Award size={18} />} label="Overall Performance" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
              alignItems: "start",
            }}
          >
            {/* Score card */}
            <div className="mm-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <OverallScoreBar score={overallScore} />
              <hr style={{ border: "none", borderTop: "1px solid var(--mm-border)", margin: 0 }} />
              <p style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.7, margin: 0 }}>
                {summary}
              </p>
            </div>

            {/* Strengths + Improvement Areas side by side */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Strengths */}
              <div className="mm-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem", color: "var(--mm-success)" }}>
                  <CheckCircle2 size={17} />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--mm-text-primary)", margin: 0 }}>Strengths</h3>
                </div>
                {strengths.length > 0 ? (
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {strengths.map((s, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}>
                        <span style={{ color: "var(--mm-success)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "0.875rem", color: "var(--mm-text-faint)", margin: 0 }}>No strengths recorded.</p>
                )}
              </div>

              {/* Improvement areas */}
              <div className="mm-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem", color: "var(--mm-warning)" }}>
                  <TrendingUp size={17} />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--mm-text-primary)", margin: 0 }}>Areas to Improve</h3>
                </div>
                {improvementAreas.length > 0 ? (
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {improvementAreas.map((a, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "var(--mm-text-muted)", lineHeight: 1.6 }}>
                        <AlertTriangle size={13} style={{ color: "var(--mm-warning)", flexShrink: 0, marginTop: "0.25rem" }} />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: "0.875rem", color: "var(--mm-text-faint)", margin: 0 }}>No improvement areas identified.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Question-by-Question Feedback ─────────────────────────── */}
        <section>
          <SectionHeading icon={<BarChart2 size={18} />} label="Question-by-Question Feedback" colour="var(--mm-accent-glow)" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {questionFeedbackList.length > 0 ? (
              questionFeedbackList.map((item, i) => (
                <QuestionFeedbackItem key={item.questionId || i} item={item} index={i} />
              ))
            ) : (
              <div className="mm-card" style={{ textAlign: "center", color: "var(--mm-text-faint)", padding: "2rem" }}>
                No question feedback available yet.
              </div>
            )}
          </div>
        </section>

        {/* ── Follow-up Recommendations ──────────────────────────────── */}
        <section>
          <SectionHeading icon={<Target size={18} />} label="Recommended Follow-up Practice" colour="#c084fc" />
          <div
            style={{
              padding: "0.875rem 1.25rem",
              background: "rgba(192,132,252,0.07)",
              border: "1px solid rgba(192,132,252,0.18)",
              borderRadius: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              color: "var(--mm-text-muted)",
              lineHeight: 1.6,
            }}
          >
            <Lightbulb size={15} style={{ color: "#c084fc", marginRight: "0.4rem", verticalAlign: "middle" }} />
            Based on your session, focus on these topics to improve your score in future interviews.
            Click each topic to expand practice suggestions.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {followUp.length > 0 ? (
              followUp.map((topic, i) => (
                <FollowUpCard key={i} topic={topic} />
              ))
            ) : (
              <div className="mm-card" style={{ textAlign: "center", color: "var(--mm-text-faint)", padding: "2rem" }}>
                No follow-up recommendations available yet.
              </div>
            )}
          </div>
        </section>

        {/* ── Navigation CTAs ────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--mm-border)",
          }}
        >
          <Link
            to="/"
            className="mm-btn mm-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link to="/final-report" className="mm-btn mm-btn-primary">
            View Final Report <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
