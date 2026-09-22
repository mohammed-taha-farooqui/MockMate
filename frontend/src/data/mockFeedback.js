/**
 * mockFeedback.js
 * ────────────────────────────────────────────────────────────────────
 * MOCK / DEVELOPMENT DATA — NOT AI-GENERATED
 * ────────────────────────────────────────────────────────────────────
 * This file contains realistic placeholder feedback data for the
 * Feedback page (Task 10) while the backend ML evaluation service
 * (Taha's scoring API) is being built.
 *
 * When the real backend is ready, replace this import in Feedback.jsx
 * with an API call to the feedback endpoint. This file will then be
 * deleted or archived.
 *
 * Structure mirrors the expected API response shape so the Feedback page
 * does NOT need to change when real data arrives.
 *
 * Schema:
 *   overallScore      number   — aggregate score out of 100
 *   summary           string   — one-paragraph performance summary
 *   strengths         string[] — session-level strengths
 *   improvementAreas  string[] — session-level improvement areas
 *   questionFeedback  Array<QuestionFeedback> — per-question breakdown
 *   followUp          Array<FollowUpTopic>    — recommended practice topics
 *
 * QuestionFeedback:
 *   questionId        string   — matches mockQuestions.js questionId
 *   question          string   — full question text
 *   skill             string   — skill category
 *   difficulty        string   — Easy | Medium | Hard
 *   candidateAnswer   string   — what the candidate said / typed
 *   score             number   — score for this question out of 10
 *   feedback          string   — overall feedback paragraph
 *   strengths         string[] — what was done well
 *   improvement       string   — one clear improvement suggestion
 *
 * FollowUpTopic:
 *   topic             string   — topic name
 *   reason            string   — why this was flagged
 *   resources         string[] — suggested practice areas
 */

const mockFeedback = {
  // ─── Overall session result ──────────────────────────────────────────
  overallScore: 74,

  summary:
    "You demonstrated a solid foundational understanding across communication, " +
    "React, and JavaScript concepts. Your answers were clear and structured on " +
    "the introductory and communication questions. Technical depth improved " +
    "considerably when discussing React component patterns, though some gaps " +
    "appeared in advanced JavaScript async concepts and algorithm analysis. " +
    "Overall a promising performance — focus on deepening your explanation of " +
    "trade-offs and providing concrete code examples in future sessions.",

  // ─── Session-level strengths ─────────────────────────────────────────
  strengths: [
    "Clear and confident communication throughout the session.",
    "Good structure — used the STAR method naturally for behavioural questions.",
    "Accurately differentiated between React state and props with practical examples.",
    "Demonstrated awareness of unidirectional data flow in React.",
    "Showed genuine enthusiasm and relevant career motivation.",
  ],

  // ─── Session-level improvement areas ────────────────────────────────
  improvementAreas: [
    "Deepen explanation of async/await and the JavaScript event loop.",
    "Provide Big O complexity analysis with concrete examples, not just definitions.",
    "Expand on database trade-offs — CAP theorem and consistency models were not addressed.",
    "Include actionable code snippets or pseudocode when describing technical solutions.",
    "Practise explaining architectural decisions concisely under time pressure.",
  ],

  // ─── Per-question feedback ───────────────────────────────────────────
  questionFeedback: [
    {
      questionId: "q1",
      question: "Tell me about yourself and your professional background.",
      skill: "Communication",
      difficulty: "Easy",
      candidateAnswer:
        "I'm a frontend developer with 2 years of experience building React applications. " +
        "I graduated with a Computer Science degree and have worked at a startup where I " +
        "built dashboards and internal tools. I'm looking to grow into a full-stack role.",
      score: 8,
      feedback:
        "A strong and well-structured introduction. You covered education, experience, " +
        "and career direction concisely. The mention of specific work (dashboards, internal tools) " +
        "adds credibility. To improve, briefly mention one key technical achievement or metric.",
      strengths: [
        "Covered all expected topics: education, experience, skills, and goals.",
        "Concise delivery — answered in under 90 seconds.",
        "Naturally transitioned to career motivation at the end.",
      ],
      improvement:
        "Add one specific, quantifiable achievement (e.g. 'improved dashboard load time by 40%') " +
        "to make the answer more memorable.",
    },
    {
      questionId: "q2",
      question:
        "Can you explain the difference between state and props in React, and how data flows between parent and child components?",
      skill: "React",
      difficulty: "Medium",
      candidateAnswer:
        "Props are read-only values passed from parent to child, while state is managed " +
        "inside the component and can change over time. When state changes, the component " +
        "re-renders. Data flows in one direction — from parent to child.",
      score: 7,
      feedback:
        "Solid foundational answer covering the key distinction and unidirectional flow. " +
        "The explanation of re-rendering was accurate. Missing discussion of prop drilling, " +
        "Context API, and React 18 automatic batching would have elevated the score further.",
      strengths: [
        "Correctly identified props as immutable and state as mutable.",
        "Explained unidirectional data flow clearly.",
        "Mentioned re-rendering as a consequence of state updates.",
      ],
      improvement:
        "Mention prop drilling as a common challenge and introduce Context API or state " +
        "management libraries (e.g., Zustand, Redux) as solutions for deeply nested components.",
    },
    {
      questionId: "q3",
      question:
        "What is the difference between synchronous and asynchronous programming? Give an example of each.",
      skill: "JavaScript",
      difficulty: "Medium",
      candidateAnswer:
        "Synchronous code runs line by line, blocking the next operation. Asynchronous code " +
        "allows operations to happen in the background — like fetching data from an API. " +
        "You can use callbacks, promises, or async/await for async operations.",
      score: 6,
      feedback:
        "The core distinction was correct and the real-world example of API fetching was " +
        "appropriate. However, the JavaScript event loop — the mechanism that makes async " +
        "possible — was not mentioned, nor was the difference between microtasks and macrotasks. " +
        "The answer stayed at a surface level without code examples.",
      strengths: [
        "Correctly defined blocking vs non-blocking execution.",
        "Listed three valid async patterns: callbacks, promises, async/await.",
        "Chose a relatable real-world example (API fetch).",
      ],
      improvement:
        "Explain the JavaScript event loop and the call stack briefly to show deeper understanding. " +
        "Demonstrate async/await with a short code snippet (e.g., fetching user data).",
    },
    {
      questionId: "q4",
      question:
        "Describe a challenging technical problem you faced and walk me through how you solved it.",
      skill: "Problem Solving",
      difficulty: "Medium",
      candidateAnswer:
        "I had a performance issue in a React dashboard where the page was re-rendering " +
        "too frequently. I used React DevTools to identify the bottleneck and then wrapped " +
        "expensive components in React.memo and used useCallback for event handlers. " +
        "The page became noticeably faster.",
      score: 8,
      feedback:
        "Excellent response using a realistic, relevant technical scenario. You clearly " +
        "identified the problem, described a systematic debugging approach, implemented a " +
        "targeted solution, and mentioned the measurable outcome. The use of tooling (DevTools) " +
        "demonstrates professional working habits.",
      strengths: [
        "Used the STAR structure naturally (Situation → Task → Action → Result).",
        "Mentioned specific tools: React DevTools.",
        "Named concrete React optimisation APIs: React.memo and useCallback.",
        "Described a verifiable, measurable outcome.",
      ],
      improvement:
        "Quantify the improvement where possible (e.g. 'reduced re-renders by 60%, page load from 2s to 0.8s') " +
        "and briefly describe what you learned for future projects.",
    },
    {
      questionId: "q5",
      question:
        "What are RESTful APIs? How would you design a simple REST endpoint for creating a new user?",
      skill: "Backend Concepts",
      difficulty: "Medium",
      candidateAnswer:
        "REST APIs use HTTP methods like GET, POST, PUT, DELETE to communicate with a server. " +
        "To create a user I'd use POST /users with a JSON body containing name and email. " +
        "The server would return a 201 status with the created user object.",
      score: 7,
      feedback:
        "Good practical answer — naming the HTTP method, URL pattern, request body, and " +
        "response status code is exactly what's expected. The answer would be stronger with " +
        "a mention of REST constraints (statelessness, resource-based URLs) and error handling " +
        "(e.g., 400 for validation failures, 409 for duplicate email).",
      strengths: [
        "Correctly used POST for resource creation and named the appropriate endpoint.",
        "Identified 201 as the correct success status code.",
        "Mentioned JSON as the data format.",
      ],
      improvement:
        "Add error handling status codes (400, 409, 500) and briefly mention REST constraints " +
        "such as statelessness and resource-based URL design to demonstrate deeper understanding.",
    },
  ],

  // ─── Follow-up recommendations ───────────────────────────────────────
  followUp: [
    {
      topic: "JavaScript Event Loop & Async Patterns",
      reason:
        "The async/await answer lacked depth on the event loop mechanism, " +
        "which is a frequent deep-dive in technical interviews.",
      resources: [
        "Practice explaining call stack, event queue, and microtask queue.",
        "Write examples using Promise.all, Promise.race, and async error handling.",
        "Study the difference between setTimeout (macrotask) and Promise.then (microtask).",
      ],
    },
    {
      topic: "React Advanced Patterns",
      reason:
        "Props and state were covered at a foundational level. Senior roles expect " +
        "discussion of Context, custom hooks, and performance patterns.",
      resources: [
        "Practice explaining Context API vs prop drilling trade-offs.",
        "Study useMemo, useCallback, and React.memo use cases.",
        "Explore React Query or Zustand for state management patterns.",
      ],
    },
    {
      topic: "Big O Notation & Algorithms",
      reason:
        "Algorithm complexity analysis (Q6) was not covered in this session " +
        "and is critical for technical screening rounds.",
      resources: [
        "Practice time and space complexity analysis for common data structures.",
        "Work through binary search, merge sort, and tree traversal examples.",
        "Use LeetCode Easy/Medium problems to build pattern recognition.",
      ],
    },
    {
      topic: "Database Trade-offs (SQL vs NoSQL)",
      reason:
        "System design and database selection questions are common in full-stack interviews. " +
        "Strengthening this area will improve overall score.",
      resources: [
        "Compare PostgreSQL (relational) vs MongoDB (document) for different use cases.",
        "Study CAP theorem and when to prioritise consistency vs availability.",
        "Practice explaining indexing and query optimisation basics.",
      ],
    },
  ],
};

export default mockFeedback;
