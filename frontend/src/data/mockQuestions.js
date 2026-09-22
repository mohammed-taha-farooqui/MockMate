/**
 * mockQuestions.js
 * Static mock interview questions for frontend development.
 * Each question follows the canonical schema used by questionService.js.
 *
 * This data is intentionally generic so it works as realistic placeholder
 * content while Taha's backend question-generation API is being built.
 *
 * Schema:
 *  {
 *    questionId:      string  — unique identifier (e.g. "q1")
 *    question:        string  — the full question text shown to the candidate
 *    skill:           string  — the primary skill being evaluated
 *    difficulty:      string  — "Easy" | "Medium" | "Hard"
 *    expectedTopics:  string[] — topics the ideal answer should cover
 *  }
 */
const mockQuestions = [
  {
    questionId: "q1",
    question: "Tell me about yourself and your professional background.",
    skill: "Communication",
    difficulty: "Easy",
    expectedTopics: [
      "educational background",
      "work experience",
      "core skills",
      "career goals",
    ],
  },
  {
    questionId: "q2",
    question:
      "Can you explain the difference between state and props in React, and how data flows between parent and child components?",
    skill: "React",
    difficulty: "Medium",
    expectedTopics: [
      "immutability of props",
      "local component state",
      "unidirectional data flow",
      "component re-rendering",
    ],
  },
  {
    questionId: "q3",
    question:
      "What is the difference between synchronous and asynchronous programming? Give an example of each.",
    skill: "JavaScript",
    difficulty: "Medium",
    expectedTopics: [
      "blocking vs non-blocking",
      "event loop",
      "callbacks or promises",
      "async/await",
    ],
  },
  {
    questionId: "q4",
    question:
      "Describe a challenging technical problem you faced and walk me through how you solved it.",
    skill: "Problem Solving",
    difficulty: "Medium",
    expectedTopics: [
      "problem identification",
      "debugging approach",
      "solution implemented",
      "outcome and learnings",
    ],
  },
  {
    questionId: "q5",
    question:
      "What are RESTful APIs? How would you design a simple REST endpoint for creating a new user?",
    skill: "Backend Concepts",
    difficulty: "Medium",
    expectedTopics: [
      "HTTP methods",
      "statelessness",
      "JSON request/response",
      "status codes",
      "endpoint design",
    ],
  },
  {
    questionId: "q6",
    question:
      "Explain the concept of Big O notation. What is the time complexity of binary search and why?",
    skill: "Data Structures & Algorithms",
    difficulty: "Hard",
    expectedTopics: [
      "time complexity definition",
      "O(log n) for binary search",
      "divide and conquer strategy",
      "comparison with linear search O(n)",
    ],
  },
  {
    questionId: "q7",
    question:
      "How would you approach optimising a slow-loading web page? List at least three techniques.",
    skill: "Web Performance",
    difficulty: "Medium",
    expectedTopics: [
      "lazy loading assets",
      "code splitting",
      "minimising render-blocking resources",
      "caching strategies",
      "image optimisation",
    ],
  },
  {
    questionId: "q8",
    question:
      "Tell me about a time you collaborated with a team on a difficult project. What was your role and how did you handle disagreements?",
    skill: "Teamwork",
    difficulty: "Easy",
    expectedTopics: [
      "team dynamics",
      "individual contribution",
      "conflict resolution",
      "communication",
      "project outcome",
    ],
  },
  {
    questionId: "q9",
    question:
      "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
    skill: "Databases",
    difficulty: "Medium",
    expectedTopics: [
      "relational vs document model",
      "schema flexibility",
      "scalability considerations",
      "consistency vs availability trade-offs",
    ],
  },
  {
    questionId: "q10",
    question:
      "Where do you see yourself professionally in the next three to five years, and how does this role fit into those goals?",
    skill: "Career Motivation",
    difficulty: "Easy",
    expectedTopics: [
      "career direction",
      "skill development goals",
      "alignment with role",
      "long-term vision",
    ],
  },
];

export default mockQuestions;
