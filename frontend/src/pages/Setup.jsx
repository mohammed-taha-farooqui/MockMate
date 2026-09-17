import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useInterviewContext } from "../context/InterviewContext";
import {
  validateCandidateName,
  validateCandidateEmail,
  validateResumeFile,
  validateJobDescription,
  validateSetupForm,
  formatFileSize,
  MAX_RESUME_SIZE_BYTES,
  ACCEPTED_RESUME_EXTENSIONS,
} from "../utils/validation";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Setup() {
  const navigate = useNavigate();
  const { candidate, resume, job, setSetupData } = useInterviewContext();

  // Controlled form state (pre-filled from context/sessionStorage if previously set)
  const [candidateName, setCandidateName] = useState(candidate?.name || "");
  const [candidateEmail, setCandidateEmail] = useState(candidate?.email || "");
  const [resumeFile, setResumeFile] = useState(resume?.file || null);
  const [resumeMeta, setResumeMeta] = useState({
    fileName: resume?.fileName || "",
    fileSize: resume?.fileSize || 0,
    fileType: resume?.fileType || "",
  });
  const [jobDescription, setJobDescription] = useState(job?.jobDescription || "");

  // Validation & interaction state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fileInputRef = useRef(null);

  // ----------------------------------------------------
  // Field Change Handlers with live error clearing
  // ----------------------------------------------------
  const handleNameChange = (e) => {
    const val = e.target.value;
    setCandidateName(val);
    if (touched.candidateName) {
      setErrors((prev) => ({ ...prev, candidateName: validateCandidateName(val) }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setCandidateEmail(val);
    if (touched.candidateEmail) {
      setErrors((prev) => ({ ...prev, candidateEmail: validateCandidateEmail(val) }));
    }
  };

  const handleJobDescChange = (e) => {
    const val = e.target.value;
    setJobDescription(val);
    if (touched.jobDescription) {
      setErrors((prev) => ({ ...prev, jobDescription: validateJobDescription(val) }));
    }
  };

  // Blur triggers validation
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "candidateName") {
      setErrors((prev) => ({ ...prev, candidateName: validateCandidateName(candidateName) }));
    } else if (field === "candidateEmail") {
      setErrors((prev) => ({ ...prev, candidateEmail: validateCandidateEmail(candidateEmail) }));
    } else if (field === "jobDescription") {
      setErrors((prev) => ({ ...prev, jobDescription: validateJobDescription(jobDescription) }));
    }
  };

  // ----------------------------------------------------
  // Resume File Selection & Drag-and-Drop
  // ----------------------------------------------------
  const processSelectedFile = (file) => {
    setTouched((prev) => ({ ...prev, resumeFile: true }));
    const error = validateResumeFile(file, { maxSizeBytes: MAX_RESUME_SIZE_BYTES });

    if (error) {
      setErrors((prev) => ({ ...prev, resumeFile: error }));
      setResumeFile(null);
      setResumeMeta({ fileName: "", fileSize: 0, fileType: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Valid file
    setErrors((prev) => ({ ...prev, resumeFile: null }));
    setResumeFile(file);
    setResumeMeta({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || file.name.slice(file.name.lastIndexOf(".")),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || null;
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeMeta({ fileName: "", fileSize: 0, fileType: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((prev) => ({ ...prev, resumeFile: "Resume is required. Please upload your resume in PDF or DOCX format." }));
  };

  // ----------------------------------------------------
  // Form Submission
  // ----------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Run complete form validation
    const { isValid, errors: validationErrors } = validateSetupForm({
      candidateName,
      candidateEmail,
      resumeFile: resumeFile || (resumeMeta.fileName ? { name: resumeMeta.fileName, size: resumeMeta.fileSize } : null),
      jobDescription,
      maxSizeBytes: MAX_RESUME_SIZE_BYTES,
    });

    setTouched({
      candidateName: true,
      candidateEmail: true,
      resumeFile: true,
      jobDescription: true,
    });

    if (!isValid) {
      setErrors(validationErrors);
      // Scroll to the top or first error if needed
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Save to InterviewContext & sessionStorage
    setSetupData({
      candidate: {
        name: candidateName.trim(),
        email: candidateEmail.trim(),
      },
      resume: {
        file: resumeFile,
        fileName: resumeMeta.fileName,
        fileSize: resumeMeta.fileSize,
        fileType: resumeMeta.fileType,
      },
      job: {
        jobDescription: jobDescription.trim(),
      },
    });

    // Development mode simulation: smooth UX transition before navigating to match result
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/match-result");
    }, 600);
  };

  const hasSelectedFile = Boolean(resumeFile || resumeMeta.fileName);

  return (
    <div className="mm-page" style={{ justifyContent: "flex-start", paddingTop: "2rem" }}>
      <div className="mm-container" style={{ maxWidth: 840 }}>
        {/* Navigation & Step Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--mm-text-muted)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <span className="mm-badge mm-badge-accent">Step 1 of 5 · Candidate Setup</span>
        </div>

        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              marginBottom: "0.5rem",
              letterSpacing: "-0.03em",
            }}
          >
            Interview <span className="mm-gradient-text">Setup</span>
          </h1>
          <p
            style={{
              color: "var(--mm-text-muted)",
              fontSize: "1.0625rem",
              maxWidth: 580,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Provide your candidate details, upload your resume, and paste the target job
            description to generate a tailored voice interview.
          </p>
        </div>

        {/* Architecture Flow Banner: Resume + JD + Info -> Start */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.75rem",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            marginBottom: "2rem",
            flexWrap: "wrap",
            fontSize: "0.85rem",
            color: "var(--mm-text-muted)",
          }}
        >
          <span style={{ color: "var(--mm-text-primary)", fontWeight: 600 }}>1. Info</span>
          <span style={{ color: "var(--mm-accent-glow)" }}>+</span>
          <span style={{ color: "var(--mm-text-primary)", fontWeight: 600 }}>2. Resume</span>
          <span style={{ color: "var(--mm-accent-glow)" }}>+</span>
          <span style={{ color: "var(--mm-text-primary)", fontWeight: 600 }}>3. Job Description</span>
          <span style={{ color: "var(--mm-accent-glow)" }}>→</span>
          <span style={{ color: "var(--mm-success)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <Sparkles size={14} /> AI Tailored Interview
          </span>
        </div>

        {/* Global Submit Error if any */}
        {submitError && (
          <div style={{ marginBottom: "1.5rem" }}>
            <ErrorMessage
              compact
              title="Submission Failed"
              message={submitError}
            />
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* ---------------------------------------------------- */}
            {/* SECTION 1: CANDIDATE INFORMATION                     */}
            {/* ---------------------------------------------------- */}
            <div className="mm-card" style={{ padding: "1.75rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                  borderBottom: "1px solid var(--mm-border)",
                  paddingBottom: "0.75rem",
                }}
              >
                <User size={18} color="var(--mm-accent-glow)" />
                <h2 style={{ fontSize: "1.125rem", margin: 0, fontWeight: 700 }}>
                  Candidate Information
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {/* Candidate Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    htmlFor="candidate-name"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--mm-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    Full Name <span style={{ color: "var(--mm-danger)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="candidate-name"
                      type="text"
                      value={candidateName}
                      onChange={handleNameChange}
                      onBlur={() => handleBlur("candidateName")}
                      placeholder="e.g. Jane Doe"
                      disabled={isSubmitting}
                      aria-required="true"
                      aria-invalid={Boolean(errors.candidateName)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        background: "var(--mm-bg-surface)",
                        border: `1.5px solid ${
                          errors.candidateName
                            ? "var(--mm-danger)"
                            : "var(--mm-border)"
                        }`,
                        color: "var(--mm-text-primary)",
                        fontSize: "0.9375rem",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                    />
                  </div>
                  {errors.candidateName && (
                    <p
                      role="alert"
                      style={{
                        color: "var(--mm-danger)",
                        fontSize: "0.8rem",
                        margin: "0.15rem 0 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <AlertCircle size={13} /> {errors.candidateName}
                    </p>
                  )}
                </div>

                {/* Candidate Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    htmlFor="candidate-email"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--mm-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    Email Address <span style={{ color: "var(--mm-danger)" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="candidate-email"
                      type="email"
                      value={candidateEmail}
                      onChange={handleEmailChange}
                      onBlur={() => handleBlur("candidateEmail")}
                      placeholder="e.g. jane.doe@example.com"
                      disabled={isSubmitting}
                      aria-required="true"
                      aria-invalid={Boolean(errors.candidateEmail)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.5rem",
                        background: "var(--mm-bg-surface)",
                        border: `1.5px solid ${
                          errors.candidateEmail
                            ? "var(--mm-danger)"
                            : "var(--mm-border)"
                        }`,
                        color: "var(--mm-text-primary)",
                        fontSize: "0.9375rem",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                    />
                  </div>
                  {errors.candidateEmail && (
                    <p
                      role="alert"
                      style={{
                        color: "var(--mm-danger)",
                        fontSize: "0.8rem",
                        margin: "0.15rem 0 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <AlertCircle size={13} /> {errors.candidateEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 2: RESUME UPLOAD                             */}
            {/* ---------------------------------------------------- */}
            <div className="mm-card" style={{ padding: "1.75rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                  borderBottom: "1px solid var(--mm-border)",
                  paddingBottom: "0.75rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={18} color="var(--mm-accent-glow)" />
                  <h2 style={{ fontSize: "1.125rem", margin: 0, fontWeight: 700 }}>
                    Resume Document <span style={{ color: "var(--mm-danger)" }}>*</span>
                  </h2>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--mm-text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--mm-border)",
                      borderRadius: "0.25rem",
                      padding: "0.15rem 0.45rem",
                    }}
                  >
                    PDF
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--mm-text-muted)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--mm-border)",
                      borderRadius: "0.25rem",
                      padding: "0.15rem 0.45rem",
                    }}
                  >
                    DOCX
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--mm-text-faint)",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--mm-border)",
                      borderRadius: "0.25rem",
                      padding: "0.15rem 0.45rem",
                    }}
                  >
                    Max 5 MB
                  </span>
                </div>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                id="resume-file-input"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                disabled={isSubmitting}
                style={{ display: "none" }}
              />

              {/* Upload Drop Zone / Selected File Card */}
              {!hasSelectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  style={{
                    borderRadius: "0.75rem",
                    border: `2px dashed ${
                      errors.resumeFile
                        ? "var(--mm-danger)"
                        : isDragging
                        ? "var(--mm-accent-glow)"
                        : "var(--mm-border)"
                    }`,
                    background: isDragging
                      ? "rgba(99, 102, 241, 0.1)"
                      : "rgba(255, 255, 255, 0.02)",
                    padding: "2.5rem 1.5rem",
                    textAlign: "center",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--mm-accent-glow)",
                    }}
                  >
                    <UploadCloud size={26} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--mm-text-primary)",
                        margin: 0,
                      }}
                    >
                      Click to upload or drag & drop your resume
                    </p>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--mm-text-muted)",
                        margin: "0.25rem 0 0",
                      }}
                    >
                      Supports PDF and DOCX files up to 5 MB
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File Display Card */
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderRadius: "0.75rem",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "0.5rem",
                        background: "rgba(99, 102, 241, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--mm-accent-glow)",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            color: "var(--mm-text-primary)",
                            wordBreak: "break-all",
                          }}
                        >
                          {resumeMeta.fileName || "Uploaded Resume"}
                        </span>
                        <CheckCircle2 size={16} color="var(--mm-success)" />
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--mm-text-muted)",
                        }}
                      >
                        {formatFileSize(resumeMeta.fileSize)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="mm-btn mm-btn-secondary"
                      style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      aria-label="Remove resume file"
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "0.5rem",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--mm-danger)",
                        transition: "background 0.2s",
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Resume validation error */}
              {errors.resumeFile && (
                <p
                  role="alert"
                  style={{
                    color: "var(--mm-danger)",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <AlertCircle size={13} /> {errors.resumeFile}
                </p>
              )}
            </div>

            {/* ---------------------------------------------------- */}
            {/* SECTION 3: JOB DESCRIPTION                           */}
            {/* ---------------------------------------------------- */}
            <div className="mm-card" style={{ padding: "1.75rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                  borderBottom: "1px solid var(--mm-border)",
                  paddingBottom: "0.75rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Briefcase size={18} color="var(--mm-accent-glow)" />
                  <h2 style={{ fontSize: "1.125rem", margin: 0, fontWeight: 700 }}>
                    Target Job Description <span style={{ color: "var(--mm-danger)" }}>*</span>
                  </h2>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--mm-text-faint)" }}>
                  {jobDescription.length} characters
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label
                  htmlFor="job-description-input"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--mm-text-muted)",
                  }}
                >
                  Paste Job Responsibilities & Requirements
                </label>
                <textarea
                  id="job-description-input"
                  rows={8}
                  value={jobDescription}
                  onChange={handleJobDescChange}
                  onBlur={() => handleBlur("jobDescription")}
                  disabled={isSubmitting}
                  placeholder="Paste the full job posting or list the key requirements, tech stack, and responsibilities here...&#10;&#10;Example:&#10;We are seeking a Frontend Engineer proficient in React, modern JavaScript, and TailwindCSS. The candidate will design scalable UI architectures, integrate REST APIs, and optimize web performance."
                  aria-required="true"
                  aria-invalid={Boolean(errors.jobDescription)}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    borderRadius: "0.5rem",
                    background: "var(--mm-bg-surface)",
                    border: `1.5px solid ${
                      errors.jobDescription
                        ? "var(--mm-danger)"
                        : "var(--mm-border)"
                    }`,
                    color: "var(--mm-text-primary)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.65,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    transition: "border-color 0.2s",
                  }}
                />

                {errors.jobDescription ? (
                  <p
                    role="alert"
                    style={{
                      color: "var(--mm-danger)",
                      fontSize: "0.8rem",
                      margin: "0.15rem 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <AlertCircle size={13} /> {errors.jobDescription}
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--mm-text-faint)",
                      margin: "0.15rem 0 0",
                    }}
                  >
                    Tip: The more specific the requirements, the more realistic and tailored the AI interviewer&apos;s questions will be.
                  </p>
                )}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* SUBMIT BUTTON & CONTROLS                             */}
            {/* ---------------------------------------------------- */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "0.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <Link
                to="/"
                className="mm-btn mm-btn-secondary"
                style={{ padding: "0.75rem 1.5rem" }}
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mm-btn mm-btn-primary"
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.75 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Analyzing Setup...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Match Result</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
