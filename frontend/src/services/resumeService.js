import api from "./api";

/**
 * resumeService.js
 * Isolated service for resume upload operations.
 * Prepared for the MockMate specification endpoint: POST /api/resume/upload.
 *
 * NOTE: The backend API is not yet running in this development phase.
 * Real network calls can be cleanly toggled on when the backend is deployed.
 */

/**
 * Uploads candidate resume document (PDF / DOCX) to the backend.
 * @param {File} file - Validated resume File object
 * @param {Object} [candidateInfo] - Optional candidate name and email
 * @returns {Promise<Object>} Backend upload response (e.g. { resumeId, text, message })
 */
export async function uploadResume(file, candidateInfo = {}) {
  const formData = new FormData();
  formData.append("resume", file);

  if (candidateInfo.name) {
    formData.append("name", candidateInfo.name.trim());
  }
  if (candidateInfo.email) {
    formData.append("email", candidateInfo.email.trim());
  }

  const response = await api.post("/api/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export default {
  uploadResume,
};
