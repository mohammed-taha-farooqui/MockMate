import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import ScoreCard from "../components/ScoreCard";
import FeedbackCard from "../components/FeedbackCard";

export default function Feedback() {
  // Sample data received from backend ML evaluation for this response
  const sampleMlScore = 84;
  const sampleStrengths = [
    "Accurately differentiated between immutable props and component-managed state.",
    "Correctly explained unidirectional data flow from parent to child via props.",
    "Mentioned that state updates trigger component re-renders.",
  ];
  const sampleMissingPoints = [
    "Did not mention prop drilling or solutions like React Context / state management.",
    "Could clarify that state updates in React 18 are batched automatically.",
  ];
  const sampleImprovement = "Provide a concrete code analogy or mention lifting state up when sibling components need to communicate.";
  const sampleFollowUp = "How would you handle state sharing between two sibling components without passing props through the parent repeatedly?";

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <div className="mm-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Navigation & Header */}
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
            Step 5 of 5 · Response Evaluation
          </span>
        </div>

        {/* Title area */}
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", marginBottom: "0.5rem" }}>
            Question Feedback
          </h1>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.95rem" }}>
            Review the automated AI evaluation of your previous response. Learn from key strengths and identified gaps.
          </p>
        </div>

        {/* Grid layout: ScoreCard + FeedbackCard */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: ML Score Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <ScoreCard
              score={sampleMlScore}
              maxScore={100}
              label="Answer Quality Score"
              subtitle="Semantic relevance and technical accuracy"
            />

            <div className="mm-card" style={{ padding: "1.25rem" }}>
              <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.5rem" }}>Evaluation Note</h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--mm-text-muted)", lineHeight: 1.6, margin: 0 }}>
                This score is derived by MockMate's NLP assessment service comparing your spoken transcript against expected concept milestones.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Feedback */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <FeedbackCard
              questionNumber={1}
              questionText="Difference between state and props in React, and unidirectional data flow."
              strengths={sampleStrengths}
              missingPoints={sampleMissingPoints}
              actionableImprovement={sampleImprovement}
              followUpQuestion={sampleFollowUp}
            />

            {/* Bottom Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <Link to="/final-report" className="mm-btn mm-btn-primary">
                View Final Report <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
