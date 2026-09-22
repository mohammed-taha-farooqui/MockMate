import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * ErrorMessage.jsx
 * Reusable error display component.
 *
 * Props:
 *  - title:   short error heading (default "Something went wrong")
 *  - message: detailed error text
 *  - onRetry: optional callback — shows a Retry button when provided
 *  - compact: boolean — smaller inline variant
 */
export default function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  compact = false,
}) {
  if (compact) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.625rem",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "var(--mm-danger)",
          fontSize: "0.875rem",
        }}
      >
        <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
        <span>{message || title}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--mm-danger)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0 0.25rem",
              flexShrink: 0,
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem",
        borderRadius: "1rem",
        background: "rgba(239,68,68,0.07)",
        border: "1px solid rgba(239,68,68,0.2)",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--mm-danger)",
        }}
      >
        <AlertCircle size={26} />
      </div>
      <div>
        <h3
          style={{
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "var(--mm-text-primary)",
            marginBottom: "0.375rem",
          }}
        >
          {title}
        </h3>
        {message && (
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {message}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mm-btn mm-btn-secondary"
          style={{ fontSize: "0.875rem" }}
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}
