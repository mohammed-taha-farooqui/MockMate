import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

/**
 * AuthContext.jsx
 * Central authentication state provider for MockMate candidate sessions.
 *
 * Provides:
 *   - currentUser    { name, email } | null
 *   - isAuthenticated boolean
 *   - loading        boolean  (true while restoring session from localStorage)
 *   - login(email, password)       async — calls authService.login
 *   - signup(name, email, password) async — calls authService.signup
 *   - logout()                      async — clears local state + token
 *
 * Storage:
 *   Token  → localStorage key "mm_auth_token"  (never the password)
 *   User   → localStorage key "mm_user"         (name + email only)
 *
 * On mount: restores session from localStorage if a saved token and user exist.
 * Page refresh does NOT lose authentication state.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until localStorage restore is done

  /* ─── Restore session on mount ─── */
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getSavedUser();

    if (token && savedUser) {
      // Token exists — treat the user as authenticated.
      // When the backend /api/auth/me endpoint is available, uncomment below
      // to validate the token server-side on startup:
      //
      // authService.getProfile()
      //   .then((profile) => { setCurrentUser(profile); })
      //   .catch(() => { authService.clearToken(); authService.clearUser(); })
      //   .finally(() => setLoading(false));
      setCurrentUser(savedUser);
    }

    setLoading(false);
  }, []);

  /* ─── login ─── */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      // data expected: { token, user: { name, email } }
      const token = data.token;
      const user  = data.user || { name: "", email };

      authService.saveToken(token);
      authService.saveUser(user);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 401
          ? "Invalid email or password."
          : error?.response?.status === 404
          ? "Authentication service is not yet available. Please try again later."
          : "Login failed. Please try again.");
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── signup ─── */
  const signup = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      // data expected: { token, user: { name, email } }
      const token = data.token;
      const user  = data.user || { name, email };

      authService.saveToken(token);
      authService.saveUser(user);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 409
          ? "An account with this email already exists."
          : error?.response?.status === 404
          ? "Registration service is not yet available. Please try again later."
          : "Registration failed. Please try again.");
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── logout ─── */
  const logout = useCallback(async () => {
    await authService.logoutFromServer(); // best-effort server call
    authService.clearToken();
    authService.clearUser();
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume AuthContext.
 * Must be used inside <AuthProvider>.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
