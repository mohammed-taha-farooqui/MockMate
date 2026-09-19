/**
 * test_interviewResults.js
 * ========================
 * Integration tests for GET /api/interview/:id/results endpoint.
 *
 * Tests:
 * 1. Invalid interview ID format returns HTTP 400
 * 2. Nonexistent interview ID returns HTTP 404
 * 3. Valid interview with answers calculates correct totalQuestions, answeredQuestions, averageAnswerScore, and answers array
 * 4. Interview with unanswered questions returns null for answerText, score, and features for missing answers
 *
 * Usage:
 *   node test_interviewResults.js
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
  console.log("\n=== Feature Member A: Node Backend GET /api/interview/:id/results Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  let testCandidate = null;
  let testResume = null;
  let testInterview1 = null; // Interview with all answered questions
  let testInterview2 = null; // Interview with unanswered questions
  let testQ1 = null;
  let testQ2 = null;
  let testQ3 = null;
  let testAns1 = null;
  let testAns2 = null;

  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    try {
      await mongoose.connect(MONGO_URI);

      testCandidate = await Candidate.create({
        name: "Results Test Candidate",
        email: `results.candidate.${Date.now()}@example.com`,
        phone: "+1122334455",
      });

      testResume = await Resume.create({
        candidateId: testCandidate._id,
        fileName: "test_results_resume.pdf",
        filePath: "uploads/test_results_resume.pdf",
        fileType: "pdf",
        extractedText: "Full stack engineer proficient in Node.js, Python, and React.",
      });

      // Interview 1: All answered questions
      testInterview1 = await Interview.create({
        candidateId: testCandidate._id,
        resumeId: testResume._id,
        status: "completed",
      });

      testQ1 = await Question.create({
        interviewId: testInterview1._id,
        questionText: "What is dependency injection?",
        questionType: "technical",
        order: 1,
      });

      testQ2 = await Question.create({
        interviewId: testInterview1._id,
        questionText: "Explain React useEffect hook.",
        questionType: "technical",
        order: 2,
      });

      testAns1 = await Answer.create({
        interviewId: testInterview1._id,
        questionId: testQ1._id,
        answerText: "Dependency injection is an IoC pattern in Spring and Python.",
        score: 4.5,
        features: {
          semanticSimilarity: 0.8,
          keywordOverlap: 0.5,
          answerLength: 0.6,
          technicalKeywordCount: 2,
        },
      });

      testAns2 = await Answer.create({
        interviewId: testInterview1._id,
        questionId: testQ2._id,
        answerText: "useEffect manages side effects in functional components.",
        score: 3.5,
        features: {
          semanticSimilarity: 0.7,
          keywordOverlap: 0.4,
          answerLength: 0.5,
          technicalKeywordCount: 1,
        },
      });

      // Update interview1 questions array
      testInterview1.questions = [testQ1._id, testQ2._id];
      await testInterview1.save();

      // Interview 2: Partial/unanswered questions
      testInterview2 = await Interview.create({
        candidateId: testCandidate._id,
        resumeId: testResume._id,
        status: "in-progress",
      });

      testQ3 = await Question.create({
        interviewId: testInterview2._id,
        questionText: "Explain Python GIL.",
        questionType: "technical",
        order: 1,
      });

      testInterview2.questions = [testQ3._id];
      await testInterview2.save();

      console.log(`  Created test Candidate (${testCandidate._id}), Interview 1 (${testInterview1._id}), Interview 2 (${testInterview2._id})\n`);
    } catch (dbErr) {
      console.warn("  Warning: Could not set up test documents in MongoDB:", dbErr.message);
    }
  }

  // 1. Invalid interview ID format -> HTTP 400
  await test("1. Invalid interview ID format returns HTTP 400", async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/interview/invalid-id-format/results`);
      assert.fail("Expected HTTP 400 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400);
      assert.ok(err.response.data.error.includes("Invalid interviewId format"));
    }
  });

  // 2. Nonexistent interview ID -> HTTP 404
  await test("2. Nonexistent interview ID returns HTTP 404", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.get(`${BACKEND_URL}/api/interview/${fakeId}/results`);
      assert.fail("Expected HTTP 404 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404);
      assert.ok(err.response.data.error.includes("Interview document with id"));
    }
  });

  // 3. Valid interview with answered questions -> HTTP 200
  if (testInterview1) {
    await test("3. Valid interview with answers calculates metrics and returns formatted answers", async () => {
      const res = await axios.get(`${BACKEND_URL}/api/interview/${testInterview1._id.toString()}/results`);
      assert.strictEqual(res.status, 200);
      const body = res.data;

      assert.strictEqual(body.interviewId, testInterview1._id.toString());
      assert.strictEqual(body.status, "completed");
      assert.strictEqual(body.totalQuestions, 2);
      assert.strictEqual(body.answeredQuestions, 2);
      assert.strictEqual(body.averageAnswerScore, 4.0); // (4.5 + 3.5) / 2 = 4.0
      assert.strictEqual(body.answers.length, 2);

      const q1Ans = body.answers.find((a) => a.questionId === testQ1._id.toString());
      assert.ok(q1Ans);
      assert.strictEqual(q1Ans.questionText, "What is dependency injection?");
      assert.strictEqual(q1Ans.score, 4.5);
      assert.ok(q1Ans.features);
      assert.strictEqual(q1Ans.features.semanticSimilarity, 0.8);

      console.log("\n  --- Sample GET /api/interview/:id/results Response (Fully Answered) ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  -----------------------------------------------------------------------'\n");
    });
  }

  // 4. Interview with unanswered questions -> HTTP 200 with null values for missing answers
  if (testInterview2) {
    await test("4. Interview with unanswered questions returns null for answerText, score, and features", async () => {
      const res = await axios.get(`${BACKEND_URL}/api/interview/${testInterview2._id.toString()}/results`);
      assert.strictEqual(res.status, 200);
      const body = res.data;

      assert.strictEqual(body.interviewId, testInterview2._id.toString());
      assert.strictEqual(body.status, "in-progress");
      assert.strictEqual(body.totalQuestions, 1);
      assert.strictEqual(body.answeredQuestions, 0);
      assert.strictEqual(body.averageAnswerScore, 0);
      assert.strictEqual(body.answers.length, 1);

      const unanswered = body.answers[0];
      assert.strictEqual(unanswered.questionId, testQ3._id.toString());
      assert.strictEqual(unanswered.questionText, "Explain Python GIL.");
      assert.strictEqual(unanswered.answerText, null);
      assert.strictEqual(unanswered.score, null);
      assert.strictEqual(unanswered.features, null);

      console.log("\n  --- Sample GET /api/interview/:id/results Response (Unanswered) ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  -------------------------------------------------------------------'\n");
    });
  }

  // Cleanup
  if (mongoose.connection.readyState === 1) {
    try {
      if (testAns1) await Answer.findByIdAndDelete(testAns1._id);
      if (testAns2) await Answer.findByIdAndDelete(testAns2._id);
      if (testQ1) await Question.findByIdAndDelete(testQ1._id);
      if (testQ2) await Question.findByIdAndDelete(testQ2._id);
      if (testQ3) await Question.findByIdAndDelete(testQ3._id);
      if (testInterview1) await Interview.findByIdAndDelete(testInterview1._id);
      if (testInterview2) await Interview.findByIdAndDelete(testInterview2._id);
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
