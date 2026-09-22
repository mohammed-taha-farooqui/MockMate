/**
 * mockProgress.js
 * ────────────────────────────────────────────────────────────────────
 * MOCK / DEVELOPMENT DATA — NOT REAL BACKEND DATA
 * ────────────────────────────────────────────────────────────────────
 * This file contains realistic placeholder progress and performance data
 * for the Progress page (Task 12) while the backend progress tracking API
 * is in development.
 *
 * NOTE: When the real backend progress API is ready, replace imports of
 * this mock data with an API call (e.g. via progressService).
 */

export const mockProgress = {
  // Summary metrics
  totalInterviews: 6,
  completedInterviews: 5,
  averageScore: 73,
  latestScore: 74,

  // Historical scores over time (ordered chronologically)
  scoreHistory: [
    {
      interviewId: "sess-001",
      role: "Junior Web Developer",
      date: "Sep 01, 2026",
      score: 62,
    },
    {
      interviewId: "sess-002",
      role: "Frontend Engineer (React)",
      date: "Sep 05, 2026",
      score: 68,
    },
    {
      interviewId: "sess-003",
      role: "Full Stack JavaScript Developer",
      date: "Sep 10, 2026",
      score: 71,
    },
    {
      interviewId: "sess-004",
      role: "Frontend Engineer (React)",
      date: "Sep 14, 2026",
      score: 80,
    },
    {
      interviewId: "sess-005",
      role: "Frontend Engineer (React)",
      date: "Sep 19, 2026",
      score: 74,
    },
  ],

  // Skill category progress metrics
  skillProgress: [
    {
      skill: "Communication",
      score: 82,
      improvement: "+8",
      status: "Strong",
    },
    {
      skill: "Technical Skills",
      score: 72,
      improvement: "+12",
      status: "Good",
    },
    {
      skill: "Problem Solving",
      score: 76,
      improvement: "+6",
      status: "Good",
    },
    {
      skill: "React Architecture",
      score: 75,
      improvement: "+10",
      status: "Good",
    },
    {
      skill: "System Design",
      score: 58,
      improvement: "+4",
      status: "Needs Work",
    },
  ],

  // Recent interview sessions (ordered latest first)
  recentInterviews: [
    {
      interviewId: "sess-005",
      role: "Frontend Engineer (React)",
      date: "Sep 19, 2026",
      score: 74,
      status: "Completed",
      hasReport: true,
    },
    {
      interviewId: "sess-004",
      role: "Frontend Engineer (React)",
      date: "Sep 14, 2026",
      score: 80,
      status: "Completed",
      hasReport: true,
    },
    {
      interviewId: "sess-003",
      role: "Full Stack JavaScript Developer",
      date: "Sep 10, 2026",
      score: 71,
      status: "Completed",
      hasReport: true,
    },
    {
      interviewId: "sess-002",
      role: "Frontend Engineer (React)",
      date: "Sep 05, 2026",
      score: 68,
      status: "Completed",
      hasReport: true,
    },
    {
      interviewId: "sess-001",
      role: "Junior Web Developer",
      date: "Sep 01, 2026",
      score: 62,
      status: "Completed",
      hasReport: false,
    },
    {
      interviewId: "sess-006",
      role: "Full Stack Developer",
      date: "Sep 18, 2026",
      score: null,
      status: "Incomplete",
      hasReport: false,
    },
  ],
};

export default mockProgress;