import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Volume2, Shield } from "lucide-react";
import Avatar from "../components/Avatar";
import VoiceButton from "../components/VoiceButton";

export default function InterviewLobby() {
  const [testedMic, setTestedMic] = useState(false);
  const [isMicTesting, setIsMicTesting] = useState(false);

  const handleTestMic = () => {
    setIsMicTesting(true);
    setTimeout(() => {
      setIsMicTesting(false);
      setTestedMic(true);
    }, 1500);
  };

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            to="/match-result"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Back to Match Result
          </Link>

          <span className="mm-badge mm-badge-accent">
            Step 3 of 5 · Interview Lobby
          </span>
        </div>

        {/* Welcome Interviewer Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {/* AI Avatar Display */}
          <div
            className="mm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "2.5rem 1.5rem",
            }}
          >
            <Avatar
              name="Alex"
              role="AI Technical Interviewer"
              size="lg"
            />
            <p
              style={{
                textAlign: "center",
                color: "var(--mm-text-muted)",
                fontSize: "0.875rem",
                marginTop: "1.25rem",
                maxWidth: 280,
                lineHeight: 1.5,
              }}
            >
              &ldquo;Hello! I will be conducting your voice interview session today. Take your time to test your microphone before we start.&rdquo;
            </p>
          </div>

          {/* Lobby Checklist & Hardware Verification */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="mm-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0 }}>Pre-Interview Checklist</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: testedMic ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: testedMic ? "var(--mm-success)" : "var(--mm-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>
                      Microphone Check
                    </h5>
                    <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", margin: "0.2rem 0 0" }}>
                      {testedMic ? "Microphone tested successfully." : "Click below to test audio readiness."}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--mm-success)",
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={14} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>
                      Candidate Privacy
                    </h5>
                    <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", margin: "0.2rem 0 0" }}>
                      Candidate-only practice mode. No recruiters or evaluators can view your raw session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mic Test Section */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--mm-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "var(--mm-text-muted)" }}>
                  Mic Status: {testedMic ? "Ready" : "Not Tested"}
                </span>
                <VoiceButton
                  isRecording={isMicTesting}
                  onClick={handleTestMic}
                  size="sm"
                />
              </div>
            </div>

            {/* Launch CTA */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/interview" className="mm-btn mm-btn-primary" style={{ padding: "0.75rem 2rem" }}>
                Enter Interview Room <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
