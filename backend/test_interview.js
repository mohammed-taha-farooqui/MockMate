/**
 * test_interview.js
 * =================
 * API tests for POST /api/interview/create.
 *
 * Tests covered:
 * 1. Successful interview creation with valid references (201 Created)
 * 2. Missing required fields (resumeId missing) -> HTTP 400
 * 3. Invalid MongoDB ObjectId format -> HTTP 400
 * 4. Referenced Resume document not found -> HTTP 404
 * 5. Referenced Candidate document not found -> HTTP 404
 * 6. Referenced JobDescription document not found -> HTTP 404
 *
 * Usage:
 *   node test_interview.js
 */

require("dotenv").config();
const assert = require("assert");
const axios = require("axios");
const mongoose = require("mongoose");

const Candidate = require("./src/models/Candidate");
const Resume = require("./src/models/Resume");
const JobDescription = require("./src/models/JobDescription");
const Interview = require("./src/models/Interview");

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
  console.log("\n=== Feature Member A: Node Backend /api/interview/create Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  let testCandidate = null;
  let testResume = null;
  let testJd = null;
  let createdInterviewId = null;

  // Setup test documents in MongoDB
  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    try {
      await mongoose.connect(MONGO_URI);

      testCandidate = await Candidate.create({
        name: "Test Candidate",
        email: `test.candidate.${Date.now()}@example.com`,
        phone: "+1234567890",
      });

      testResume = await Resume.create({
        candidateId: testCandidate._id,
        fileName: "test_resume.pdf",
        filePath: "uploads/test_resume.pdf",
        fileType: "pdf",
        extractedText: "Software Engineer proficient in React, Node.js, and MongoDB.",
      });

      testJd = await JobDescription.create({
        title: "Full Stack Software Engineer",
        company: "MockMate Tech",
        description: "Looking for a full stack engineer proficient in Node.js and React.",
      });

      console.log(`  Created test Candidate (${testCandidate._id}), Resume (${testResume._id}), and JobDescription (${testJd._id})\n`);
    } catch (dbErr) {
      console.warn("  Warning: Could not set up test documents in MongoDB:", dbErr.message);
    }
  }

  // 1. Missing resumeId -> HTTP 400
  await test("1. Missing required field (resumeId) returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/interview/create`, {
        candidateId: testCandidate ? testCandidate._id.toString() : new mongoose.Types.ObjectId().toString(),
      });
      assert.fail("Expected HTTP 400 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(err.response.data.error.includes("resumeId is required"), `Unexpected error msg: ${err.response.data.error}`);
    }
  });

  // 2. Invalid MongoDB ObjectId format -> HTTP 400
  await test("2. Invalid MongoDB ObjectId format returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/interview/create`, {
        resumeId: "invalid-id-12345",
        candidateId: testCandidate ? testCandidate._id.toString() : new mongoose.Types.ObjectId().toString(),
      });
      assert.fail("Expected HTTP 400 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(err.response.data.error.includes("Invalid resumeId format"), `Unexpected error msg: ${err.response.data.error}`);
    }
  });

  // 3. Referenced Resume document not found -> HTTP 404
  await test("3. Referenced Resume document not found returns HTTP 404", async () => {
    const nonexistentResumeId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/interview/create`, {
        resumeId: nonexistentResumeId,
        candidateId: testCandidate ? testCandidate._id.toString() : new mongoose.Types.ObjectId().toString(),
      });
      assert.fail("Expected HTTP 404 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404, `Expected 404, got ${err.response.status}`);
      assert.ok(err.response.data.error.includes("not found"), `Unexpected error msg: ${err.response.data.error}`);
    }
  });

  // 4. Referenced Candidate document not found -> HTTP 404
  await test("4. Referenced Candidate document not found returns HTTP 404", async () => {
    const nonexistentCandidateId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/interview/create`, {
        resumeId: testResume._id.toString(),
        candidateId: nonexistentCandidateId,
      });
      assert.fail("Expected HTTP 404 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404, `Expected 404, got ${err.response.status}`);
      assert.ok(err.response.data.error.includes("not found"), `Unexpected error msg: ${err.response.data.error}`);
    }
  });

  // 5. Referenced JobDescription document not found -> HTTP 404
  await test("5. Referenced JobDescription document not found returns HTTP 404", async () => {
    const nonexistentJdId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/interview/create`, {
        resumeId: testResume._id.toString(),
        candidateId: testCandidate._id.toString(),
        jobDescriptionId: nonexistentJdId,
      });
      assert.fail("Expected HTTP 404 but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404, `Expected 404, got ${err.response.status}`);
      assert.ok(err.response.data.error.includes("not found"), `Unexpected error msg: ${err.response.data.error}`);
    }
  });

  // 6. Successful Interview Creation -> HTTP 201
  if (testCandidate && testResume && testJd) {
    await test("6. Successful interview creation returns HTTP 201 and Interview details", async () => {
      const res = await axios.post(
        `${BACKEND_URL}/api/interview/create`,
        {
          candidateId: testCandidate._id.toString(),
          resumeId: testResume._id.toString(),
          jobDescriptionId: testJd._id.toString(),
        },
        { timeout: 10000 }
      );

      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      const body = res.data;

      assert.strictEqual(body.success, true);
      assert.ok(body.interviewId, "interviewId missing from response");
      assert.strictEqual(body.interview.candidateId, testCandidate._id.toString());
      assert.strictEqual(body.interview.resumeId, testResume._id.toString());
      assert.strictEqual(body.interview.jobDescriptionId, testJd._id.toString());
      assert.strictEqual(body.interview.status, "scheduled");
      assert.strictEqual(body.interview.currentQuestionIndex, 0);
      assert.strictEqual(body.interview.currentFollowUpCount, 0);
      assert.deepStrictEqual(body.interview.questions, []);

      createdInterviewId = body.interviewId;

      console.log("\n  --- Successful /api/interview/create API Response ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  -----------------------------------------------------\n");
    });
  }

  // Cleanup test documents
  if (mongoose.connection.readyState === 1) {
    try {
      if (createdInterviewId) await Interview.findByIdAndDelete(createdInterviewId);
      if (testCandidate) await Candidate.findByIdAndDelete(testCandidate._id);
      if (testResume) await Resume.findByIdAndDelete(testResume._id);
      if (testJd) await JobDescription.findByIdAndDelete(testJd._id);
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
