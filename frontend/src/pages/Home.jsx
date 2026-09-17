import { Link } from "react-router-dom";
import { Mic, ChevronRight, Zap, BarChart2 } from "lucide-react";

const features = [
  {
    icon: <Mic size={22} />,
    title: "AI Voice Interviews",
    desc: "Practice with a conversational AI that listens, adapts, and challenges you.",
  },
  {
    icon: <Zap size={22} />,
    title: "Instant Feedback",
    desc: "Receive detailed performance feedback immediately after every interview.",
  },
  {
    icon: <BarChart2 size={22} />,
    title: "Track Progress",
    desc: "Monitor your improvement across sessions with rich analytics.",
  },
];

export default function Home() {
  return (
    <div className="mm-page" style={{ gap: "4rem" }}>
      {/* Hero */}
      <div className="mm-container-sm" style={{ textAlign: "center" }}>
        <span className="mm-badge mm-badge-accent" style={{ marginBottom: "1.25rem" }}>
          <span className="mm-dot-live" style={{ marginRight: "0.4rem" }} />
          AI-Powered Mock Interviews
        </span>

        <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 3.5rem)", marginBottom: "1.25rem", lineHeight: 1.1 }}>
          Ace your next interview with{" "}
          <span className="mm-gradient-text">MockMate</span>
        </h1>

        <p style={{
          color: "var(--mm-text-muted)",
          fontSize: "1.125rem",
          lineHeight: 1.75,
          marginBottom: "2.5rem",
          maxWidth: 520,
          margin: "0 auto 2.5rem",
        }}>
          Practice realistic AI voice interviews, get instant feedback, and track your
          progress — all in one place. No recruiters, just you and your growth.
        </p>

        <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/setup" className="mm-btn mm-btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Start Mock Interview <ChevronRight size={16} />
          </Link>
          <Link to="/progress" className="mm-btn mm-btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            View My Progress
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mm-container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="mm-card" style={{ textAlign: "left" }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "0.75rem",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mm-accent-glow)",
                marginBottom: "1rem",
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{title}</h3>
              <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
