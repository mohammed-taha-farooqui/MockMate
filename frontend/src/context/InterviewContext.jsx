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

  // Match result from POST /api/match
  const [matchResult, setMatchResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.matchResult || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Current interview ID from POST /api/interview/create
  const [interviewId, setInterviewId] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.interviewId || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Interview questions saved in DB
  const [interviewQuestions, setInterviewQuestions] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.interviewQuestions || [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Live session scoring results
  const [sessionResults, setSessionResults] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.sessionResults || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Final aggregated report
  const [reportData, setReportData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.reportData || null;
      }
    } catch {
      // ignore
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
        resumeId,
        extractedFields,
        matchResult,
        interviewId,
        interviewQuestions,
        sessionResults,
        reportData,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to persist setup data to sessionStorage:", e);
    }
  }, [candidate, resume, job, resumeId, extractedFields, matchResult, interviewId, interviewQuestions, sessionResults, reportData]);

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
    matchResult: matchResultData,
    interviewId: interviewIdData,
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

    if (resumeIdData !== undefined) {
      setResumeId(resumeIdData);
    }

    if (extractedFieldsData !== undefined) {
      setExtractedFields(extractedFieldsData);
    }

    if (matchResultData !== undefined) {
      setMatchResult(matchResultData);
    }

    if (interviewIdData !== undefined) {
      setInterviewId(interviewIdData);
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
    setMatchResult(null);
    setInterviewId(null);
    setInterviewQuestions([]);
    setSessionResults(null);
    setReportData(null);
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
    resumeId,
    setResumeId,
    extractedFields,
    setExtractedFields,
    matchResult,
    setMatchResult,
    interviewId,
    setInterviewId,
    interviewQuestions,
    setInterviewQuestions,
    sessionResults,
    setSessionResults,
    reportData,
    setReportData,
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
