/**
 * authService.js
 * Service layer for candidate authentication.
 *
 * Architecture:
 *   Login.jsx / Signup.jsx  ──►  AuthContext.jsx  ──►  authService.js  ──►  api.js
 *
 * Backend integration points are clearly marked with "BACKEND INTEGRATION POINT".
 * When Member A's auth endpoints are ready, ONLY this file needs to change —
 * Login.jsx, Signup.jsx, and AuthContext.jsx remain untouched.
 *
 * Current state: Backend endpoints not yet available.
 *   - login()  → POST /api/auth/login   (not yet live)
 *   - signup() → POST /api/auth/register (not yet live)
 *   - logout() → POST /api/auth/logout  (not yet live)
 *   - getProfile() → GET /api/auth/me   (not yet live)
 */
import api from "./api";

/* ─── Token / Session Helpers ─── */

const TOKEN_KEY = "mm_auth_token";
const USER_KEY  = "mm_user";

/**
 * Persist the auth token returned by the backend.
 * Only the token is stored — never the password.
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Persist safe user profile fields (name + email, no password).
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify({ id: user?.id || user?._id || "", name: user?.name || "", email: user?.email || "" }));
}

export function getSavedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/* ─── Auth API Calls ─── */

/**
 * Candidate login.
 *
 * BACKEND INTEGRATION POINT:
 *   Replace the body of this function with:
 *     const response = await api.post("/api/auth/login", { email, password });
 *     return response.data; // { token, user: { name, email } }
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: { name: string, email: string } }>}
 */
export async function login(email, password) {
  // BACKEND INTEGRATION POINT ▼
  const response = await api.post("/api/auth/login", { email, password });
  return response.data; // expected: { token, user: { name, email } }
}

/**
 * Candidate registration.
 *
 * BACKEND INTEGRATION POINT:
 *   Replace the body of this function with:
 *     const response = await api.post("/api/auth/register", { name, email, password });
 *     return response.data; // { token, user: { name, email } }
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: { name: string, email: string } }>}
 */
export async function signup(name, email, password) {
  // BACKEND INTEGRATION POINT ▼
  const response = await api.post("/api/auth/register", { name, email, password });
  return response.data; // expected: { token, user: { name, email } }
}

/**
 * Server-side logout (invalidates token on backend).
 *
 * BACKEND INTEGRATION POINT:
 *   const token = getToken();
 *   await api.post("/api/auth/logout", {}, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 */
export async function logoutFromServer() {
  // BACKEND INTEGRATION POINT ▼
  try {
    await api.post("/api/auth/logout");
  } catch {
    // Ignore server errors on logout — local state is cleared regardless
  }
}

/**
 * Fetch the current authenticated user profile.
 *
 * BACKEND INTEGRATION POINT:
 *   const response = await api.get("/api/auth/me");
 *   return response.data; // { name, email }
 *
 * @returns {Promise<{ name: string, email: string }>}
 */
export async function getProfile() {
  // BACKEND INTEGRATION POINT ▼
  const response = await api.get("/api/auth/me");
  return response.data;
}

const authService = { login, signup, logoutFromServer, getProfile, saveToken, getToken, clearToken, saveUser, getSavedUser, clearUser };
export default authService;
