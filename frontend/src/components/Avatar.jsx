import { Mic2, Sparkles } from "lucide-react";

/**
 * Avatar.jsx
 * Professional AI interviewer avatar area.
 * CSS-based — no paid APIs.
 *
 * Props:
 *  - name:      string — interviewer name (default "Alex")
 *  - role:      string — title/role label (default "AI Interviewer")
 *  - isSpeaking: boolean — show speaking animation ring
 *  - isListening: boolean — show listening indicator
 *  - size:       "sm" | "md" | "lg" (default "md")
 */
export default function Avatar({
  name = "Alex",
  role = "AI Interviewer",
  isSpeaking = false,
  isListening = false,
  size = "md",
}) {
  const dim = { sm: 72, md: 120, lg: 160 }[size] ?? 120;
  const fontSize = { sm: "1.75rem", md: "2.75rem", lg: "3.75rem" }[size] ?? "2.75rem";
  const nameFontSize = { sm: "0.875rem", md: "1rem", lg: "1.125rem" }[size] ?? "1rem";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* Gradient based on "Alex" → consistent purple tones */
  const gradient = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size === "sm" ? "0.5rem" : "0.875rem",
        userSelect: "none",
      }}
    >
      {/* Avatar circle with animated rings */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Outer speaking ring */}
        {isSpeaking && (
          <>
            <span
              style={{
                position: "absolute",
                width: dim + 20,
                height: dim + 20,
                borderRadius: "50%",
                border: "2px solid rgba(129,140,248,0.4)",
                animation: "mm-voice-pulse 1.4s ease-out infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                width: dim + 40,
                height: dim + 40,
                borderRadius: "50%",
                border: "2px solid rgba(129,140,248,0.2)",
                animation: "mm-voice-pulse 1.4s ease-out 0.35s infinite",
              }}
            />
          </>
        )}

        {/* Listening ring */}
        {isListening && !isSpeaking && (
          <span
            style={{
              position: "absolute",
              width: dim + 16,
              height: dim + 16,
              borderRadius: "50%",
              border: "2px solid rgba(16,185,129,0.5)",
              animation: "mm-voice-pulse 2s ease-out infinite",
            }}
          />
        )}

        {/* Main circle */}
        <div
          style={{
            width: dim,
            height: dim,
            borderRadius: "50%",
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.03em",
            boxShadow: "0 8px 32px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            border: "3px solid rgba(255,255,255,0.12)",
            position: "relative",
          }}
        >
          {initials}

          {/* Mic badge */}
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: Math.round(dim * 0.26),
              height: Math.round(dim * 0.26),
              borderRadius: "50%",
              background: isSpeaking ? "var(--mm-accent)" : "var(--mm-bg-surface)",
              border: "2px solid var(--mm-bg-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s ease",
            }}
          >
            {isSpeaking ? (
              <Sparkles size={Math.round(dim * 0.12)} color="#fff" />
            ) : (
              <Mic2 size={Math.round(dim * 0.12)} color="var(--mm-text-muted)" />
            )}
          </div>
        </div>
      </div>

      {/* Name + role */}
      {size !== "sm" && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: nameFontSize,
              fontWeight: 700,
              color: "var(--mm-text-primary)",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--mm-accent-glow)",
              fontWeight: 500,
              margin: "0.15rem 0 0",
              letterSpacing: "0.02em",
            }}
          >
            {role}
          </p>

          {/* Status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              marginTop: "0.5rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: isSpeaking
                ? "rgba(99,102,241,0.15)"
                : isListening
                ? "rgba(16,185,129,0.12)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                isSpeaking
                  ? "rgba(99,102,241,0.3)"
                  : isListening
                  ? "rgba(16,185,129,0.25)"
                  : "var(--mm-border)"
              }`,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: isSpeaking
                ? "var(--mm-accent-glow)"
                : isListening
                ? "var(--mm-success)"
                : "var(--mm-text-faint)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isSpeaking
                  ? "var(--mm-accent-glow)"
                  : isListening
                  ? "var(--mm-success)"
                  : "var(--mm-text-faint)",
                animation: isSpeaking || isListening ? "mm-voice-pulse 1.5s infinite" : "none",
              }}
            />
            {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
          </div>
        </div>
      )}
    </div>
  );
}
