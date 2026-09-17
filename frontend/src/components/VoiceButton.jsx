import { Mic, MicOff, Loader2 } from "lucide-react";

/**
 * VoiceButton.jsx
 * Reusable microphone button for voice recording UI.
 *
 * Props:
 *  - isRecording: boolean — true while actively recording
 *  - isLoading:   boolean — processing / waiting state
 *  - disabled:    boolean — prevents interaction
 *  - onClick:     callback to toggle recording
 *  - size:        "sm" | "md" | "lg" (default "md")
 *
 * Note: does NOT implement actual MediaRecorder logic.
 * The parent page is responsible for audio capture.
 */
export default function VoiceButton({
  isRecording = false,
  isLoading = false,
  disabled = false,
  onClick,
  size = "md",
}) {
  const dim = { sm: 56, md: 80, lg: 112 }[size] ?? 80;
  const iconSize = { sm: 22, md: 32, lg: 44 }[size] ?? 32;

  /* Colour and label logic */
  let bg, border, iconColour, label, ringColour;
  if (isLoading) {
    bg = "var(--mm-bg-card)";
    border = "var(--mm-border)";
    iconColour = "var(--mm-text-muted)";
    ringColour = "transparent";
    label = "Processing\u2026";
  } else if (isRecording) {
    bg = "rgba(239,68,68,0.15)";
    border = "var(--mm-danger)";
    iconColour = "var(--mm-danger)";
    ringColour = "rgba(239,68,68,0.25)";
    label = "Recording — tap to stop";
  } else {
    bg = "rgba(99,102,241,0.12)";
    border = "var(--mm-accent)";
    iconColour = "var(--mm-accent-glow)";
    ringColour = "rgba(99,102,241,0.2)";
    label = "Tap to record your answer";
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Pulse ring — shown while recording */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isRecording && (
          <>
            <span
              style={{
                position: "absolute",
                width: dim + 24,
                height: dim + 24,
                borderRadius: "50%",
                background: ringColour,
                animation: "mm-voice-pulse 1.6s ease-out infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                width: dim + 44,
                height: dim + 44,
                borderRadius: "50%",
                background: ringColour,
                opacity: 0.5,
                animation: "mm-voice-pulse 1.6s ease-out 0.4s infinite",
              }}
            />
          </>
        )}

        <button
          aria-label={label}
          aria-pressed={isRecording}
          disabled={disabled || isLoading}
          onClick={onClick}
          style={{
            position: "relative",
            zIndex: 1,
            width: dim,
            height: dim,
            borderRadius: "50%",
            border: `2px solid ${border}`,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: disabled || isLoading ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.25s ease",
            outline: "none",
            boxShadow: isRecording
              ? `0 0 0 4px rgba(239,68,68,0.15), 0 8px 32px rgba(239,68,68,0.2)`
              : `0 0 0 4px rgba(99,102,241,0.1), 0 8px 24px rgba(99,102,241,0.15)`,
          }}
        >
          {isLoading ? (
            <Loader2 size={iconSize} color={iconColour} style={{ animation: "mm-spin 0.8s linear infinite" }} />
          ) : isRecording ? (
            <MicOff size={iconSize} color={iconColour} />
          ) : (
            <Mic size={iconSize} color={iconColour} />
          )}
        </button>
      </div>

      {/* Status label */}
      <p
        style={{
          fontSize: "0.8125rem",
          color: isRecording ? "var(--mm-danger)" : "var(--mm-text-muted)",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </p>
    </div>
  );
}
