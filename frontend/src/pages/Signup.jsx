import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, UserPlus, Info } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

// When VITE_AUTH_ENABLED=false, signup still renders but shows a dev banner
// instead of misleading error messages from an unavailable backend.
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true";

/**
 * Signup.jsx — Candidate-only registration page.
 *
 * Controlled by VITE_AUTH_ENABLED:
 *   false → shows a dev-mode notice; form visible but submit shows an info message.
 *   true  → full signup flow calling AuthContext.signup() → authService → backend.
 *
 * Fields: Full Name, Email, Password, Confirm Password
 * Links: Home (/), Login (/login)
 */
export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading: authLoading } = useAuthContext();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Validation ─── */
  function validate() {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    return e;
  }

  /* ─── Submit ─── */
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

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
    const result = await signup(form.name.trim(), form.email.trim(), form.password);
    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } else {
      setServerError(result.error);
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((err) => ({ ...err, [field]: "" }));
    };
  }

  const isLoading = submitting || authLoading;

  /* ─── Password strength ─── */
  const passLen = form.password.length;
  const passStrength = passLen === 0 ? 0 : passLen < 8 ? 1 : passLen < 12 ? 2 : 3;
  const strengthColour = ["transparent", "#ef4444", "#f59e0b", "#10b981"][passStrength];
  const strengthLabel  = ["", "Weak", "Good", "Strong"][passStrength];

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
          maxWidth: 460,
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
            Create Your Account
          </h1>
          <p style={{ color: "var(--mm-text-muted)", fontSize: "0.9375rem" }}>
            Start practicing interviews with AI today
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

          {/* Server / info error */}
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

          {/* Success message */}
          {success && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "0.625rem",
                padding: "0.875rem 1rem",
                marginBottom: "1.25rem",
                color: "#6ee7b7",
                fontSize: "0.875rem",
              }}
            >
              <CheckCircle2 size={16} />
              <span>Account created! Redirecting…</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--mm-text-muted)", marginBottom: "0.375rem" }}
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                value={form.name}
                disabled={isLoading}
                onChange={handleChange("name")}
                style={inputStyle(!!errors.name)}
                onFocus={(e) => (e.target.style.borderColor = errors.name ? "var(--mm-danger)" : "var(--mm-accent)")}
                onBlur={(e) => (e.target.style.borderColor = errors.name ? "var(--mm-danger)" : "var(--mm-border)")}
              />
              {errors.name && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--mm-text-muted)", marginBottom: "0.375rem" }}
              >
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                disabled={isLoading}
                onChange={handleChange("email")}
                style={inputStyle(!!errors.email)}
                onFocus={(e) => (e.target.style.borderColor = errors.email ? "var(--mm-danger)" : "var(--mm-accent)")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "var(--mm-danger)" : "var(--mm-border)")}
              />
              {errors.email && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--mm-text-muted)", marginBottom: "0.375rem" }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  disabled={isLoading}
                  onChange={handleChange("password")}
                  style={{ ...inputStyle(!!errors.password), paddingRight: "2.75rem" }}
                  onFocus={(e) => (e.target.style.borderColor = errors.password ? "var(--mm-danger)" : "var(--mm-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "var(--mm-danger)" : "var(--mm-border)")}
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--mm-text-faint)", cursor: "pointer",
                    padding: "0.25rem", display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: "0.4rem" }}>
                  <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.25rem" }}>
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: passStrength >= lvl ? strengthColour : "var(--mm-border)",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: strengthColour }}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--mm-text-muted)", marginBottom: "0.375rem" }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  disabled={isLoading}
                  onChange={handleChange("confirmPassword")}
                  style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: "2.75rem" }}
                  onFocus={(e) => (e.target.style.borderColor = errors.confirmPassword ? "var(--mm-danger)" : "var(--mm-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? "var(--mm-danger)" : "var(--mm-border)")}
                />
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--mm-text-faint)", cursor: "pointer",
                    padding: "0.25rem", display: "flex", alignItems: "center",
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ color: "var(--mm-danger)", fontSize: "0.8125rem", marginTop: "0.3rem" }}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading || success}
              className="mm-btn mm-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.875rem",
                fontSize: "1rem",
                marginTop: "0.375rem",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: "mm-spin 0.8s linear infinite" }} />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--mm-border)" }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--mm-text-faint)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--mm-border)" }} />
          </div>

          {/* Login link */}
          <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "var(--mm-text-muted)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--mm-accent-glow)", fontWeight: 600, textDecoration: "none" }}
            >
              Login
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem" }}>
          <Link to="/" style={{ color: "var(--mm-text-faint)", textDecoration: "none" }}>
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
