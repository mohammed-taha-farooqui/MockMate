/**
 * matchingFeatureExtractor.js
 *
 * Feature 4A – Deterministic Matching Feature Extraction
 *
 * PURPOSE:
 *   Takes a resume data object (as stored in MongoDB) and a job description
 *   data object (as stored in MongoDB) and produces a set of deterministic
 *   matching features. These features are designed to be consumed later by the
 *   Sentence Transformer + Logistic Regression pipeline (Feature 4B+).
 *
 * GUARANTEES:
 *   - Pure, synchronous computation – no DB calls, no network calls.
 *   - No ML / embeddings – all matching is string-based.
 *   - Safe against empty / missing inputs.
 *   - No new npm dependencies required.
 */

"use strict";

// ---------------------------------------------------------------------------
// Canonical technical-token list
//
// When we encounter one of these tokens we KEEP it verbatim (after lower-casing
// the key used for comparison) so that "Node.js", "node js", and "NodeJS" all
// collapse to the same canonical form for matching purposes.
//
// The MAP is:  normalisedKey => canonical display form
// Keys are already lower-cased; every alias of a token points to the same
// canonical string.
// ---------------------------------------------------------------------------
const CANONICAL_SKILLS = new Map([
  // JavaScript ecosystem
  ["javascript", "JavaScript"],
  ["js", "JavaScript"],
  ["typescript", "TypeScript"],
  ["ts", "TypeScript"],
  ["node.js", "Node.js"],
  ["nodejs", "Node.js"],
  ["node js", "Node.js"],
  ["node", "Node.js"],
  ["react.js", "React"],
  ["reactjs", "React"],
  ["react js", "React"],
  ["react", "React"],
  ["next.js", "Next.js"],
  ["nextjs", "Next.js"],
  ["vue.js", "Vue.js"],
  ["vuejs", "Vue.js"],
  ["vue", "Vue.js"],
  ["angular", "Angular"],
  ["express.js", "Express.js"],
  ["expressjs", "Express.js"],
  ["express", "Express.js"],

  // Systems / compiled languages
  ["python", "Python"],
  ["java", "Java"],
  ["c++", "C++"],
  ["cpp", "C++"],
  ["c#", "C#"],
  ["csharp", "C#"],
  [".net", ".NET"],
  ["dotnet", ".NET"],
  ["go", "Go"],
  ["golang", "Go"],
  ["rust", "Rust"],
  ["kotlin", "Kotlin"],
  ["swift", "Swift"],
  ["php", "PHP"],
  ["ruby", "Ruby"],
  ["scala", "Scala"],

  // Data / ML
  ["tensorflow", "TensorFlow"],
  ["pytorch", "PyTorch"],
  ["scikit-learn", "Scikit-learn"],
  ["sklearn", "Scikit-learn"],
  ["pandas", "Pandas"],
  ["numpy", "NumPy"],

  // Web / markup
  ["html", "HTML"],
  ["css", "CSS"],
  ["sass", "Sass"],
  ["scss", "Sass"],
  ["tailwind", "Tailwind CSS"],
  ["tailwindcss", "Tailwind CSS"],
  ["bootstrap", "Bootstrap"],
  ["graphql", "GraphQL"],
  ["rest api", "REST API"],
  ["restful", "REST API"],
  ["rest", "REST API"],

  // Databases
  ["mongodb", "MongoDB"],
  ["mongo", "MongoDB"],
  ["mongoose", "MongoDB"],
  ["postgresql", "PostgreSQL"],
  ["postgres", "PostgreSQL"],
  ["mysql", "MySQL"],
  ["sqlite", "SQLite"],
  ["redis", "Redis"],
  ["firebase", "Firebase"],
  ["supabase", "Supabase"],
  ["dynamodb", "DynamoDB"],
  ["elasticsearch", "Elasticsearch"],
  ["cassandra", "Cassandra"],

  // ORM / ODM
  ["prisma", "Prisma"],
  ["sequelize", "Sequelize"],
  ["typeorm", "TypeORM"],
  ["hibernate", "Hibernate"],

  // DevOps / Cloud
  ["docker", "Docker"],
  ["kubernetes", "Kubernetes"],
  ["k8s", "Kubernetes"],
  ["aws", "AWS"],
  ["azure", "Azure"],
  ["gcp", "GCP"],
  ["google cloud", "GCP"],
  ["terraform", "Terraform"],
  ["ansible", "Ansible"],
  ["jenkins", "Jenkins"],
  ["github actions", "GitHub Actions"],
  ["ci/cd", "CI/CD"],
  ["cicd", "CI/CD"],
  ["linux", "Linux"],
  ["bash", "Bash"],
  ["shell", "Bash"],

  // Version control / tools
  ["git", "Git"],
  ["github", "GitHub"],
  ["gitlab", "GitLab"],

  // Frameworks
  ["django", "Django"],
  ["flask", "Flask"],
  ["fastapi", "FastAPI"],
  ["spring", "Spring"],
  ["spring boot", "Spring Boot"],
  ["laravel", "Laravel"],
  ["rails", "Ruby on Rails"],
  ["ruby on rails", "Ruby on Rails"],

  // Testing
  ["jest", "Jest"],
  ["mocha", "Mocha"],
  ["pytest", "PyTest"],
  ["cypress", "Cypress"],
  ["selenium", "Selenium"],

  // General concepts
  ["agile", "Agile"],
  ["scrum", "Scrum"],
  ["microservices", "Microservices"],
  ["oop", "OOP"],
  ["solid", "SOLID"],
  ["tdd", "TDD"],
  ["bdd", "BDD"],
]);

// ---------------------------------------------------------------------------
// Stop-words for keyword extraction
// Common English words that carry no signal for job-matching purposes.
// ---------------------------------------------------------------------------
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "up", "about", "into", "through", "during",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "shall", "can", "this", "that", "these", "those", "it", "its", "we",
  "our", "you", "your", "they", "their", "he", "she", "i", "my", "me",
  "as", "if", "so", "not", "no", "nor", "yet", "both", "either",
  "each", "all", "any", "few", "more", "most", "other", "some", "such",
  "also", "very", "just", "than", "then", "when", "where", "which", "who",
  "how", "what", "while", "after", "before", "between", "under", "over",
  "per", "us", "etc", "eg", "ie",
]);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a raw skill string into its canonical form using the lookup table.
 *
 * Strategy:
 *  1. Trim + lower-case the input.
 *  2. Replace common separator variations (e.g. "Node JS" -> "node js").
 *  3. Look up the result in CANONICAL_SKILLS; return the canonical form if
 *     found, otherwise return the trimmed-but-original string so we never
 *     silently discard an unknown skill.
 *
 * @param {string} raw  A single skill token, e.g. "React.js", "node js"
 * @returns {string}    Canonical form, e.g. "React", "Node.js"
 */
function normaliseSkill(raw) {
  if (typeof raw !== "string") return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  // Lower-case key for map look-up
  let key = trimmed.toLowerCase();

  // Collapse multiple spaces
  key = key.replace(/\s+/g, " ");

  // Direct map lookup
  if (CANONICAL_SKILLS.has(key)) {
    return CANONICAL_SKILLS.get(key);
  }

  // Also try stripping dots (e.g. "Express.JS" -> "expressjs")
  const noDots = key.replace(/\./g, "");
  if (CANONICAL_SKILLS.has(noDots)) {
    return CANONICAL_SKILLS.get(noDots);
  }

  // Fallback: return the original trimmed value (preserve unknown skills)
  return trimmed;
}

/**
 * Normalise an array of raw skill strings.
 * Deduplicates after normalisation (case-insensitive).
 *
 * @param {string[]} rawSkills
 * @returns {string[]}
 */
function normaliseSkillList(rawSkills) {
  if (!Array.isArray(rawSkills)) return [];

  const seen = new Map(); // canonical lower-case -> canonical display form
  for (const raw of rawSkills) {
    const canonical = normaliseSkill(raw);
    if (!canonical) continue;
    const key = canonical.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, canonical);
    }
  }
  return Array.from(seen.values());
}

/**
 * Extract skills from a free-form text string.
 *
 * We scan the text for every key in CANONICAL_SKILLS using word-boundary-aware
 * regex (so "C" does not match inside "C++", etc.).
 * Special regex characters in skill keys (+ . # etc.) are escaped before use.
 *
 * @param {string} text  Any free-form text (JD description, resume text, etc.)
 * @returns {string[]}   Deduplicated array of canonical skill names found.
 */
function extractSkillsFromText(text) {
  if (typeof text !== "string" || !text.trim()) return [];

  const found = new Map(); // canonical lower-case -> canonical display form

  for (const [key, canonical] of CANONICAL_SKILLS.entries()) {
    // Escape special regex characters that appear in skill keys
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Word-boundary-like approach using negative look-around:
    //   (?<![a-z0-9]) at start and (?![a-z0-9]) at end
    // This avoids matching "java" inside "javascript" etc.
    const pattern = new RegExp(
      `(?<![a-zA-Z0-9.#+])${escapedKey}(?![a-zA-Z0-9.#+])`,
      "i"
    );

    if (pattern.test(text)) {
      const ck = canonical.toLowerCase();
      if (!found.has(ck)) {
        found.set(ck, canonical);
      }
    }
  }

  return Array.from(found.values());
}

/**
 * Tokenise text into meaningful words for keyword overlap computation.
 *
 * Steps:
 *  1. Lower-case.
 *  2. Keep alphanumeric characters and common technical punctuation (+ # .).
 *  3. Split on whitespace.
 *  4. Remove stop-words and tokens shorter than 3 characters.
 *
 * @param {string} text
 * @returns {string[]}  Unique, filtered tokens.
 */
function tokenise(text) {
  if (typeof text !== "string") return [];

  const lower = text.toLowerCase();

  // Strip everything that is not a letter, digit, space, +, #, or dot
  const cleaned = lower.replace(/[^a-z0-9\s+#.]/g, " ");

  const tokens = cleaned.split(/\s+/).filter((t) => {
    return t.length >= 3 && !STOP_WORDS.has(t);
  });

  return [...new Set(tokens)]; // deduplicate
}

/**
 * Merge two skill arrays, deduplicating by lower-cased canonical name.
 * Items from `a` take precedence; items from `b` not already present appended.
 *
 * @param {string[]} a
 * @param {string[]} b
 * @returns {string[]}
 */
function deduplicateSkillArrays(a, b) {
  const seen = new Map();
  for (const skill of [...a, ...b]) {
    const key = skill.toLowerCase();
    if (!seen.has(key)) seen.set(key, skill);
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

/**
 * extractMatchingFeatures
 *
 * Computes deterministic matching features between a resume and a job
 * description. The output is intended to be fed into the Sentence Transformer
 * + Logistic Regression pipeline as structured, pre-computed features.
 *
 * @param {Object} resumeData  MongoDB Resume document (or plain object with
 *   the same shape). Expected fields:
 *     - skills        {string[]}  Skills extracted during upload
 *     - extractedText {string}    Full cleaned resume text
 *
 * @param {Object} jdData  MongoDB JobDescription document (or plain object).
 *   Expected fields:
 *     - requiredSkills  {string[]}  Skills marked as required
 *     - preferredSkills {string[]}  Skills marked as preferred
 *     - description     {string}    Full JD text
 *
 * @returns {{
 *   resumeSkills:    string[],
 *   requiredSkills:  string[],
 *   preferredSkills: string[],
 *   matchedSkills:   string[],
 *   skillGaps:       string[],
 *   skillOverlap:    number,
 *   commonKeywords:  string[],
 *   keywordOverlap:  number,
 * }}
 */
function extractMatchingFeatures(resumeData = {}, jdData = {}) {
  // ------------------------------------------------------------------
  // 1. Normalise skills from both sides
  //    We merge explicitly stored skills with any additional skills we
  //    can mine from the raw text – giving us better coverage when the
  //    stored skills list is sparse.
  // ------------------------------------------------------------------

  // Resume: combine stored skills + skills inferred from full text
  const storedResumeSkills = normaliseSkillList(resumeData.skills || []);
  const inferredResumeSkills = extractSkillsFromText(resumeData.extractedText || "");
  const resumeSkills = deduplicateSkillArrays(storedResumeSkills, inferredResumeSkills);

  // JD: stored required / preferred + inferred from description text
  const storedRequired = normaliseSkillList(jdData.requiredSkills || []);
  const storedPreferred = normaliseSkillList(jdData.preferredSkills || []);
  const inferredJdSkills = extractSkillsFromText(jdData.description || "");

  // Merge inferred JD skills into required list for skills that aren't
  // already classified as either required or preferred.
  const allClassifiedJdSkills = new Set(
    [...storedRequired, ...storedPreferred].map((s) => s.toLowerCase())
  );
  const unclassifiedInferred = inferredJdSkills.filter(
    (s) => !allClassifiedJdSkills.has(s.toLowerCase())
  );

  const requiredSkills = deduplicateSkillArrays(storedRequired, unclassifiedInferred);
  const preferredSkills = storedPreferred;

  // ------------------------------------------------------------------
  // 2. Compute skill matching
  // ------------------------------------------------------------------

  // Build a lower-cased Set of resume skills for O(1) lookup
  const resumeSkillSet = new Set(resumeSkills.map((s) => s.toLowerCase()));

  // matchedSkills: required skills the candidate DOES have
  const matchedSkills = requiredSkills.filter((s) =>
    resumeSkillSet.has(s.toLowerCase())
  );

  // skillGaps: required skills the candidate is MISSING
  const skillGaps = requiredSkills.filter(
    (s) => !resumeSkillSet.has(s.toLowerCase())
  );

  // skillOverlap: fraction of required skills that are matched.
  // Guard against division by zero when no required skills exist.
  const skillOverlap =
    requiredSkills.length > 0
      ? parseFloat((matchedSkills.length / requiredSkills.length).toFixed(4))
      : 0;

  // ------------------------------------------------------------------
  // 3. Keyword overlap between resume text and JD text
  //    Simple set-intersection of meaningful tokens.
  // ------------------------------------------------------------------

  const resumeTokens = new Set(tokenise(resumeData.extractedText || ""));
  const jdTokens = new Set(tokenise(jdData.description || ""));

  const commonKeywords = [...resumeTokens].filter((t) => jdTokens.has(t));

  // Keyword overlap: |intersection| / |union|  (Jaccard-style)
  const totalUniqueTokens = new Set([...resumeTokens, ...jdTokens]).size;
  const keywordOverlap =
    totalUniqueTokens > 0
      ? parseFloat((commonKeywords.length / totalUniqueTokens).toFixed(4))
      : 0;

  // ------------------------------------------------------------------
  // 4. Return clean feature object
  // ------------------------------------------------------------------
  return {
    resumeSkills,
    requiredSkills,
    preferredSkills,
    matchedSkills,
    skillGaps,
    skillOverlap,
    commonKeywords,
    keywordOverlap,
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  extractMatchingFeatures,
  // Also expose helpers for unit-testing / reuse by other services
  normaliseSkill,
  normaliseSkillList,
  extractSkillsFromText,
  tokenise,
};
