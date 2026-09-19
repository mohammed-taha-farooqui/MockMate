/**
 * test_answerScore.js
 * ====================
 * Backend verification test suite for POST /api/score-answer.
 *
 * Verifies:
 * 1. Valid request returns HTTP 200 with score and features from Python ML service.
 * 2. Validation failure (missing/empty fields) returns HTTP 400.
 * 3. Python ML service response forwarding is accurate.
 * 4. Python service unavailable handling returns HTTP 503.
 *
 * Usage:
 *   node test_answerScore.js
 */

const assert = require("assert");
const axios = require("axios");
const { scoreAnswer } = require("./src/controllers/answerScoreController");

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

async function runTests() {
  console.log("\n=== Node.js Backend Integration: POST /api/score-answer Tests ===\n");

  // Test 1: Valid request via HTTP endpoint
  await test("1. Valid request to POST /api/score-answer returns HTTP 200 with score & features", async () => {
    const payload = {
      questionText: "Explain how dependency injection works in Spring Boot and Python.",
      referenceAnswer: "Dependency injection is an IoC pattern where classes receive dependencies externally.",
      candidateAnswer: "Dependency injection allows objects to receive their dependencies from an external container in Spring Boot and Python."
    };

    const res = await axios.post(`${BACKEND_URL}/api/score-answer`, payload);

    assert.strictEqual(res.status, 200);
    const body = res.data;

    assert.ok(typeof body.score === "number", "score must be a number");
    assert.ok(body.score >= 0 && body.score <= 5, "score must be in range [0, 5]");
    assert.ok(body.features, "features object must exist");
    assert.ok(typeof body.features.semanticSimilarity === "number", "semanticSimilarity must be numeric");
    assert.ok(typeof body.features.keywordOverlap === "number", "keywordOverlap must be numeric");
    assert.ok(typeof body.features.answerLength === "number", "answerLength must be numeric");
    assert.ok(typeof body.features.technicalKeywordCount === "number", "technicalKeywordCount must be numeric");

    console.log("\n  --- Sample POST /api/score-answer Response ---");
    console.log(JSON.stringify(body, null, 2));
    console.log("  ----------------------------------------------\n");
  });

  // Test 2: Validation failure for empty candidateAnswer
  await test("2. Empty candidateAnswer returns HTTP 400 Bad Request", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/score-answer`, {
        questionText: "Explain dependency injection.",
        referenceAnswer: "IoC pattern.",
        candidateAnswer: "   "
      });
      assert.fail("Should have thrown 400 error");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.error, "Error message should be present");
    }
  });

  // Test 3: Validation failure for missing questionText
  await test("3. Missing questionText returns HTTP 400 Bad Request", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/score-answer`, {
        referenceAnswer: "IoC pattern.",
        candidateAnswer: "DI pattern"
      });
      assert.fail("Should have thrown 400 error");
    } catch (err) {
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.error.includes("questionText"), "Error message should mention questionText");
    }
  });

  // Test 4: Handling Python service unavailable (HTTP 503)
  await test("4. Python ML service unavailable returns HTTP 503", async () => {
    // Save original env
    const origUrl = process.env.PYTHON_ML_SERVICE_URL;
    process.env.PYTHON_ML_SERVICE_URL = "http://localhost:59999";

    // Re-require controller with fake offline URL
    delete require.cache[require.resolve("./src/controllers/answerScoreController")];
    const { scoreAnswer: offlineScoreAnswer } = require("./src/controllers/answerScoreController");

    let statusCode = null;
    let responseData = null;

    const mockReq = {
      body: {
        questionText: "Explain dependency injection.",
        referenceAnswer: "IoC pattern.",
        candidateAnswer: "Dependency injection pattern in Python."
      }
    };
    const mockRes = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await offlineScoreAnswer(mockReq, mockRes);

    // Restore env & controller cache
    if (origUrl) {
      process.env.PYTHON_ML_SERVICE_URL = origUrl;
    } else {
      delete process.env.PYTHON_ML_SERVICE_URL;
    }
    delete require.cache[require.resolve("./src/controllers/answerScoreController")];

    assert.strictEqual(statusCode, 503, "Should return HTTP 503 when ML service is offline");
    assert.ok(responseData.error.includes("unavailable"), "Error message should indicate service is unavailable");
  });

  console.log("\n===================================================");
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("===================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
