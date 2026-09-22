/**
 * questionService.js
 * Service layer for fetching interview questions.
 *
 * Architecture:
 *   Interview.jsx  ──►  questionService.js  ──►  mockQuestions.js
 *
 * The service deliberately returns a Promise so that the calling component
 * is written for async data-fetching from day one. When Taha's backend
 * question-generation API is ready, only this file needs to change —
 * Interview.jsx and all other consumers remain untouched.
 *
 * NOTE: This service currently returns mock data only.
 *       No backend calls, no API keys, no ML scoring.
 */
import mockQuestions from "../data/mockQuestions";

/**
 * Retrieves the list of interview questions for the current session.
 *
 * Future replacement point: replace the body of this function with
 * an Axios call to POST /api/questions/generate (or equivalent)
 * and return response.data.questions.
 *
 * @returns {Promise<Array<{
 *   questionId: string,
 *   question:   string,
 *   skill:      string,
 *   difficulty: string,
 *   expectedTopics: string[]
 * }>>}
 */
export async function getInterviewQuestions() {
  // Simulate a realistic async round-trip (remove when wiring to real API)
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockQuestions;
}

export default { getInterviewQuestions };
