/**
 * Cleans raw text extracted from a PDF resume.
 * - Normalizes line breaks
 * - Collapses excessive whitespace
 * - Preserves technical tokens (C++, C#, .NET, Node.js, etc.)
 * @param {string} text
 * @returns {string}
 */
function cleanResumeText(text) {
  if (!text) return "";

  // Normalize Windows/Mac line endings to \n
  let cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Replace non-breaking spaces and other Unicode whitespace with regular space
  cleaned = cleaned.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");

  // Remove PDF page-break artifacts (form feeds)
  cleaned = cleaned.replace(/\f/g, "\n");

  // Collapse runs of spaces (NOT newlines) to a single space
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  // Collapse more than 2 consecutive newlines to 2
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace from each line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return cleaned.trim();
}

module.exports = { cleanResumeText };
