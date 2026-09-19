/**
 * test_report.js
 * ==============
 * Integration tests for GET /api/interview/:id/report endpoint.
 *
 * Tests:
 * 1. Invalid interview ID format returns HTTP 400
 * 2. Nonexistent interview ID returns HTTP 404
 * 3. Valid completed interview generates Report document with matchScore, skillGaps, strengths, and averageAnswerScore
 * 4. Calling the endpoint again updates/returns existing report instead of creating a duplicate (unique reportId)
 *
 * Usage:
 *   node test_report.js
 */

require("dotenv").config();
const assert = require("assert");
const axios = require("axios");
const mongoose = require("mongoose");

const Candidate = require("./src/models/Candidate");
const Resume = require("./src/models/Resume");
const JobDescription = require("./src/models/JobDescription");
const Interview = require("./src/models/Interview");
const Question = require("./src/models/Question");
const Answer = require("./src/models/Answer");
const Report = require("./src/models/Report");

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
  console.log("\n=== Feature Member A: Node Backend GET /api/interview/:id/report Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  let testCandidate = null;
  let testResume = null;
  let testJd = null;
  let testInterview = null;
  let testQ1 = null;
  let testQ2 = null;
  let testAns1 = null;
  let testAns2 = null;
  let firstReportId = null;

  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    try {
      await mongoose.connect(MONGO_URI);

      testCandidate = await Candidate.create({
        name: "Report Test Candidate",
        email: `report.candidate.${Date.now()}@example.com`,
        phone: "+1555666777",
      });

      testResume = await Resume.create({
        candidateId: testCandidate._id,
        fileName: "test_report_resume.pdf",
        filePath: "uploads/test_report_resume.pdf",
        fileType: "pdf",
        extractedText: "Full stack engineer skilled in React, Node.js, and JavaScript.",
        skills: ["React", "Node.js", "JavaScript"],
      });

      testJd = await JobDescription.create({
        title: "Senior Full Stack Engineer",
        company: "MockMate",
        description: "Looking for a full stack engineer proficient in React, Node.js, TypeScript, and Python.",
        requiredSkills: ["React", "Node.js", "TypeScript", "Python"],
      });

      testInterview = await Interview.create({
        candidateId: testCandidate._id,
        resumeId: testResume._id,
        jobDescriptionId: testJd._id,
        status: "completed",
      });

      testQ1 = await Question.create({
        interviewId: testInterview._id,
        questionText: "Explain how React virtual DOM works.",
        questionType: "technical",
        targetSkill: "React",
        order: 1,
      });

      testQ2 = await Question.create({
        interviewId: testInterview._id,
        questionText: "Explain Node.js event loop.",
        questionType: "technical",
        targetSkill: "Node.js",
        order: 2,
      });

      testAns1 = await Answer.create({
        interviewId: testInterview._id,
        questionId: testQ1._id,
        answerText: "React virtual DOM optimizes DOM updates by diffing tree state.",
        score: 4.5, // >= 4.0 -> contributes to strengths ("React")
        features: {
          semanticSimilarity: 0.85,
          keywordOverlap: 0.6,
          answerLength: 0.5,
          technicalKeywordCount: 2,
        },
      });

      testAns2 = await Answer.create({
        interviewId: testInterview._id,
        questionId: testQ2._id,
        answerText: "Node event loop processes async call stack callbacks.",
        score: 4.2, // >= 4.0 -> contributes to strengths ("Node.js")
        features: {
          semanticSimilarity: 0.8,
          keywordOverlap: 0.5,
          answerLength: 0.4,
          technicalKeywordCount: 1,
        },
      });

      testInterview.questions = [testQ1._id, testQ2._id];
      await testInterview.save();

      console.log(`  Created test Candidate (${testCandidate._id}), Resume (${testResume._id}), JD (${testJd._id}), Interview (${testInterview._id})\n`);
    } catch (dbErr) {
      console.warn("  Warning: Could not set up test documents in MongoDB:", dbErr.message);
    }
  }

  // 1. Invalid interview ID format -> HTTP 400
  await test("1. Invalid interview ID format returns HTTP 400", async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/interview/invalid-id-format/report`);
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
      await axios.get(`${BACKEND_URL}/api/interview/${fakeId}/report`);
      assert.fail("Expected HTTP 404 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404);
      assert.ok(err.response.data.error.includes("Interview document with id"));
    }
  });

  // 3. Valid completed interview generates Report document -> HTTP 200
  if (testInterview) {
    await test("3. Valid completed interview creates Report with skillGaps, strengths, and averageAnswerScore", async () => {
      const res = await axios.get(`${BACKEND_URL}/api/interview/${testInterview._id.toString()}/report`);
      assert.strictEqual(res.status, 200);
      const body = res.data;

      assert.ok(body.reportId, "reportId must be returned");
      assert.strictEqual(body.interviewId, testInterview._id.toString());
      assert.strictEqual(body.candidateId, testCandidate._id.toString());
      assert.strictEqual(body.totalQuestions, 2);
      assert.strictEqual(body.answeredQuestions, 2);
      assert.strictEqual(body.averageAnswerScore, 4.35); // (4.5 + 4.2) / 2 = 4.35

      assert.ok(Array.isArray(body.skillGaps), "skillGaps must be an array");
      assert.ok(body.skillGaps.includes("TypeScript"), "skillGaps should include TypeScript");
      assert.ok(body.skillGaps.includes("Python"), "skillGaps should include Python");

      assert.ok(Array.isArray(body.strengths), "strengths must be an array");
      assert.ok(body.strengths.includes("React"), "strengths should include React");
      assert.ok(body.strengths.includes("Node.js"), "strengths should include Node.js");

      firstReportId = body.reportId;

      console.log("\n  --- Sample GET /api/interview/:id/report Response ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  -----------------------------------------------------\n");
    });
  }

  // 4. Calling endpoint again updates/returns existing report without duplicate creation -> HTTP 200
  if (testInterview && firstReportId) {
    await test("4. Re-calling GET /api/interview/:id/report returns existing Report without creating duplicate", async () => {
      const res = await axios.get(`${BACKEND_URL}/api/interview/${testInterview._id.toString()}/report`);
      assert.strictEqual(res.status, 200);
      const body = res.data;

      assert.strictEqual(body.reportId, firstReportId, "reportId must match the existing Report document ID");

      // Verify directly in MongoDB that only 1 report exists for this interview
      if (mongoose.connection.readyState === 1) {
        const reportCount = await Report.countDocuments({ interviewId: testInterview._id });
        assert.strictEqual(reportCount, 1, "Exactly 1 Report document should exist for this interview");
      }
    });
  }

  // Cleanup
  if (mongoose.connection.readyState === 1) {
    try {
      if (firstReportId) await Report.findByIdAndDelete(firstReportId);
      if (testAns1) await Answer.findByIdAndDelete(testAns1._id);
      if (testAns2) await Answer.findByIdAndDelete(testAns2._id);
      if (testQ1) await Question.findByIdAndDelete(testQ1._id);
      if (testQ2) await Question.findByIdAndDelete(testQ2._id);
      if (testInterview) await Interview.findByIdAndDelete(testInterview._id);
      if (testJd) await JobDescription.findByIdAndDelete(testJd._id);
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
