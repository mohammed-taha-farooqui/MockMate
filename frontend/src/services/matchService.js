import api from "./api";

/**
 * matchService.js
 * Isolated service for resume-to-job matching operations.
 * Prepared for the MockMate specification endpoint: POST /api/match.
 *
 * NOTE: The backend API is not yet running in this development phase.
 * Real network calls can be cleanly toggled on when the backend is deployed.
 */

/**
 * Initiates the semantic matching of candidate profile and job requirements.
 * @param {Object} params
 * @param {string} [params.resumeId] - Stored resume identifier
 * @param {string} params.jobDescription - Raw target job description text
 * @param {Object} [params.candidate] - Candidate metadata { name, email }
 * @returns {Promise<Object>} Match results and interview configuration profile
 */
export async function matchInterviewProfile({
  resumeId,
  jobDescription,
  candidate,
}) {
  const response = await api.post("/api/match", {
    resumeId,
    jobDescription: jobDescription?.trim(),
    candidate,
  });

  return response.data;
}

export default {
  matchInterviewProfile,
};
