import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Volume2 } from "lucide-react";
import Avatar from "../components/Avatar";
import QuestionPanel from "../components/QuestionPanel";
import VoiceButton from "../components/VoiceButton";
import TextAnswerBox from "../components/TextAnswerBox";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";

export default function Interview() {
  const [currentQuestion] = useState(1);
  const [totalQuestions] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isSpeaking] = useState(false);

  const sampleQuestion = {
    text: "Can you explain the difference between state and props in React, and how data flows between parent and child components?",
    category: "Technical · Frontend",
    hint: "Think about immutability, component re-rendering triggers, and unidirectional data flow.",
  };

  const handleVoiceToggle = () => {
    setIsRecording((prev) => !prev);
  };

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Top bar: Navigation, Progress, Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--mm-border)",
          }}
        >
          <Link
            to="/interview-lobby"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Exit to Lobby
          </Link>

          <div style={{ flex: 1, maxWidth: 360, margin: "0 1rem" }}>
            <ProgressBar current={currentQuestion} total={totalQuestions} compact showFraction showPercent />
          </div>

          <Timer initialSeconds={180} countDown autoStart={false} />
        </div>

        {/* Main interview workspace */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: AI Interviewer Avatar & Question */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Avatar section card */}
            <div
              className="mm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "2rem 1.5rem",
              }}
            >
              <Avatar
                name="Alex"
                role="AI Technical Interviewer"
                isSpeaking={isSpeaking}
                isListening={isRecording}
                size="md"
              />
            </div>

            {/* Question Panel */}
            <QuestionPanel
              questionNumber={currentQuestion}
              total={totalQuestions}
              question={sampleQuestion.text}
              category={sampleQuestion.category}
              hint={sampleQuestion.hint}
            />
          </div>

          {/* Right Column: Response Area (Voice or Text) */}
          <div
            className="mm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              height: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1.125rem", margin: 0 }}>Your Response</h3>
              <span className="mm-badge mm-badge-accent">Live Answer</span>
            </div>

            {/* Voice Input Section */}
            <div
              style={{
                padding: "2rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed var(--mm-border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VoiceButton
                isRecording={isRecording}
                onClick={handleVoiceToggle}
                size="lg"
              />
            </div>

            {/* Text Answer Input fallback */}
            <TextAnswerBox
              label="Or type / edit your response transcript:"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Speak using the microphone above or type your answer here..."
              maxLength={1500}
              rows={6}
            />

            {/* Bottom action controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1rem",
                borderTop: "1px solid var(--mm-border)",
                marginTop: "auto",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)" }}>
                Step 4 of 5 · Live Session
              </span>
              <Link to="/feedback" className="mm-btn mm-btn-primary">
                Submit & View Feedback <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
