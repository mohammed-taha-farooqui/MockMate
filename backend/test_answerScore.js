/**
 * test_answerScore.js
 * ====================
 * Backend verification test suite for POST /api/score-answer with Answer persistence.
 *
 * Tests:
 * 1. Missing required field (interviewId) -> HTTP 400
 * 2. Invalid MongoDB ObjectId format -> HTTP 400
 * 3. Referenced Interview document not found -> HTTP 404
 * 4. Referenced Question document not found -> HTTP 404
 * 5. Validation failure for empty candidateAnswer / questionText -> HTTP 400
 * 6. Successful answer scoring & Answer document persistence -> HTTP 200 with answerId, score, features
 * 7. Python ML service unavailable handling -> HTTP 503
 *
 * Usage:
 *   node test_answerScore.js
 */

require("dotenv").config();
const assert = require("assert");
const axios = require("axios");
const mongoose = require("mongoose");

const Candidate = require("./src/models/Candidate");
const Resume = require("./src/models/Resume");
const Interview = require("./src/models/Interview");
const Question = require("./src/models/Question");
const Answer = require("./src/models/Answer");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const MONGO_URI = process.env.MONGO_URI;

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
  console.log("\n=== Node.js Backend Integration: POST /api/score-answer Persistence Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  let testCandidate = null;
  let testResume = null;
  let testInterview = null;
  let testQuestion = null;
  let createdAnswerId = null;

  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    try {
      await mongoose.connect(MONGO_URI);

      testCandidate = await Candidate.create({
        name: "Answer Test Candidate",
        email: `answer.candidate.${Date.now()}@example.com`,
        phone: "+1987654321",
      });

      testResume = await Resume.create({
        candidateId: testCandidate._id,
        fileName: "test_answer_resume.pdf",
        filePath: "uploads/test_answer_resume.pdf",
        fileType: "pdf",
        extractedText: "Backend Software Engineer with Python and Spring Boot experience.",
      });

      testInterview = await Interview.create({
        candidateId: testCandidate._id,
        resumeId: testResume._id,
        status: "in-progress",
      });

      testQuestion = await Question.create({
        interviewId: testInterview._id,
        questionText: "Explain how dependency injection works in Spring Boot and Python.",
        referenceAnswer: "Dependency injection is an IoC pattern where classes receive dependencies externally.",
        questionType: "technical",
        targetSkill: "Spring Boot",
      });

      console.log(`  Created test Candidate (${testCandidate._id}), Interview (${testInterview._id}), Question (${testQuestion._id})\n`);
    } catch (dbErr) {
      console.warn("  Warning: Could not set up test documents in MongoDB:", dbErr.message);
    }
  }

  // 1. Missing interviewId -> HTTP 400
  await test("1. Missing interviewId returns HTTP 400 Bad Request", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/score-answer`, {
        questionId: testQuestion ? testQuestion._id.toString() : new mongoose.Types.ObjectId().toString(),
        questionText: "Explain DI.",
        candidateAnswer: "DI pattern.",
      });
      assert.fail("Should have thrown 400 error");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.error.includes("interviewId is required"));
    }
  });

  // 2. Invalid ObjectId format -> HTTP 400
  await test("2. Invalid MongoDB ObjectId format returns HTTP 400 Bad Request", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/score-answer`, {
        interviewId: "invalid-id-format",
        questionId: testQuestion ? testQuestion._id.toString() : new mongoose.Types.ObjectId().toString(),
        questionText: "Explain DI.",
        candidateAnswer: "DI pattern.",
      });
      assert.fail("Should have thrown 400 error");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.error.includes("Invalid interviewId format"));
    }
  });

  // 3. Nonexistent Interview -> HTTP 404
  await test("3. Nonexistent Interview ID returns HTTP 404 Not Found", async () => {
    const fakeInterviewId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/score-answer`, {
        interviewId: fakeInterviewId,
        questionId: testQuestion ? testQuestion._id.toString() : new mongoose.Types.ObjectId().toString(),
        questionText: "Explain DI.",
        candidateAnswer: "DI pattern.",
      });
      assert.fail("Should have thrown 404 error");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404);
      assert.ok(err.response.data.error.includes("Interview document with id"));
    }
  });

  // 4. Nonexistent Question -> HTTP 404
  if (testInterview) {
    await test("4. Nonexistent Question ID returns HTTP 404 Not Found", async () => {
      const fakeQuestionId = new mongoose.Types.ObjectId().toString();
      try {
        await axios.post(`${BACKEND_URL}/api/score-answer`, {
          interviewId: testInterview._id.toString(),
          questionId: fakeQuestionId,
          questionText: "Explain DI.",
          candidateAnswer: "DI pattern.",
        });
        assert.fail("Should have thrown 404 error");
      } catch (err) {
        assert.ok(err.response, "Expected HTTP response error");
        assert.strictEqual(err.response.status, 404);
        assert.ok(err.response.data.error.includes("Question document with id"));
      }
    });
  }

  // 5. Validation failure for empty candidateAnswer -> HTTP 400
  if (testInterview && testQuestion) {
    await test("5. Empty candidateAnswer returns HTTP 400 Bad Request", async () => {
      try {
        await axios.post(`${BACKEND_URL}/api/score-answer`, {
          interviewId: testInterview._id.toString(),
          questionId: testQuestion._id.toString(),
          questionText: "Explain dependency injection.",
          referenceAnswer: "IoC pattern.",
          candidateAnswer: "   ",
        });
        assert.fail("Should have thrown 400 error");
      } catch (err) {
        assert.ok(err.response, "Expected HTTP response error");
        assert.strictEqual(err.response.status, 400);
        assert.ok(err.response.data.error.includes("candidateAnswer"));
      }
    });
  }

  // 6. Successful Answer Scoring and Persistence -> HTTP 200
  if (testInterview && testQuestion) {
    await test("6. Valid request scores answer and persists Answer document in MongoDB", async () => {
      const payload = {
        interviewId: testInterview._id.toString(),
        questionId: testQuestion._id.toString(),
        questionText: testQuestion.questionText,
        referenceAnswer: testQuestion.referenceAnswer,
        candidateAnswer: "Dependency injection allows objects to receive their dependencies from an external container in Spring Boot and Python.",
      };

      const res = await axios.post(`${BACKEND_URL}/api/score-answer`, payload);

      assert.strictEqual(res.status, 200);
      const body = res.data;

      assert.ok(body.answerId, "answerId must be returned");
      assert.ok(typeof body.score === "number", "score must be a number");
      assert.ok(body.score >= 0 && body.score <= 5, "score must be in range [0, 5]");
      assert.ok(body.features, "features object must exist");
      assert.ok(typeof body.features.semanticSimilarity === "number");
      assert.ok(typeof body.features.keywordOverlap === "number");
      assert.ok(typeof body.features.answerLength === "number");
      assert.ok(typeof body.features.technicalKeywordCount === "number");

      createdAnswerId = body.answerId;

      // Verify persistence in MongoDB directly
      if (mongoose.connection.readyState === 1) {
        const persistedAnswer = await Answer.findById(createdAnswerId);
        assert.ok(persistedAnswer, "Answer document must exist in MongoDB");
        assert.strictEqual(persistedAnswer.interviewId.toString(), testInterview._id.toString());
        assert.strictEqual(persistedAnswer.questionId.toString(), testQuestion._id.toString());
        assert.strictEqual(persistedAnswer.score, body.score);
      }

      console.log("\n  --- Sample POST /api/score-answer Response with answerId ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  -----------------------------------------------------------\n");
    });
  }

  // 7. Python ML service unavailable handling (HTTP 503)
  await test("7. Python ML service unavailable returns HTTP 503", async () => {
    const origUrl = process.env.PYTHON_ML_SERVICE_URL;
    process.env.PYTHON_ML_SERVICE_URL = "http://localhost:59999";

    delete require.cache[require.resolve("./src/controllers/answerScoreController")];
    const { scoreAnswer: offlineScoreAnswer } = require("./src/controllers/answerScoreController");

    let statusCode = null;
    let responseData = null;

    const mockReq = {
      body: {
        interviewId: testInterview ? testInterview._id.toString() : new mongoose.Types.ObjectId().toString(),
        questionId: testQuestion ? testQuestion._id.toString() : new mongoose.Types.ObjectId().toString(),
        questionText: "Explain dependency injection.",
        referenceAnswer: "IoC pattern.",
        candidateAnswer: "Dependency injection pattern in Python.",
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

    if (origUrl) {
      process.env.PYTHON_ML_SERVICE_URL = origUrl;
    } else {
      delete process.env.PYTHON_ML_SERVICE_URL;
    }
    delete require.cache[require.resolve("./src/controllers/answerScoreController")];

    assert.strictEqual(statusCode, 503, "Should return HTTP 503 when ML service is offline");
    assert.ok(responseData.error.includes("unavailable"), "Error message should indicate service is unavailable");
  });

  // Cleanup test documents
  if (mongoose.connection.readyState === 1) {
    try {
      if (createdAnswerId) await Answer.findByIdAndDelete(createdAnswerId);
      if (testQuestion) await Question.findByIdAndDelete(testQuestion._id);
      if (testInterview) await Interview.findByIdAndDelete(testInterview._id);
      if (testResume) await Resume.findByIdAndDelete(testResume._id);
      if (testCandidate) await Candidate.findByIdAndDelete(testCandidate._id);
      console.log("  Cleaned up temporary test documents from MongoDB.");
      await mongoose.disconnect();
    } catch (cleanErr) {
      console.warn("  Warning: Cleanup failed:", cleanErr.message);
    }
  }

  console.log("\n===================================================");
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log("===================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
