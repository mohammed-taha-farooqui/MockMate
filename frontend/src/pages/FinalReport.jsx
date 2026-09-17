import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import ScoreCard from "../components/ScoreCard";

export default function FinalReport() {
  const overallScore = 88;
  const categories = [
    { name: "Technical Accuracy", score: 90 },
    { name: "Communication & Clarity", score: 85 },
    { name: "Problem Solving", score: 88 },
  ];

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Navigation & Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            to="/feedback"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Back to Question Feedback
          </Link>

          <span className="mm-badge mm-badge-accent">
            Session Complete
          </span>
        </div>

        {/* Title area */}
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 2.75rem)", marginBottom: "0.75rem" }}>
            Interview Summary Report
          </h1>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "1rem", lineHeight: 1.6 }}>
            Comprehensive performance evaluation calculated by the MockMate scoring service for your session.
          </p>
        </div>

        {/* Score overview cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <ScoreCard
            score={overallScore}
            maxScore={100}
            label="Overall MockMate Score"
            subtitle="Weighted aggregate across all answered questions"
          />

          <div
            className="mm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <h3 style={{ fontSize: "1.0625rem", margin: 0 }}>Category Breakdown</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", margin: 0 }}>
              Scores returned directly from individual assessment criteria:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.25rem" }}>
              {categories.map((cat) => (
                <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--mm-text-primary)" }}>{cat.name}</span>
                  <ScoreCard score={cat.score} maxScore={100} label={cat.name} compact />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action highlights card */}
        <div className="mm-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--mm-success)" }}>
            <CheckCircle2 size={20} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--mm-text-primary)", margin: 0 }}>
              Key Takeaway
            </h4>
          </div>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem", lineHeight: 1.65, margin: 0 }}>
            Strong conceptual foundation on React component lifecycles and declarative rendering. Focus next on articulating system trade-offs and concurrency patterns to reach senior-level evaluation tiers.
          </p>
        </div>

        {/* Bottom CTA Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <Link to="/progress" className="mm-btn mm-btn-primary">
            View Historical Progress <ArrowRight size={16} />
          </Link>
          <Link to="/setup" className="mm-btn mm-btn-secondary">
            <RotateCcw size={15} /> Start Another Session
          </Link>
        </div>
      </div>
    </div>
  );
}
