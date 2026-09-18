/**
 * Deterministic, regex-based field extractor for resume text.
 * No ML or LLM – pure pattern matching.
 */

// Known technical skills keyword list
const SKILLS_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C\\+\\+", "C#", "\\.NET",
  "Node\\.js", "React\\.js", "React", "Angular", "Vue\\.js", "Vue",
  "Express\\.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "SQLite",
  "Redis", "GraphQL", "REST API", "RESTful", "Docker", "Kubernetes",
  "AWS", "Azure", "GCP", "Git", "GitHub", "Linux", "Bash",
  "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
  "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
  "FastAPI", "Django", "Flask", "Spring", "Hibernate",
  "Firebase", "Supabase", "Prisma", "Sequelize", "Mongoose",
];

/**
 * Extract a single email address from text.
 * @param {string} text
 * @returns {string}
 */
function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

/**
 * Extract a phone number from text.
 * Returns the first match or empty string.
 * @param {string} text
 * @returns {string}
 */
function extractPhone(text) {
  // Matches formats: +1-555-123-4567, (555) 123-4567, 555.123.4567, etc.
  const match = text.match(
    /(\+?\d{1,3}[\s\-.])?(\(?\d{2,4}\)?[\s\-.])\d{3,4}[\s\-.]\d{3,4}/
  );
  return match ? match[0].trim() : "";
}

/**
 * Extract recognisable skills from the text.
 * @param {string} text
 * @returns {string[]}
 */
function extractSkills(text) {
  const found = new Set();
  for (const skill of SKILLS_KEYWORDS) {
    // Build a word-boundary-aware regex (handle special chars like + and .)
    const pattern = new RegExp(`(?<![\\w])${skill}(?![\\w])`, "i");
    if (pattern.test(text)) {
      // Normalise the matched token (use the canonical form from our list)
      found.add(skill.replace(/\\\+/g, "+").replace(/\\\./g, ".").replace(/\\/g, ""));
    }
  }
  return Array.from(found);
}

/**
 * Extract education lines (lines near "Education", "University", "Bachelor", etc.)
 * @param {string} text
 * @returns {string[]}
 */
function extractEducation(text) {
  const lines = text.split("\n");
  const results = [];
  let inSection = false;

  const sectionHeader = /^(education|academic|qualification)/i;
  const nextSection = /^(experience|skills|projects|certifications|awards|languages|summary|objective)/i;
  const educationLine = /\b(bachelor|master|phd|b\.sc|m\.sc|b\.e|m\.e|b\.tech|m\.tech|mba|university|college|institute|school|degree|diploma)\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (sectionHeader.test(trimmed)) { inSection = true; continue; }
    if (inSection && nextSection.test(trimmed)) { inSection = false; continue; }

    if (inSection || educationLine.test(trimmed)) {
      if (trimmed.length > 5) results.push(trimmed);
    }
  }

  return [...new Set(results)].slice(0, 10);
}

/**
 * Extract experience lines (lines near "Experience", job titles, company names etc.)
 * @param {string} text
 * @returns {string[]}
 */
function extractExperience(text) {
  const lines = text.split("\n");
  const results = [];
  let inSection = false;

  const sectionHeader = /^(experience|employment|work history|professional)/i;
  const nextSection = /^(education|skills|projects|certifications|awards|languages|summary|objective)/i;
  const experienceLine = /\b(engineer|developer|manager|analyst|intern|consultant|designer|architect|lead|senior|junior|associate)\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (sectionHeader.test(trimmed)) { inSection = true; continue; }
    if (inSection && nextSection.test(trimmed)) { inSection = false; continue; }

    if (inSection || experienceLine.test(trimmed)) {
      if (trimmed.length > 5) results.push(trimmed);
    }
  }

  return [...new Set(results)].slice(0, 10);
}

/**
 * Run all extractors and return a structured object.
 * @param {string} text Cleaned resume text.
 * @returns {{ email: string, phone: string, skills: string[], education: string[], experience: string[] }}
 */
function extractFields(text) {
  return {
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    education: extractEducation(text),
    experience: extractExperience(text),
  };
}

module.exports = { extractFields };
