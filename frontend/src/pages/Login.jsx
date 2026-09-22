import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mic, Eye, EyeOff, Loader2, AlertCircle, LogIn, Info } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

// When VITE_AUTH_ENABLED=false, login still renders but shows a dev banner
// instead of misleading error messages from an unavailable backend.
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true";

/**
 * Login.jsx — Candidate-only login page.
 *
 * Controlled by VITE_AUTH_ENABLED:
 *   false → shows a dev-mode notice; form is still visible but submitting
 *           will display an informational message, not a backend error.
 *   true  → full login flow calling AuthContext.login() → authService → backend.
 *
 * Links: Home (/), Create Account (/signup)
 */
export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, loading: authLoading } = useAuthContext();

  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Validation ─── */
  function validate() {
    const e = {};
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    return e;
  }

  /* ─── Submit ─── */
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    // Development mode: auth backend is not available.
    // Show an informational message instead of a misleading failure.
    if (!AUTH_ENABLED) {
      setServerError(
        "\u{1F6E0}\uFE0F  Authentication is currently disabled for frontend development." +
        " Set VITE_AUTH_ENABLED=true in .env when the backend is ready."
      );
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const result = await login(form.email.trim(), form.password);
    setSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
    }
  }

  const isLoading = submitting || authLoading;

  /* ─── Input style ─── */
  const inputStyle = (hasError) => ({
    width: "100%",
    background: "rgba(10,13,20,0.6)",
    border: `1px solid ${hasError ? "var(--mm-danger)" : "var(--mm-border)"}`,
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    fontSize: "0.9375rem",
    color: "var(--mm-text-primary)",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-sans)",
  });

  return (
    <div className="mm-page" style={{ padding: "2rem 1.25rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          animation: "fadeSlideUp 0.4s ease both",
        }}
      >
        {/* ─── Logo ─── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              textDecoration: "none",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "0.75rem",
                background: "var(--mm-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}
            >
              <Mic size={22} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--mm-text-primary)",
              }}
            >
              Mock<span style={{ color: "var(--mm-accent-glow)" }}>Mate</span>
            </span>
          </Link>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem" }}>
            Sign in to continue your interview practice
          </p>
        </div>

        {/* ─── Card ─── */}
        <div
          className="mm-glass"
          style={{ padding: "2rem", borderRadius: "1.25rem" }}
        >
          {/* Dev-mode banner */}
          {!AUTH_ENABLED && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "0.625rem",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                color: "#fcd34d",
                fontSize: "0.8125rem",
                lineHeight: 1.55,
              }}
            >
              <Info size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>Dev mode</strong> — Authentication is disabled
                (<code>VITE_AUTH_ENABLED=false</code>). Protected routes
                are already open.{" "}
                <Link to="/setup" style={{ color: "#fbbf24" }}>Go to Interview Setup</Link>
              </span>
            </div>
          )}

          {/* Server / info message */}
          {serverError && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                background: AUTH_ENABLED ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                border: `1px solid ${AUTH_ENABLED ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)"}`,
                borderRadius: "0.625rem",
                padding: "0.875rem 1rem",
                marginBottom: "1.25rem",
                color: AUTH_ENABLED ? "#fca5a5" : "#a5b4fc",
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--mm-text-muted)",
                  marginBottom: "0.375rem",
                }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                disabled={isLoading}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((err) => ({ ...err, email: "" }));
                }}
                style={inputStyle(!!errors.email)}
                onFocus={(e) => (e.target.style.borderColor = errors.email ? "var(--mm-danger)" : "var(--mm-accent)")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "var(--mm-danger)" : "var(--mm-border)")}
              />
              {errors.email && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--mm-text-muted)",
                  marginBottom: "0.375rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    if (errors.password) setErrors((err) => ({ ...err, password: "" }));
                  }}
                  style={{ ...inputStyle(!!errors.password), paddingRight: "2.75rem" }}
                  onFocus={(e) => (e.target.style.borderColor = errors.password ? "var(--mm-danger)" : "var(--mm-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "var(--mm-danger)" : "var(--mm-border)")}
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--mm-text-faint)",
                    cursor: "pointer",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mm-btn mm-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.875rem",
                fontSize: "1rem",
                marginTop: "0.25rem",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: "mm-spin 0.8s linear infinite" }} />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.5rem 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--mm-border)" }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--mm-border)" }} />
          </div>

          {/* Create account link */}
          <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--mm-text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "var(--mm-accent-glow)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem" }}>
          <Link
            to="/"
            style={{ color: "var(--mm-text-faint)", textDecoration: "none" }}
          >
            ← Back to Home
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
