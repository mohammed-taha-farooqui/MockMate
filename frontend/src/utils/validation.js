/**
 * validation.js
 * Centralized, reusable validation utilities for candidate setup and interview forms.
 */

// Maximum resume file size: 5 MB (in bytes)
export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Accepted resume extensions and MIME types
export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"];
export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword", // legacy doc sometimes delivered
];

/**
 * Validates candidate name.
 * @param {string} name
 * @returns {string|null} Error message or null if valid.
 */
export function validateCandidateName(name) {
  if (!name || typeof name !== "string") {
    return "Candidate name is required.";
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Candidate name cannot be empty.";
  }
  if (trimmed.length < 2) {
    return "Candidate name must be at least 2 characters.";
  }
  if (trimmed.length > 100) {
    return "Candidate name cannot exceed 100 characters.";
  }
  return null;
}

/**
 * Validates candidate email address format.
 * @param {string} email
 * @returns {string|null} Error message or null if valid.
 */
export function validateCandidateEmail(email) {
  if (!email || typeof email !== "string") {
    return "Candidate email is required.";
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return "Candidate email cannot be empty.";
  }
  // Standard robust email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address (e.g. candidate@example.com).";
  }
  return null;
}

/**
 * Validates resume file.
 * @param {File|null} file
 * @param {Object} [options]
 * @param {number} [options.maxSizeBytes]
 * @returns {string|null} Error message or null if valid.
 */
export function validateResumeFile(file, options = {}) {
  const maxSizeBytes = options.maxSizeBytes || MAX_RESUME_SIZE_BYTES;

  if (!file) {
    return "Resume is required. Please upload your resume in PDF or DOCX format.";
  }

  // Check file name & extension
  const fileName = file.name || "";
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  const isExtensionValid = ACCEPTED_RESUME_EXTENSIONS.includes(extension);

  // Check MIME type where browser provides it
  const fileType = file.type || "";
  const isMimeValid =
    !fileType || ACCEPTED_RESUME_MIME_TYPES.includes(fileType);

  if (!isExtensionValid || !isMimeValid) {
    return `Unsupported file format (${extension || "unknown"}). Only PDF and DOCX documents are accepted.`;
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    const actualMb = (file.size / (1024 * 1024)).toFixed(2);
    return `File is too large (${actualMb} MB). Maximum allowed size is ${maxMb} MB.`;
  }

  if (file.size === 0) {
    return "The selected file is empty. Please choose a valid document.";
  }

  return null;
}

/**
 * Validates job description text.
 * @param {string} jobDescription
 * @returns {string|null} Error message or null if valid.
 */
export function validateJobDescription(jobDescription) {
  if (!jobDescription || typeof jobDescription !== "string") {
    return "Job description is required. Please paste the job requirements.";
  }
  const trimmed = jobDescription.trim();
  if (trimmed.length === 0) {
    return "Job description cannot be empty.";
  }
  if (trimmed.length < 20) {
    return "Job description is too brief. Please provide more detail (at least 20 characters) for accurate AI question generation.";
  }
  return null;
}

/**
 * Validates the entire Candidate Setup form in one pass.
 * @param {Object} formData
 * @param {string} formData.candidateName
 * @param {string} formData.candidateEmail
 * @param {File|null} formData.resumeFile
 * @param {string} formData.jobDescription
 * @param {number} [formData.maxSizeBytes]
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateSetupForm({
  candidateName,
  candidateEmail,
  resumeFile,
  jobDescription,
  maxSizeBytes,
}) {
  const errors = {};

  const nameError = validateCandidateName(candidateName);
  if (nameError) errors.candidateName = nameError;

  const emailError = validateCandidateEmail(candidateEmail);
  if (emailError) errors.candidateEmail = emailError;

  const resumeError = validateResumeFile(resumeFile, { maxSizeBytes });
  if (resumeError) errors.resumeFile = resumeError;

  const jobDescError = validateJobDescription(jobDescription);
  if (jobDescError) errors.jobDescription = jobDescError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format bytes to readable string (e.g. "2.4 MB", "450 KB")
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
