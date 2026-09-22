import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Lightbulb,
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react";
import mockProgress from "../data/mockProgress";
import mockFeedback from "../data/mockFeedback";

/* ─── Color Themes & Helpers ──────────────────────────────────────────── */
const TIER_COLORS = {
  strong: {
    hex: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.35)",
    glow: "rgba(16, 185, 129, 0.4)",
    gradient: "linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.25) 100%)",
  },
  good: {
    hex: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.35)",
    glow: "rgba(245, 158, 11, 0.4)",
    gradient: "linear-gradient(180deg, #f59e0b 0%, rgba(245, 158, 11, 0.25) 100%)",
  },
  needsWork: {
    hex: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.35)",
    glow: "rgba(239, 68, 68, 0.4)",
    gradient: "linear-gradient(180deg, #ef4444 0%, rgba(239, 68, 68, 0.25) 100%)",
  },
  neutral: {
    hex: "#64748b",
    bg: "rgba(100, 116, 139, 0.12)",
    border: "rgba(100, 116, 139, 0.25)",
    glow: "rgba(100, 116, 139, 0.2)",
    gradient: "linear-gradient(180deg, #64748b 0%, rgba(100, 116, 139, 0.25) 100%)",
  },
};

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

function getScoreTier(score, max = 100) {
  if (score === null || score === undefined) return TIER_COLORS.neutral;
  const ratio = score / max;
  if (ratio >= 0.8) return TIER_COLORS.strong;
  if (ratio >= 0.6) return TIER_COLORS.good;
  return TIER_COLORS.needsWork;
}

/* ─── Subcomponents ───────────────────────────────────────────────────── */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "0.5rem",
          background: "rgba(99, 102, 241, 0.12)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--mm-accent-glow)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--mm-text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", margin: 0, marginTop: "0.15rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, unit = "", subtitle, icon, highlightColor }) {
  return (
    <div
      className="mm-card"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "0.875rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--mm-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "0.5rem",
            background: highlightColor ? `${highlightColor}18` : "rgba(255,255,255,0.04)",
            border: `1px solid ${highlightColor ? `${highlightColor}33` : "var(--mm-border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: highlightColor || "var(--mm-text-muted)",
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
          <span
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              lineHeight: 1.1,
              color: highlightColor || "var(--mm-text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            {value !== null && value !== undefined ? value : "—"}
          </span>
          {unit && (
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--mm-text-faint)" }}>
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <div style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", marginTop: "0.35rem" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CSS-Based Score History Chart ───────────────────────────────────── */
function ScoreHistoryChart({ history = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div
        className="mm-card"
        style={{
          padding: "3rem 1.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mm-accent-glow)",
          }}
        >
          <BarChart2 size={24} />
        </div>
        <div>
          <h4 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 700 }}>No Score History Yet</h4>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--mm-text-muted)", maxWidth: 360 }}>
            Complete mock interviews to track your ML-evaluated score trajectory across sessions over time.
          </p>
        </div>
        <Link to="/setup" className="mm-btn mm-btn-primary" style={{ marginTop: "0.5rem" }}>
          Start Practice Interview <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  // Calculate score gain from first to last
  const firstScore = history[0]?.score ?? 0;
  const latestScore = history[history.length - 1]?.score ?? 0;
  const scoreDiff = latestScore - firstScore;

  return (
    <div className="mm-card" style={{ padding: "1.75rem 1.5rem 1.5rem" }}>
      {/* Chart Top Metric */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)" }}>Practice Trajectory</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--mm-text-primary)" }}>
              {history.length} Sessions Recorded
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: scoreDiff >= 0 ? "var(--mm-success)" : "var(--mm-danger)",
                padding: "0.15rem 0.5rem",
                borderRadius: "999px",
                background: scoreDiff >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                border: `1px solid ${scoreDiff >= 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              <TrendingUp size={13} />
              {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts trend
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.78rem", color: "var(--mm-text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: "#10b981" }} />
            <span>&gt;= 80 (Strong)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: "#f59e0b" }} />
            <span>60–79 (Good)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: "#ef4444" }} />
            <span>&lt; 60 (Needs Work)</span>
          </div>
        </div>
      </div>

      {/* Responsive Bar Visualization */}
      <div style={{ position: "relative", width: "100%", height: 260, marginTop: "1rem" }}>
        {/* Background guideline levels (100, 75, 50, 25) */}
        {[100, 75, 50, 25].map((lvl) => {
          const topPercent = 100 - lvl;
          return (
            <div
              key={lvl}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${topPercent}%`,
                borderBottom: "1px dashed rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "flex-end",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--mm-text-faint)",
                  transform: "translateY(-50%)",
                  paddingLeft: "0.5rem",
                  userSelect: "none",
                }}
              >
                {lvl}
              </span>
            </div>
          );
        })}

        {/* Bars Container */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            bottom: 36, // leave space for bottom date labels
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            gap: "1rem",
            padding: "0 1.5rem",
          }}
        >
          {history.map((item, idx) => {
            const barHeightPct = clamp(item.score, 5, 100);
            const tier = getScoreTier(item.score);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.interviewId || idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  flex: 1,
                  maxWidth: 68,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {/* Score badge at top of bar */}
                <div
                  style={{
                    marginBottom: "0.45rem",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: tier.hex,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.35rem",
                    background: isHovered ? tier.bg : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${isHovered ? tier.hex : "var(--mm-border)"}`,
                    boxShadow: isHovered ? `0 0 12px ${tier.glow}` : "none",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    transform: isHovered ? "translateY(-2px)" : "none",
                  }}
                >
                  {item.score}
                </div>

                {/* Animated Vertical Bar */}
                <div
                  style={{
                    width: "100%",
                    minWidth: "24px",
                    height: `${barHeightPct}%`,
                    borderRadius: "0.5rem 0.5rem 0 0",
                    background: tier.gradient,
                    border: `1px solid ${tier.border}`,
                    borderBottom: "none",
                    boxShadow: isHovered
                      ? `0 0 20px ${tier.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
                      : `0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)`,
                    transition: "all 0.25s ease",
                    transform: isHovered ? "scaleY(1.02)" : "none",
                    transformOrigin: "bottom",
                  }}
                />

                {/* Bottom Date Label */}
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    marginTop: "0.55rem",
                    fontSize: "0.78rem",
                    color: isHovered ? "var(--mm-text-primary)" : "var(--mm-text-muted)",
                    fontWeight: isHovered ? 600 : 500,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    transition: "color 0.2s",
                  }}
                >
                  {item.date.replace(", 2026", "")}
                </div>

                {/* Tooltip on Hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `calc(${barHeightPct}% + 44px)`,
                      background: "var(--mm-bg-surface)",
                      border: `1px solid ${tier.border}`,
                      borderRadius: "0.5rem",
                      padding: "0.5rem 0.85rem",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.6)",
                      zIndex: 20,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--mm-text-primary)" }}>
                      {item.role}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--mm-text-muted)", marginTop: "0.2rem" }}>
                      {item.date} · Score: <strong style={{ color: tier.hex }}>{item.score}/100</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Skill Progress Card ─────────────────────────────────────────────── */
function SkillProgressBar({ skill, score, improvement, status }) {
  const tier = getScoreTier(score);
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--mm-border)",
        borderRadius: "0.75rem",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--mm-text-primary)" }}>
            {skill}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "999px",
              background: tier.bg,
              border: `1px solid ${tier.border}`,
              color: tier.hex,
            }}
          >
            {status}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {improvement && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--mm-success)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              <TrendingUp size={12} /> {improvement} pts
            </span>
          )}
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: tier.hex }}>
            {score}<span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)", fontWeight: 500 }}>/100</span>
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ height: 8, borderRadius: 4, background: "var(--mm-border)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${clamp(score)}%`,
            borderRadius: 4,
            background: tier.gradient,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Main Progress Page ──────────────────────────────────────────────── */
export default function Progress() {
  // BACKEND INTEGRATION POINT:
  // When the real backend progress API is connected, fetch candidate progress via:
  // const { data, loading, error } = useProgressData();
  // Fall back smoothly to mockProgress for development & demonstration.
  const data = mockProgress || {};
  const isMockData = true;

  const totalInterviews = data.totalInterviews ?? 0;
  const completedInterviews = data.completedInterviews ?? 0;
  const averageScore = data.averageScore ?? null;
  const latestScore = data.latestScore ?? null;
  const scoreHistory = data.scoreHistory || [];
  const skillProgress = data.skillProgress || [];
  const recentInterviews = data.recentInterviews || [];

  const avgTier = getScoreTier(averageScore);
  const latestTier = getScoreTier(latestScore);

  // Recommendations: Reused from mockFeedback for consistency without data duplication
  const recommendations = mockFeedback?.improvementAreas || [
    "Deepen explanation of async/await and the JavaScript event loop.",
    "Provide Big O complexity analysis with concrete examples, not just definitions.",
    "Include actionable code snippets or pseudocode when describing technical solutions.",
  ];
  const followUpTopics = mockFeedback?.followUp || [];

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem", paddingBottom: "3.5rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2.25rem", width: "100%" }}>

        {/* ── Top Bar / Action Links ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            <Home size={15} /> Back to Home
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              to="/final-report"
              className="mm-btn mm-btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", textDecoration: "none" }}
            >
              <FileText size={15} /> View Final Report
            </Link>

            <Link
              to="/setup"
              className="mm-btn mm-btn-primary"
              style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", textDecoration: "none" }}
            >
              Start New Interview <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ── Page Header ── */}
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.3rem 0.85rem",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              color: "var(--mm-accent-glow)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "0.875rem",
            }}
          >
            <BarChart2 size={14} /> Candidate Performance Dashboard
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "0.625rem",
              color: "var(--mm-text-primary)",
            }}
          >
            Your Progress
          </h1>

          <p
            style={{
              color: "var(--mm-text-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Track your interview practice and development.
          </p>
        </div>

        {/* ── Demo Notice Banner (Step 4) ── */}
        {isMockData && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1.25rem",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              color: "var(--mm-text-primary)",
            }}
          >
            <Sparkles size={18} style={{ color: "var(--mm-accent-glow)", flexShrink: 0 }} />
            <div style={{ flex: 1, lineHeight: 1.5 }}>
              <strong>Demo progress data — backend integration will be added later.</strong>{" "}
              <span style={{ color: "var(--mm-text-muted)" }}>
                This dashboard displays sample developmental metrics from <code>src/data/mockProgress.js</code>. Future sessions will sync directly with the evaluation backend.
              </span>
            </div>
          </div>
        )}

        {/* ── Summary Cards (Step 3) ── */}
        <section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <SummaryCard
              label="Total Interviews"
              value={totalInterviews}
              subtitle="All registered sessions"
              icon={<Calendar size={18} />}
              highlightColor="var(--mm-accent-glow)"
            />

            <SummaryCard
              label="Completed Interviews"
              value={completedInterviews}
              subtitle="Evaluated & reviewed"
              icon={<CheckCircle2 size={18} />}
              highlightColor="#10b981"
            />

            <SummaryCard
              label="Average Score"
              value={averageScore}
              unit="/100"
              subtitle="Across all completed tests"
              icon={<Award size={18} />}
              highlightColor={avgTier.hex}
            />

            <SummaryCard
              label="Latest Score"
              value={latestScore}
              unit="/100"
              subtitle="Most recent session"
              icon={<TrendingUp size={18} />}
              highlightColor={latestTier.hex}
            />
          </div>
        </section>

        {/* ── Score History Visualization ── */}
        <section>
          <SectionHeader
            icon={<TrendingUp size={18} />}
            title="Score History"
            subtitle="Your ML evaluation trajectory across past interview attempts"
          />
          <ScoreHistoryChart history={scoreHistory} />
        </section>

        {/* ── Skill Progress ── */}
        <section>
          <SectionHeader
            icon={<Target size={18} />}
            title="Skill Progress"
            subtitle="Performance by competency area based on candidate evaluations"
          />
          {skillProgress && skillProgress.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1rem",
              }}
            >
              {skillProgress.map((item, idx) => (
                <SkillProgressBar
                  key={item.skill || idx}
                  skill={item.skill}
                  score={item.score}
                  improvement={item.improvement}
                  status={item.status}
                />
              ))}
            </div>
          ) : (
            <div className="mm-card" style={{ padding: "2rem", textAlign: "center", color: "var(--mm-text-muted)" }}>
              No skill progress recorded yet. Complete interviews to unlock skill breakdowns.
            </div>
          )}
        </section>

        {/* ── Recent Interviews Table / List ── */}
        <section>
          <SectionHeader
            icon={<Clock size={18} />}
            title="Recent Interviews"
            subtitle="History of your practice sessions with direct links to performance reports"
          />

          <div className="mm-card" style={{ padding: 0, overflow: "hidden" }}>
            {recentInterviews && recentInterviews.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--mm-border)",
                        background: "rgba(255, 255, 255, 0.02)",
                        color: "var(--mm-text-muted)",
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Target Role</th>
                      <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Date</th>
                      <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Score</th>
                      <th style={{ padding: "1rem 1.25rem", fontWeight: 600, textAlign: "right" }}>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInterviews.map((session, idx) => {
                      const isCompleted = session.status === "Completed";
                      const tier = getScoreTier(session.score);
                      const hasReport = session.hasReport !== false && isCompleted;

                      return (
                        <tr
                          key={session.interviewId || idx}
                          style={{
                            borderBottom: idx < recentInterviews.length - 1 ? "1px solid var(--mm-border)" : "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Role */}
                          <td style={{ padding: "1rem 1.25rem" }}>
                            <div style={{ fontWeight: 600, color: "var(--mm-text-primary)" }}>
                              {session.role}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)", marginTop: "0.15rem" }}>
                              ID: {session.interviewId}
                            </div>
                          </td>

                          {/* Date */}
                          <td style={{ padding: "1rem 1.25rem", color: "var(--mm-text-muted)", whiteSpace: "nowrap" }}>
                            {session.date}
                          </td>

                          {/* Status */}
                          <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "999px",
                                background: isCompleted ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                                border: `1px solid ${isCompleted ? "rgba(16, 185, 129, 0.28)" : "rgba(245, 158, 11, 0.28)"}`,
                                color: isCompleted ? "#10b981" : "#f59e0b",
                              }}
                            >
                              {isCompleted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {session.status}
                            </span>
                          </td>

                          {/* Score */}
                          <td style={{ padding: "1rem 1.25rem", whiteSpace: "nowrap" }}>
                            {session.score !== null && session.score !== undefined ? (
                              <span style={{ fontWeight: 700, color: tier.hex, fontSize: "0.9375rem" }}>
                                {session.score}
                                <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)", fontWeight: 500 }}>
                                  /100
                                </span>
                              </span>
                            ) : (
                              <span style={{ color: "var(--mm-text-faint)", fontSize: "0.85rem" }}>—</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: "1rem 1.25rem", textAlign: "right", whiteSpace: "nowrap" }}>
                            {hasReport ? (
                              <Link
                                to="/final-report"
                                className="mm-btn mm-btn-secondary"
                                style={{
                                  fontSize: "0.8125rem",
                                  padding: "0.35rem 0.85rem",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                }}
                              >
                                View Report <ArrowRight size={13} />
                              </Link>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--mm-text-faint)",
                                  padding: "0.35rem 0.65rem",
                                  borderRadius: "0.375rem",
                                  background: "rgba(255, 255, 255, 0.02)",
                                  border: "1px solid var(--mm-border)",
                                }}
                                title="No final report generated for this session"
                              >
                                No Report
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--mm-text-muted)" }}>
                No recent interviews found.
              </div>
            )}
          </div>
        </section>

        {/* ── Improvement Recommendations (Step 3) ── */}
        <section>
          <SectionHeader
            icon={<Lightbulb size={18} />}
            title="Improvement Recommendations"
            subtitle="Targeted areas to focus on based on your aggregated practice feedback"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {/* Actionable Key Tips */}
            <div
              className="mm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Target size={16} color="var(--mm-accent-glow)" /> Key Action Items
              </h3>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recommendations.map((rec, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.625rem",
                      fontSize: "0.875rem",
                      color: "var(--mm-text-muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid rgba(99, 102, 241, 0.25)",
                        color: "var(--mm-accent-glow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--mm-text-primary)" }}>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Learning Topics */}
            <div
              className="mm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen size={16} color="#f59e0b" /> Recommended Practice Topics
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {followUpTopics.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.875rem",
                      borderRadius: "0.5rem",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--mm-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mm-text-primary)", marginBottom: "0.25rem" }}>
                      {item.topic}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--mm-text-muted)", lineHeight: 1.45, marginBottom: "0.5rem" }}>
                      {item.reason}
                    </div>
                    {item.resources && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {item.resources.map((res, rIdx) => (
                          <span
                            key={rIdx}
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--mm-accent-glow)",
                              background: "rgba(99, 102, 241, 0.1)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "0.25rem",
                              border: "1px solid rgba(99, 102, 241, 0.2)",
                            }}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Navigation CTA Banner (Step 3) ── */}
        <section
          className="mm-card"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(26, 34, 53, 0.8) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.4rem", color: "var(--mm-text-primary)" }}>
              Ready for your next interview practice?
            </h3>
            <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--mm-text-muted)" }}>
              Upload a new target job description and test your answers with MockMate's AI voice engine.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
            <Link
              to="/"
              className="mm-btn mm-btn-ghost"
              style={{ fontSize: "0.875rem" }}
            >
              Back to Home
            </Link>

            <Link
              to="/final-report"
              className="mm-btn mm-btn-secondary"
              style={{ fontSize: "0.875rem" }}
            >
              <FileText size={15} /> View Final Report
            </Link>

            <Link
              to="/setup"
              className="mm-btn mm-btn-primary"
              style={{ fontSize: "0.875rem" }}
            >
              Start New Interview <ArrowRight size={15} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
