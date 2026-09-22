import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * ProtectedRoute
 *
 * Wraps any route element that requires authentication.
 *
 * Behaviour is controlled by the VITE_AUTH_ENABLED environment variable:
 *
 *   VITE_AUTH_ENABLED=false  (default for development)
 *     → Authentication is bypassed. All protected routes render immediately.
 *       No fake login is performed. No backend calls are made.
 *       Use this when the backend auth service is not yet available.
 *
 *   VITE_AUTH_ENABLED=true   (production / when backend is ready)
 *     → Full auth guard is active:
 *         - While auth state is loading  → shows a spinner.
 *         - If authenticated             → renders the requested page.
 *         - If not authenticated        → redirects to /login, preserving
 *           the intended path in location.state.from.
 *
 * Usage in App.jsx:
 *   <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
 */

// Treat any value other than the string "true" as disabled.
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // ── Development bypass ──────────────────────────────────────────────────
  // When VITE_AUTH_ENABLED is not "true", skip all auth checks entirely.
  // This allows Tasks 5–9 to be developed and tested without a live backend.
  if (!AUTH_ENABLED) {
    return children;
  }

  // ── Production auth guard ────────────────────────────────────────────────
  // Only evaluated when VITE_AUTH_ENABLED=true
  return <AuthGuard location={location}>{children}</AuthGuard>;
}

/**
 * Separated so that useAuthContext() is never called when auth is disabled.
 * This avoids any side-effects from the context (e.g. loading spinners)
 * appearing during development mode.
 */
function AuthGuard({ children, location }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60dvh",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}
