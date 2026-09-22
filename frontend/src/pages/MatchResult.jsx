import { useState } from "react";
import { Search, Briefcase, FileText, User, ArrowRight, Sparkles } from "lucide-react";
import PageShell from "../components/PageShell";
import { Link } from "react-router-dom";
import { useInterviewContext } from "../context/InterviewContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function MatchResult() {
  const [loading] = useState(false);
  const [error] = useState(null);
  const { candidate, resume } = useInterviewContext();

  const candidateName = candidate?.name || "Candidate";
  const resumeName = resume?.fileName || "Uploaded Resume";

  const matchedProfile = {
    role: "Frontend Software Engineer (React)",
    level: "Mid-Level",
    topics: ["React Lifecycles", "Hooks & State", "Performance", "Web Accessibility"],
    totalQuestions: 5,
    estimatedTime: "15-20 mins",
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Finding your matched interview profile..." />;
  }

  if (error) {
    return (
      <div className="mm-page">
        <ErrorMessage
          title="Matching Service Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <PageShell
      icon={<Search size={32} />}
      badge="Step 2 of 5 · Profile Matched"
      title="Match Result"
      description={`Welcome, ${candidateName}! MockMate analyzed your resume and target job description to configure a tailored practice session.`}
      backTo="/setup"
      backLabel="Back to Setup"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          textAlign: "left",
          marginTop: "0.5rem",
        }}
      >
        {/* Candidate & Resume Confirmation Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={15} color="var(--mm-accent-glow)" />
            <span style={{ color: "var(--mm-text-primary)", fontWeight: 600 }}>{candidateName}</span>
            {candidate?.email && (
              <span style={{ color: "var(--mm-text-faint)" }}>({candidate.email})</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--mm-text-muted)" }}>
            <FileText size={14} />
            <span>{resumeName}</span>
          </div>
        </div>

        {/* Matched Profile Card */}
        <div
          className="mm-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "0.5rem",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mm-accent-glow)",
              }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", margin: 0 }}>{matchedProfile.role}</h3>
              <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)" }}>
                Level: {matchedProfile.level} · {matchedProfile.totalQuestions} Questions · {matchedProfile.estimatedTime}
              </span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--mm-border)", paddingTop: "1rem" }}>
            <h5 style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)", marginBottom: "0.5rem" }}>
              Key Evaluation Topics:
            </h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {matchedProfile.topics.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--mm-accent-glow)",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: "999px",
                    padding: "0.25rem 0.75rem",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.75rem" }}>
        <Link to="/interview-lobby" className="mm-btn mm-btn-primary">
          Enter Interview Lobby <ArrowRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
