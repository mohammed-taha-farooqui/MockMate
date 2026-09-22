import { createContext, useContext, useState, useEffect } from "react";

/**
 * InterviewContext.jsx
 * Central state provider for candidate interview setup, session data, and progression.
 * Persists basic metadata across browser refreshes using sessionStorage.
 */

const InterviewContext = createContext(null);

const STORAGE_KEY = "mockmate_candidate_setup";

export function InterviewProvider({ children }) {
  // Candidate info
  const [candidate, setCandidate] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.candidate || { name: "", email: "" };
      }
    } catch {
      // ignore storage parsing error
    }
    return { name: "", email: "" };
  });

  // Resume document
  const [resume, setResume] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.resume || { file: null, fileName: "", fileSize: 0, fileType: "" };
      }
    } catch {
      // ignore storage parsing error
    }
    return { file: null, fileName: "", fileSize: 0, fileType: "" };
  });

  // Target Job Description
  const [job, setJob] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.job || { jobDescription: "" };
      }
    } catch {
      // ignore storage parsing error
    }
    return { jobDescription: "" };
  });

  // Resume upload result from POST /api/resume/upload
  const [resumeId, setResumeId] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.resumeId || null;
      }
    } catch {
      // ignore storage parsing error
    }
    return null;
  });

  // Structured fields extracted by the backend resume parser
  const [extractedFields, setExtractedFields] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.extractedFields || null;
      }
    } catch {
      // ignore storage parsing error
    }
    return null;
  });

  // Synchronize serializable state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      const payload = {
        candidate,
        resume: {
          fileName: resume.fileName || (resume.file ? resume.file.name : ""),
          fileSize: resume.fileSize || (resume.file ? resume.file.size : 0),
          fileType: resume.fileType || (resume.file ? resume.file.type : ""),
        },
        job,
        // Store the real resumeId and extractedFields returned by the backend
        resumeId,
        extractedFields,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to persist setup data to sessionStorage:", e);
    }
  }, [candidate, resume, job, resumeId, extractedFields]);

  /**
   * Updates all setup fields simultaneously.
   * Optionally accepts resumeId and extractedFields from the backend response.
   */
  const setSetupData = ({
    candidate: candidateData,
    resume: resumeData,
    job: jobData,
    resumeId: resumeIdData,
    extractedFields: extractedFieldsData,
  }) => {
    if (candidateData) {
      setCandidate({
        name: candidateData.name || "",
        email: candidateData.email || "",
      });
    }

    if (resumeData) {
      const fileObj = resumeData.file || null;
      setResume({
        file: fileObj,
        fileName: resumeData.fileName || (fileObj ? fileObj.name : ""),
        fileSize: resumeData.fileSize || (fileObj ? fileObj.size : 0),
        fileType: resumeData.fileType || (fileObj ? fileObj.type : ""),
      });
    }

    if (jobData) {
      setJob({
        jobDescription: jobData.jobDescription || "",
      });
    }

    // Store the real resumeId returned by POST /api/resume/upload
    if (resumeIdData !== undefined) {
      setResumeId(resumeIdData);
    }

    // Store the extractedFields object exactly as returned by the backend
    if (extractedFieldsData !== undefined) {
      setExtractedFields(extractedFieldsData);
    }
  };

  /**
   * Resets candidate setup state, including API-returned fields.
   */
  const clearSetupData = () => {
    setCandidate({ name: "", email: "" });
    setResume({ file: null, fileName: "", fileSize: 0, fileType: "" });
    setJob({ jobDescription: "" });
    setResumeId(null);
    setExtractedFields(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const value = {
    candidate,
    setCandidate,
    resume,
    setResume,
    job,
    setJob,
    // Backend upload result — set by Setup.jsx after POST /api/resume/upload succeeds
    resumeId,
    setResumeId,
    extractedFields,
    setExtractedFields,
    setSetupData,
    clearSetupData,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

/**
 * Custom hook to consume the InterviewContext.
 */
export function useInterviewContext() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error(
      "useInterviewContext must be used within an InterviewProvider"
    );
  }
  return context;
}

export default InterviewContext;
