import axios from "axios";

/**
 * Reusable Axios instance for all MockMate API calls.
 *
 * Base URL is set from the VITE_API_BASE_URL environment variable.
 * Never hard-code backend URLs inside individual components.
 *
 * Usage:
 *   import api from "../services/api";
 *   const response = await api.get("/sessions");
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ─── Request Interceptor ─── */
api.interceptors.request.use(
  (config) => {
    // Attach auth token here when authentication is added
    // const token = localStorage.getItem("mm_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response Interceptor ─── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralised error handling (e.g. 401 redirect, toast notification)
    if (error.response) {
      console.error("[API Error]", error.response.status, error.response.data);
    } else {
      console.error("[API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
