/**
 * test_match.js
 * =============
 * Integration and unit smoke tests for Feature 4E: Node backend POST /api/match
 *
 * Usage:
 *   node test_match.js
 */

const assert = require("assert");
const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

const SAMPLE_RESUME =
  "Senior Full Stack Engineer with 5 years of experience in JavaScript, TypeScript, React, Node.js, and AWS. Bachelor's in CS.";

const SAMPLE_JD =
  "Looking for a Senior Full Stack Engineer proficient in React, Node.js, and AWS. Bachelor's degree required.";

async function runTests() {
  console.log("\n=== Feature 4E: Node Backend /api/match Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  // 1. GET /api/health
  await test("1. GET /api/health returns 200 and success status", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
    assert.strictEqual(res.data.success, true, "Expected success: true");
    assert.strictEqual(res.data.message, "Backend is running");
  });

  // 2. POST /api/match validation: missing resumeText
  await test("2. POST /api/match with missing resumeText returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { jobDescription: SAMPLE_JD });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(err.response.data.error, "Expected error message in response body");
    }
  });

  // 3. POST /api/match validation: empty resumeText
  await test("3. POST /api/match with empty resumeText returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { resumeText: "   ", jobDescription: SAMPLE_JD });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
    }
  });

  // 4. POST /api/match validation: missing jobDescription
  await test("4. POST /api/match with missing jobDescription returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { resumeText: SAMPLE_RESUME });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
    }
  });

  // 5. POST /api/match valid request with Python ML integration
  await test("5. POST /api/match returns 200 and expected payload structure", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/match`,
      {
        resumeText: SAMPLE_RESUME,
        jobDescription: SAMPLE_JD,
      },
      { timeout: 35000 }
    );

    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const body = res.data;

    // Check top-level keys
    assert.ok(typeof body.matchScore === "number", `matchScore is not a number: ${body.matchScore}`);
    assert.ok(body.matchScore >= 0 && body.matchScore <= 100, `matchScore out of bounds: ${body.matchScore}`);
    assert.ok(
      ["No Fit", "Potential Fit", "Good Fit"].includes(body.fitClass),
      `Invalid fitClass: ${body.fitClass}`
    );
    assert.ok(Array.isArray(body.skillGaps), "skillGaps must be an array");
    assert.ok(typeof body.features === "object" && body.features !== null, "features must be an object");

    // Check all 6 features
    const expectedFeatures = [
      "semantic_similarity",
      "skill_overlap",
      "keyword_overlap",
      "experience_match",
      "education_match",
      "role_match",
    ];
    for (const f of expectedFeatures) {
      assert.ok(f in body.features, `Feature '${f}' missing from features`);
      assert.ok(typeof body.features[f] === "number", `Feature '${f}' is not numeric`);
    }
  });

  console.log("\n===================================================");
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("===================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
