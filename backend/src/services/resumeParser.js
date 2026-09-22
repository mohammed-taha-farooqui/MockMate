const fs = require("fs");
// pdf-parse v1 exports a single async function: pdfParse(buffer) -> { text, ... }
const pdfParse = require("pdf-parse");

/**
 * Parses a PDF file and returns its extracted plain text.
 * @param {string} filePath - Absolute path to the uploaded PDF file.
 * @returns {Promise<string>} Extracted text content.
 */
async function parseResumePdf(filePath) {
  const dataBuffer = await fs.promises.readFile(filePath);
  const result = await pdfParse(dataBuffer);
  return result.text || "";
}

module.exports = { parseResumePdf };
