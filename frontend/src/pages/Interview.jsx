import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Zap,
  ListChecks,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
  X,
  Briefcase,
  Clock,
  FileQuestion,
  PlayCircle,
  Save,
  MicOff,
} from "lucide-react";
import Avatar from "../components/Avatar";
import QuestionPanel from "../components/QuestionPanel";
import VoiceButton from "../components/VoiceButton";
import TextAnswerBox from "../components/TextAnswerBox";
import Timer from "../components/Timer";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { getInterviewQuestions } from "../services/questionService";
import {
  getQuestionByIndex,
  getQuestionProgress,
  getDifficultyMeta,
} from "../utils/questionUtils";
import {
  requestBrowserFullscreen,
  isFullscreenActive,
} from "../utils/fullscreen";
import { useInterviewContext } from "../context/InterviewContext";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

/**
 * Interview.jsx
 * Fullscreen interview session page (Task 8).
 *
 * Flow:
 *   1. Start screen  →  candidate reviews role / question count / instructions
 *   2. Click "Start Interview"  →  attempt fullscreen  →  show live interview UI
 *   3. Fullscreenchange listener detects exits  →  shows non-blocking notice
 *
 * All Task 7 question-generation functionality is preserved:
 *   questionService  →  mockQuestions  →  one-at-a-time navigation
 */
export default function Interview() {
  const navigate = useNavigate();
  const { candidate, job } = useInterviewContext();

  // ─── Start screen gate ────────────────────────────────────────────────────
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // ─── Fullscreen state ─────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState(isFullscreenActive());
  const [fullscreenError, setFullscreenError] = useState(false);
  const [fsNotice, setFsNotice] = useState(null); // null | "exited"
  const [fsNoticeDismissed, setFsNoticeDismissed] = useState(false);

  // ─── Question state ───────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ─── Answer / response state (Task 9) ─────────────────────────────────────
  // Answers are stored by questionId so they persist across navigation
  const [answers, setAnswers] = useState({});
  const [answerSaved, setAnswerSaved] = useState(false); // brief "saved" confirmation
  const [isSpeaking] = useState(false);

  // ─── Speech recognition (Task 9) ──────────────────────────────────────────
  const currentQuestionIdRef = useRef(null);

  const handleSpeechTranscript = useCallback(
    (text) => {
      const qId = currentQuestionIdRef.current;
      if (!qId) return;
      setAnswers((prev) => ({ ...prev, [qId]: text }));
    },
    []
  );

  const speech = useSpeechRecognition({ onTranscript: handleSpeechTranscript });

  // Keep the question-id ref in sync so the transcript callback targets the right question
  // (moved below currentQuestion derivation — see next block)

  // Keep a ref to the current index so the fullscreen handler never sees stale state
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // ─── Load questions on mount (pre-load while start screen shows) ──────────
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInterviewQuestions();
      setQuestions(data);
      // Do NOT reset currentIndex here — preserve position if questions reload
    } catch (err) {
      console.error("[Interview] Failed to load questions:", err);
      setLoadError(
        err?.message || "Failed to load interview questions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // ─── Fullscreen change listener ───────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = isFullscreenActive();
      setIsFullscreen(active);

      if (!active && hasStarted) {
        // Candidate exited fullscreen — show dismissible notice
        setFsNotice("exited");
        setFsNoticeDismissed(false);
        // currentIndex is intentionally NOT reset (ref guarantees this)
      }

      if (active) {
        setFsNotice(null);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [hasStarted]);

  // ─── Derived values from utilities ───────────────────────────────────────
  const currentQuestion = getQuestionByIndex(questions, currentIndex);
  const progress = getQuestionProgress(currentIndex, questions);
  const difficultyMeta = getDifficultyMeta(currentQuestion?.difficulty);

  // Sync question-id ref for speech callback
  useEffect(() => {
    currentQuestionIdRef.current = currentQuestion?.questionId || null;
  }, [currentQuestion?.questionId]);

  // Current answer text (derived from answers map)
  const currentAnswerText = currentQuestion
    ? answers[currentQuestion.questionId] || ""
    : "";

  // ─── Candidate / session info from context ────────────────────────────────
  const candidateName = candidate?.name?.trim() || "Candidate";
  const targetRole = (() => {
    if (!job?.jobDescription) return "Software Developer";
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
    return "Software Developer";
  })();

  // ─── Start interview handler ──────────────────────────────────────────────
  const handleStartInterview = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setFullscreenError(false);

    try {
      const result = await requestBrowserFullscreen();
      if (!result.success) {
        console.warn("[Interview] Fullscreen denied:", result.error);
        setFullscreenError(true);
      } else {
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error("[Interview] Fullscreen request failed:", err);
      setFullscreenError(true);
    }

    // Always transition to interview — fullscreen failure must not block
    setHasStarted(true);
    setIsStarting(false);
  };

  // ─── Answer handlers (Task 9) ──────────────────────────────────────────────
  const handleAnswerChange = (e) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: e.target.value }));
    setAnswerSaved(false);
  };

  const handleSaveAnswer = () => {
    // Answers are already stored in state — this is a visual confirmation
    setAnswerSaved(true);
    setTimeout(() => setAnswerSaved(false), 2000);
  };

  // ─── Voice toggle (Task 9) ────────────────────────────────────────────────
  const handleVoiceToggle = () => {
    if (speech.isListening) {
      speech.stop();
    } else {
      setAnswerSaved(false);
      speech.start();
    }
  };

  // ─── Navigation handlers ──────────────────────────────────────────────────
  const handlePrevious = () => {
    if (!progress.isFirst) {
      // Stop recognition before switching questions
      if (speech.isListening) speech.stop();
      setCurrentIndex((prev) => prev - 1);
      setAnswerSaved(false);
    }
  };

  const handleNext = () => {
    if (!progress.isLast) {
      if (speech.isListening) speech.stop();
      setCurrentIndex((prev) => prev + 1);
      setAnswerSaved(false);
    }
  };

  const handleFinish = () => {
    if (speech.isListening) speech.stop();
    navigate("/feedback", { state: { answers, questions } });
  };

  // ─── Loading state (shown on start screen too) ────────────────────────────
  if (isLoading && !hasStarted) {
    return (
      <LoadingSpinner
        fullPage
        label="Loading your interview questions…"
        size="lg"
      />
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (loadError && !hasStarted) {
    return (
      <div
        className="mm-page"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <ErrorMessage
          title="Could Not Load Questions"
          message={loadError}
          onRetry={loadQuestions}
        />
      </div>
    );
  }

  // ─── START SCREEN ─────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div
        className="mm-page"
        style={{
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                transition: "color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = "var(--mm-text-primary)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--mm-text-muted)")
              }
              aria-label="Return to Interview Lobby"
            >
              <ArrowLeft size={15} /> Back to Lobby
            </Link>
            <span className="mm-badge mm-badge-accent">Step 4 of 5 · Interview</span>
          </header>

          {/* Logo + Title */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "1rem",
                background: "linear-gradient(135deg, var(--mm-accent), var(--mm-accent-glow))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
                boxShadow: "0 8px 32px rgba(99, 102, 241, 0.35)",
              }}
            >
              <PlayCircle size={32} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              MockMate Interview
            </h1>
            <p style={{ color: "var(--mm-text-muted)", fontSize: "1rem", margin: 0 }}>
              Your interview is ready, {candidateName}
            </p>
          </div>

          {/* Info Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.875rem",
            }}
          >
            {/* Role */}
            <div
              className="mm-card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.5rem",
                  background: "rgba(99, 102, 241, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--mm-accent-glow)",
                }}
              >
                <Briefcase size={18} />
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                }}
              >
                Role
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--mm-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
                title={targetRole}
              >
                {targetRole}
              </span>
            </div>

            {/* Questions */}
            <div
              className="mm-card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.5rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--mm-success)",
                }}
              >
                <FileQuestion size={18} />
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                }}
              >
                Questions
              </span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--mm-text-primary)" }}>
                {questions.length > 0 ? questions.length : "10"} Questions
              </span>
            </div>

            {/* Duration */}
            <div
              className="mm-card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.5rem",
                  background: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--mm-warning)",
                }}
              >
                <Clock size={18} />
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--mm-text-muted)",
                  fontWeight: 600,
                }}
              >
                Duration
              </span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--mm-text-primary)" }}>
                ~15 minutes
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mm-card" style={{ padding: "1.5rem" }}>
            <h2
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                marginBottom: "0.875rem",
              }}
            >
              Before you begin
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              {[
                "Stay in a quiet environment free from distractions.",
                "Keep your microphone or keyboard ready for your responses.",
                "Questions are shown one at a time — answer at your own pace.",
                "The interview will open in fullscreen for a focused experience.",
                "You can exit fullscreen at any time; the interview will continue.",
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.55rem",
                    fontSize: "0.8375rem",
                    color: "var(--mm-text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  <CheckCircle2
                    size={15}
                    color="var(--mm-success)"
                    style={{ flexShrink: 0, marginTop: "0.15rem" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fullscreen error notice (only appears if lobby fullscreen failed and they re-open) */}
          {fullscreenError && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.875rem 1.125rem",
                borderRadius: "0.75rem",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                color: "var(--mm-warning)",
                fontSize: "0.875rem",
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                Fullscreen could not be enabled. You can continue the interview
                normally — fullscreen is recommended but not required.
              </span>
            </div>
          )}

          {/* Fullscreen hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "var(--mm-text-faint)",
            }}
          >
            <Maximize2 size={13} />
            <span>Clicking Start Interview will request browser fullscreen.</span>
          </div>

          {/* CTA */}
          <button
            type="button"
            id="start-interview-btn"
            onClick={handleStartInterview}
            disabled={isStarting}
            className="mm-btn mm-btn-primary"
            style={{
              fontSize: "1.0625rem",
              padding: "1rem 2rem",
              borderRadius: "0.875rem",
              boxShadow: "0 6px 28px rgba(99, 102, 241, 0.4)",
              cursor: isStarting ? "not-allowed" : "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
            }}
            aria-label="Start mock interview session and enter fullscreen"
          >
            {isStarting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Entering Interview Room…</span>
              </>
            ) : (
              <>
                <PlayCircle size={20} />
                <span>Start Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── FULLSCREEN INTERVIEW UI ──────────────────────────────────────────────

  // Loading state after start (questions still loading edge case)
  if (isLoading) {
    return (
      <LoadingSpinner
        fullPage
        label="Loading your interview questions…"
        size="lg"
      />
    );
  }

  if (loadError) {
    return (
      <div
        className="mm-page"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <ErrorMessage
          title="Could Not Load Questions"
          message={loadError}
          onRetry={loadQuestions}
        />
      </div>
    );
  }

  return (
    <div
      className="mm-page"
      style={{ justifyContent: "flex-start", paddingTop: "1.5rem" }}
    >
      <div
        className="mm-container"
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >

        {/* ── Fullscreen exit notice ── */}
        {fsNotice === "exited" && !fsNoticeDismissed && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.75rem",
              background: "rgba(245, 158, 11, 0.09)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "var(--mm-warning)",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              You have exited fullscreen mode. Fullscreen is recommended for the
              interview, but you can continue without it.
            </span>
            <button
              type="button"
              onClick={() => setFsNoticeDismissed(true)}
              aria-label="Dismiss fullscreen notice"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--mm-warning)",
                display: "flex",
                alignItems: "center",
                padding: "0.2rem",
                borderRadius: "0.25rem",
                opacity: 0.75,
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Fullscreen error notice ── */}
        {fullscreenError && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.75rem",
              background: "rgba(245, 158, 11, 0.09)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "var(--mm-warning)",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>
              Fullscreen could not be enabled. You can continue the interview —
              fullscreen is recommended but not required.
            </span>
          </div>
        )}

        {/* ── Top bar: back link, progress, fullscreen indicator, timer ── */}
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
              transition: "color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = "var(--mm-text-primary)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.color = "var(--mm-text-muted)")
            }
            aria-label="Exit to Interview Lobby"
          >
            <ArrowLeft size={15} /> Exit to Lobby
          </Link>

          <div style={{ flex: 1, maxWidth: 360, margin: "0 1rem" }}>
            <ProgressBar
              current={progress.current}
              total={progress.total}
              compact
              showFraction
              showPercent
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
            }}
          >
            {/* Fullscreen status indicator */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: isFullscreen ? "var(--mm-success)" : "var(--mm-text-faint)",
                fontWeight: 500,
                padding: "0.25rem 0.625rem",
                borderRadius: "999px",
                background: isFullscreen
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${isFullscreen ? "rgba(16,185,129,0.25)" : "var(--mm-border)"}`,
                transition: "all 0.3s ease",
              }}
              title={
                isFullscreen
                  ? "Fullscreen active"
                  : "Fullscreen exited — fullscreen is recommended"
              }
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={12} />
                  Fullscreen active
                </>
              ) : (
                <>
                  <Maximize2 size={12} />
                  Fullscreen exited
                </>
              )}
            </span>

            <Timer initialSeconds={900} countDown autoStart={false} />
          </div>
        </div>

        {/* ── Main workspace grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* ── Left column: Avatar + Question + Metadata ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* AI Avatar card */}
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
                isListening={speech.isListening}
                size="md"
              />
            </div>

            {/* Question panel */}
            <QuestionPanel
              questionNumber={progress.current}
              total={progress.total}
              question={currentQuestion?.question}
              category={currentQuestion?.skill}
              isLoading={isLoading}
            />

            {/* Skill + Difficulty + Expected Topics metadata card */}
            {currentQuestion && (
              <div
                className="mm-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  padding: "1.25rem",
                }}
              >
                {/* Skill badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Tag size={15} color="var(--mm-accent-glow)" />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--mm-text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Skill:
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "var(--mm-text-primary)",
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: "999px",
                      padding: "0.15rem 0.55rem",
                    }}
                  >
                    {currentQuestion.skill}
                  </span>
                </div>

                {/* Difficulty badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Zap size={15} color={difficultyMeta.color} />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--mm-text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    Difficulty:
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: difficultyMeta.color,
                      background: `${difficultyMeta.color}18`,
                      border: `1px solid ${difficultyMeta.color}40`,
                      borderRadius: "999px",
                      padding: "0.15rem 0.55rem",
                    }}
                  >
                    {difficultyMeta.label}
                  </span>
                </div>

                {/* Expected topics */}
                {currentQuestion.expectedTopics?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <ListChecks size={15} color="var(--mm-success)" />
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--mm-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        Expected Topics:
                      </span>
                    </div>
                    <ul
                      style={{
                        margin: "0 0 0 1.25rem",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.3rem",
                      }}
                    >
                      {currentQuestion.expectedTopics.map((topic) => (
                        <li
                          key={topic}
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--mm-text-muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right column: Response area ── */}
          <div
            className="mm-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", margin: 0 }}>Your Response</h3>
              {answerSaved ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "var(--mm-success)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    letterSpacing: "0.03em",
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <CheckCircle2 size={13} /> Answer Saved
                </span>
              ) : (
                <span className="mm-badge mm-badge-accent">
                  {speech.isListening ? "🎤 Listening" : "Answer"}
                </span>
              )}
            </div>

            {/* Speech recognition error notice */}
            {speech.error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.65rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.625rem",
                  background: "rgba(245, 158, 11, 0.09)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  color: "var(--mm-warning)",
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ flex: 1 }}>{speech.error}</span>
                <button
                  type="button"
                  onClick={speech.resetError}
                  aria-label="Dismiss voice error"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--mm-warning)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0.2rem",
                    borderRadius: "0.25rem",
                    opacity: 0.75,
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Voice input area */}
            <div
              style={{
                padding: "1.5rem 1rem",
                borderRadius: "0.75rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: `1px dashed ${
                  speech.isListening
                    ? "var(--mm-success)"
                    : !speech.isSupported
                    ? "rgba(255,255,255,0.06)"
                    : "var(--mm-border)"
                }`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                transition: "border-color 0.25s ease",
                opacity: !speech.isSupported ? 0.6 : 1,
              }}
            >
              <VoiceButton
                isRecording={speech.isListening}
                onClick={handleVoiceToggle}
                disabled={!speech.isSupported}
                unsupported={!speech.isSupported}
                size="lg"
              />
              {!speech.isSupported && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.78rem",
                    color: "var(--mm-text-faint)",
                    textAlign: "center",
                  }}
                >
                  <MicOff size={13} />
                  Voice input not available in this browser — please type your answer below.
                </span>
              )}
            </div>

            {/* Text answer */}
            <TextAnswerBox
              label="Type or edit your answer:"
              value={currentAnswerText}
              onChange={handleAnswerChange}
              placeholder={
                speech.isListening
                  ? "Your voice is being transcribed here…"
                  : "Type your answer here, or use the microphone above…"
              }
              maxLength={2000}
              rows={6}
            />

            {/* Save answer button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleSaveAnswer}
                disabled={!currentAnswerText.trim()}
                className="mm-btn mm-btn-secondary"
                style={{
                  opacity: !currentAnswerText.trim() ? 0.4 : 1,
                  cursor: !currentAnswerText.trim() ? "not-allowed" : "pointer",
                  gap: "0.4rem",
                }}
                aria-label="Save your answer"
              >
                <Save size={15} /> Save Answer
              </button>
            </div>

            {/* Navigation: Previous / Next or Finish */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1rem",
                borderTop: "1px solid var(--mm-border)",
                marginTop: "auto",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)" }}>
                Step 4 of 5 · Live Session
              </span>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                {/* Previous — disabled on first question */}
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={progress.isFirst}
                  className="mm-btn mm-btn-secondary"
                  style={{
                    opacity: progress.isFirst ? 0.35 : 1,
                    cursor: progress.isFirst ? "not-allowed" : "pointer",
                  }}
                  aria-label="Go to previous question"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {/* Next / Finish */}
                {progress.isLast ? (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="mm-btn mm-btn-primary"
                    aria-label="Finish the interview and view feedback"
                  >
                    Finish Interview <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="mm-btn mm-btn-primary"
                    aria-label="Go to next question"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
