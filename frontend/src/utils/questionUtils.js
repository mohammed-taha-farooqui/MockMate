/**
 * questionUtils.js
 * Pure helper functions for working with the interview question array.
 * All functions are side-effect free and safe to use in any context.
 */

/**
 * Returns the question object at the given 0-based index.
 * Returns null if the array is empty or the index is out of range.
 *
 * @param {Array}  questions - The full question list
 * @param {number} index     - 0-based index
 * @returns {Object|null}
 */
export function getQuestionByIndex(questions, index) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  if (index < 0 || index >= questions.length) return null;
  return questions[index];
}

/**
 * Returns the total number of questions in the list.
 * Returns 0 for null, undefined, or non-array values.
 *
 * @param {Array} questions
 * @returns {number}
 */
export function getTotalQuestions(questions) {
  if (!Array.isArray(questions)) return 0;
  return questions.length;
}

/**
 * Returns a progress descriptor for the current question position.
 *
 * @param {number} currentIndex - 0-based current question index
 * @param {Array}  questions    - The full question list
 * @returns {{
 *   current:      number,  // 1-based display number
 *   total:        number,
 *   percentage:   number,  // 0–100 (rounded)
 *   isFirst:      boolean,
 *   isLast:       boolean,
 * }}
 */
export function getQuestionProgress(currentIndex, questions) {
  const total = getTotalQuestions(questions);

  if (total === 0) {
    return { current: 0, total: 0, percentage: 0, isFirst: true, isLast: true };
  }

  const safeIndex = Math.max(0, Math.min(currentIndex, total - 1));
  const current = safeIndex + 1; // 1-based for display

  return {
    current,
    total,
    percentage: Math.round((current / total) * 100),
    isFirst: safeIndex === 0,
    isLast: safeIndex === total - 1,
  };
}

/**
 * Returns a difficulty badge label and accent colour for a given difficulty string.
 * Useful for rendering coloured badges without scattering switch logic in components.
 *
 * @param {string} difficulty
 * @returns {{ label: string, color: string }}
 */
export function getDifficultyMeta(difficulty) {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":
      return { label: "Easy", color: "var(--mm-success)" };
    case "hard":
      return { label: "Hard", color: "var(--mm-danger)" };
    case "medium":
    default:
      return { label: "Medium", color: "var(--mm-warning)" };
  }
}
