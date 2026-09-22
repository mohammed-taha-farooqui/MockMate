import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  FileQuestion,
  Mic,
  Keyboard,
  CheckCircle2,
  Maximize2,
  AlertCircle,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useInterviewContext } from "../context/InterviewContext";
import Avatar from "../components/Avatar";
import LoadingSpinner from "../components/LoadingSpinner";
import { requestBrowserFullscreen } from "../utils/fullscreen";

/**
 * InterviewLobby.jsx
 * Candidate-facing waiting room and briefing area before the live AI interview begins.
 *
 * Displays:
 *  - Target role, question count, estimated duration
 *  - AI interviewer preview (student-safe, CSS-powered Avatar)
 *  - Voice and text answer mode options
 *  - Essential pre-interview instructions
 *  - Explicit Start Interview action with native Fullscreen API integration
 */
export default function InterviewLobby() {
  const navigate = useNavigate();
  const { candidate, job, resumeId, extractedFields } = useInterviewContext();

  const [isStarting, setIsStarting] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState(null);

  // Derive target role cleanly from context or provide a clearly marked fallback
  const candidateName = candidate?.name?.trim() || "Candidate";

  const targetRole = (() => {
    if (!job?.jobDescription) return "Target Role";
    const firstLine = job.jobDescription
      .split("\n")[0]
      .replace(/^#+\s*/, "")
      .trim();
    if (
      firstLine.length > 0 &&
      firstLine.length <= 60 &&
      !firstLine.toLowerCase().startsWith("we are looking") &&
      !firstLine.toLowerCase().startsWith("job description")
    ) {
      return firstLine;
    }
    return "Target Role";
  })();

  // Configured values (not pretending to be dynamically calculated)
  const questionCount = 5;
  const estimatedDuration = "~15 mins";

  /**
   * Handles explicit user click to begin the interview.
   * Requests browser fullscreen, handles denials gracefully, and navigates to /interview.
   */
  const handleStartInterview = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setFullscreenNotice(null);

    // Request native browser fullscreen on candidate interaction
    const result = await requestBrowserFullscreen();

    if (!result.success) {
      // Non-blocking notification if fullscreen is denied or unsupported
      setFullscreenNotice(
        result.error ||
          "Fullscreen could not be enabled, but you can still proceed with your interview."
      );
    }

    // Smoothly transition to the interview session
    navigate("/interview");
  };

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <main
        className="mm-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {/* Navigation & Step Indicator */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <Link
            to="/match-result"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              transition: "color 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--mm-text-primary)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--mm-text-muted)")}
            aria-label="Return to Match Result page"
          >
            <ArrowLeft size={16} /> Back to Match Result
          </Link>

          <span className="mm-badge mm-badge-accent">
            Step 3 of 5 · Interview Lobby
          </span>
        </header>

        {/* Hero Title Section */}
        <section style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              background: "rgba(99, 102, 241, 0.12)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              color: "var(--mm-accent-glow)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={14} /> Ready when you are, {candidateName}
          </div>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              marginBottom: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            Ready for Your Mock Interview?
          </h1>

          <p
            style={{
              color: "var(--mm-text-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            MockMate will conduct an AI-powered practice interview tailored to your
            uploaded resume and target role. Review your interview briefing below before starting.
          </p>
        </section>

        {/* Non-blocking Fullscreen Warning (if any) */}
        {fullscreenNotice && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1.25rem",
              borderRadius: "0.75rem",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "var(--mm-warning)",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{fullscreenNotice}</span>
          </div>
        )}

        {/* Key Interview Information Cards Grid */}
        <section
          aria-label="Interview overview"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Target Role Card */}
          <article
            className="mm-card"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "0.625rem",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mm-accent-glow)",
                flexShrink: 0,
              }}
            >
              <Briefcase size={22} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Target Role
              </span>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={targetRole}
              >
                {targetRole}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)" }}>
                {job?.jobDescription ? "Configured from Job Description" : "General Technical Profile"}
              </span>
            </div>
          </article>

          {/* Number of Questions Card */}
          <article
            className="mm-card"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "0.625rem",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mm-success)",
                flexShrink: 0,
              }}
            >
              <FileQuestion size={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Questions
              </span>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                {questionCount} Questions
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)" }}>
                Presented one-by-one sequentially
              </span>
            </div>
          </article>

          {/* Estimated Duration Card */}
          <article
            className="mm-card"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "0.625rem",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--mm-warning)",
                flexShrink: 0,
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                Estimated Duration
              </span>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                {estimatedDuration}
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--mm-text-faint)" }}>
                Self-paced interview experience
              </span>
            </div>
          </article>
        </section>

        {/* Main Grid: AI Avatar Preview & Instructions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Left Column: AI Interviewer Card */}
          <section
            className="mm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "2.5rem 1.5rem",
            }}
            aria-label="AI Interviewer Introduction"
          >
            <Avatar name="Alex" role="AI Technical Interviewer" size="lg" />

            <h3 style={{ fontSize: "1.125rem", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
              Meet Alex, Your AI Interviewer
            </h3>

            <p
              style={{
                color: "var(--mm-text-muted)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                maxWidth: 340,
                margin: "0 auto",
              }}
            >
              &ldquo;Welcome to MockMate! I will present technical and behavioral questions one at
              a time. Answer naturally via your microphone or type your response in the live
              workspace.&rdquo;
            </p>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--mm-border)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8125rem",
                color: "var(--mm-text-muted)",
              }}
            >
              <Volume2 size={16} color="var(--mm-accent-glow)" />
              <span>Free student-friendly AI practice session</span>
            </div>
          </section>

          {/* Right Column: Instructions & Response Modes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Answer Modes Card */}
            <section className="mm-card" style={{ padding: "1.5rem" }} aria-label="Available answer modes">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Supported Answer Modes
              </h3>

              <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", marginBottom: "1rem" }}>
                During the live interview, you can choose whichever response format suits your current setup:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {/* Voice Mode */}
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "0.625rem",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--mm-accent-glow)" }}>
                    <Mic size={16} />
                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Voice Mode</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", lineHeight: 1.4 }}>
                    Speak into your mic. Best for practicing verbal delivery.
                  </span>
                </div>

                {/* Type Mode */}
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "0.625rem",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--mm-success)" }}>
                    <Keyboard size={16} />
                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Type Mode</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--mm-text-muted)", lineHeight: 1.4 }}>
                    Type in the live text area if in a quiet or shared environment.
                  </span>
                </div>
              </div>
            </section>

            {/* Candidate Instructions */}
            <section className="mm-card" style={{ padding: "1.5rem" }} aria-label="Pre-interview instructions">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                Important Instructions
              </h3>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {[
                  "Make sure you are in a quiet environment free from distractions.",
                  "Keep your microphone available if using voice mode.",
                  "Questions will be shown on screen one at a time.",
                  "You can answer using voice or text when the interview begins.",
                  "The interview will enter fullscreen after you click Start.",
                  "Keep your resume or job details handy in mind if needed.",
                ].map((instruction, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      fontSize: "0.8125rem",
                      color: "var(--mm-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="var(--mm-success)"
                      style={{ flexShrink: 0, marginTop: "0.15rem" }}
                    />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Start Interview Action Section */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "0.5rem",
            padding: "1.5rem 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8125rem",
              color: "var(--mm-text-faint)",
            }}
          >
            <Maximize2 size={14} />
            <span>Clicking below will request browser fullscreen for an immersive session.</span>
          </div>

          <button
            type="button"
            id="start-interview-btn"
            onClick={handleStartInterview}
            disabled={isStarting}
            className="mm-btn mm-btn-primary"
            style={{
              fontSize: "1.0625rem",
              padding: "0.875rem 2.75rem",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)",
              cursor: isStarting ? "not-allowed" : "pointer",
            }}
            aria-label="Start Mock Interview and enter fullscreen"
          >
            {isStarting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Entering Interview Room...</span>
              </>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  );
}
