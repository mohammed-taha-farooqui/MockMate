import { useState } from "react";

/**
 * TextAnswerBox.jsx
 * Reusable textarea for candidate text answers.
 *
 * Props:
 *  - value:       controlled value
 *  - onChange:    (e) => void
 *  - placeholder: string
 *  - disabled:    boolean
 *  - maxLength:   number (default 1000)
 *  - rows:        number (default 5)
 *  - showCount:   boolean — show character counter (default true)
 *  - label:       optional label above textarea
 *
 * Does NOT submit data — parent is responsible for form handling.
 */
export default function TextAnswerBox({
  value = "",
  onChange,
  placeholder = "Type your answer here\u2026",
  disabled = false,
  maxLength = 1000,
  rows = 5,
  showCount = true,
  label,
}) {
  const [focused, setFocused] = useState(false);
  const count = value?.length ?? 0;
  const nearLimit = count >= maxLength * 0.85;
  const atLimit = count >= maxLength;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {label && (
        <label
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--mm-text-muted)",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          position: "relative",
          borderRadius: "0.75rem",
          border: `1.5px solid ${
            disabled
              ? "var(--mm-border)"
              : focused
              ? "var(--mm-accent)"
              : "var(--mm-border)"
          }`,
          background: disabled ? "rgba(255,255,255,0.02)" : "var(--mm-bg-card)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: focused && !disabled
            ? "0 0 0 3px rgba(99,102,241,0.15)"
            : "none",
        }}
      >
        <textarea
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "0.875rem 1rem",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "vertical",
            color: disabled ? "var(--mm-text-faint)" : "var(--mm-text-primary)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            fontFamily: "inherit",
            cursor: disabled ? "not-allowed" : "text",
            borderRadius: "0.75rem",
          }}
        />
      </div>

      {showCount && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span
            style={{
              fontSize: "0.75rem",
              color: atLimit
                ? "var(--mm-danger)"
                : nearLimit
                ? "var(--mm-warning)"
                : "var(--mm-text-faint)",
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.2s",
            }}
          >
            {count} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
