import { BarChart2, Calendar, ArrowRight, TrendingUp } from "lucide-react";
import PageShell from "../components/PageShell";
import { Link } from "react-router-dom";
import ScoreCard from "../components/ScoreCard";
import ProgressBar from "../components/ProgressBar";

export default function Progress() {
  const pastSessions = [
    {
      id: 1,
      role: "Frontend Engineer (React)",
      date: "Sep 16, 2026",
      score: 88,
      completedQuestions: 5,
      totalQuestions: 5,
    },
    {
      id: 2,
      role: "Full Stack JavaScript Developer",
      date: "Sep 12, 2026",
      score: 79,
      completedQuestions: 5,
      totalQuestions: 5,
    },
    {
      id: 3,
      role: "Junior Web Developer",
      date: "Sep 08, 2026",
      score: 92,
      completedQuestions: 5,
      totalQuestions: 5,
    },
  ];

  return (
    <PageShell
      icon={<BarChart2 size={32} />}
      badge="Analytics & History"
      title="My Progress"
      description="Track your interview performance over time. Watch your ML evaluation scores improve with regular practice."
      backTo="/"
      backLabel="Back to Home"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", marginTop: "1rem" }}>
        {/* Overall stat highlights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          <div className="mm-card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--mm-text-muted)" }}>Total Sessions</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--mm-accent-glow)" }}>3</div>
          </div>
          <div className="mm-card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--mm-text-muted)" }}>Average ML Score</span>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--mm-success)" }}>86.3</div>
          </div>
        </div>

        {/* Recent Session History list */}
        <div className="mm-card" style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h4 style={{ fontSize: "1rem", margin: 0 }}>Completed Interview Sessions</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pastSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--mm-border)",
                }}
              >
                <div>
                  <h5 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: 0 }}>{session.role}</h5>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <Calendar size={13} color="var(--mm-text-faint)" />
                    <span style={{ fontSize: "0.78rem", color: "var(--mm-text-muted)" }}>{session.date}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <ScoreCard score={session.score} maxScore={100} compact label="Score" />
                  <Link
                    to="/final-report"
                    style={{
                      color: "var(--mm-accent-glow)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Goal Bar */}
        <div className="mm-card" style={{ textAlign: "left" }}>
          <ProgressBar
            current={3}
            total={5}
            label="Weekly Goal: Interviews"
            showFraction
            showPercent
          />
        </div>

        {/* New Session CTA */}
        <div style={{ marginTop: "0.5rem" }}>
          <Link to="/setup" className="mm-btn mm-btn-primary">
            Start New Interview <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
