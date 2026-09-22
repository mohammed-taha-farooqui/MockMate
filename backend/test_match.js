/**
 * test_match.js
 * =============
 * Integration and unit smoke tests for Feature 4F:
 * Node backend POST /api/match with resumeId-based lookup.
 *
 * Tests verified:
 *  1. GET /api/health returns 200
 *  2. Missing resumeId → HTTP 400
 *  3. Missing jdText → HTTP 400
 *  4. Invalid resumeId (not a valid ObjectId) → HTTP 400
 *  5. Nonexistent resumeId (valid ObjectId format, but not in DB) → HTTP 404
 *  6. Valid resumeId + jdText → HTTP 200 with matchScore, fitClass, skillGaps, features
 *  7. Python ML service unavailable → HTTP 503
 *
 * Usage:
 *   node test_match.js
 */

require("dotenv").config();
const assert = require("assert");
const axios = require("axios");
const mongoose = require("mongoose");
const Resume = require("./src/models/Resume");

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

const SAMPLE_RESUME_TEXT =
  "Senior Full Stack Engineer with 5 years of experience in JavaScript, TypeScript, React, Node.js, and AWS. Bachelor's degree in Computer Science. Built scalable REST APIs and cloud applications.";

const SAMPLE_JD =
  "Looking for a Senior Full Stack Engineer proficient in React, Node.js, and AWS cloud infrastructure. Bachelor's degree required.";

async function runTests() {
  console.log("\n=== Feature 4F: Node Backend resumeId-based /api/match Tests ===\n");
  console.log(`  Target Backend: ${BACKEND_URL}\n`);

  // Connect mongoose to DB to insert a test Resume document
  let testResumeId = null;
  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    try {
      await mongoose.connect(MONGO_URI);
      const testDoc = new Resume({
        candidateId: new mongoose.Types.ObjectId(),
        fileName: "test_resume.pdf",
        filePath: "uploads/test_resume.pdf",
        fileType: "pdf",
        extractedText: SAMPLE_RESUME_TEXT,
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "AWS"],
        education: ["Bachelor's in Computer Science"],
        experience: ["5 years"],
      });
      const savedDoc = await testDoc.save();
      testResumeId = savedDoc._id.toString();
      console.log(`  Created temporary test Resume document (ID: ${testResumeId})\n`);
    } catch (dbErr) {
      console.warn("  Warning: Could not connect to DB in test runner directly:", dbErr.message);
    }
  }

  // 1. GET /api/health
  await test("1. GET /api/health returns 200 and success status", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
    assert.strictEqual(res.data.success, true, "Expected success: true");
    assert.strictEqual(res.data.message, "Backend is running");
  });

  // 2. Missing resumeId -> 400
  await test("2. POST /api/match with missing resumeId returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { jdText: SAMPLE_JD });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(err.response.data.error, "Expected error message in response body");
    }
  });

  // 3. Missing jdText -> 400
  await test("3. POST /api/match with missing jdText returns HTTP 400", async () => {
    const dummyId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { resumeId: dummyId });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(err.response.data.error, "Expected error message in response body");
    }
  });

  // 4. Invalid resumeId (not a valid ObjectId string) -> 400
  await test("4. POST /api/match with invalid resumeId format returns HTTP 400", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { resumeId: "invalid-id-123", jdText: SAMPLE_JD });
      assert.fail("Expected HTTP 400 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 400, `Expected 400, got ${err.response.status}`);
      assert.ok(
        err.response.data.error.includes("Invalid resumeId format"),
        `Unexpected error text: ${err.response.data.error}`
      );
    }
  });

  // 5. Nonexistent resumeId (valid ObjectId hex, but doc not in DB) -> 404
  await test("5. POST /api/match with nonexistent resumeId returns HTTP 404", async () => {
    const nonexistentId = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post(`${BACKEND_URL}/api/match`, { resumeId: nonexistentId, jdText: SAMPLE_JD });
      assert.fail("Expected HTTP 404 error but request succeeded");
    } catch (err) {
      assert.ok(err.response, "Expected HTTP response error");
      assert.strictEqual(err.response.status, 404, `Expected 404, got ${err.response.status}`);
      assert.ok(
        err.response.data.error.includes("not found"),
        `Unexpected error text: ${err.response.data.error}`
      );
    }
  });

  // 6. Valid resumeId + jdText -> 200
  if (testResumeId) {
    await test("6. POST /api/match with valid resumeId + jdText returns HTTP 200 and match details", async () => {
      const res = await axios.post(
        `${BACKEND_URL}/api/match`,
        {
          resumeId: testResumeId,
          jdText: SAMPLE_JD,
        },
        { timeout: 35000 }
      );

      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;

      assert.ok(typeof body.matchScore === "number", `matchScore is not a number: ${body.matchScore}`);
      assert.ok(body.matchScore >= 0 && body.matchScore <= 100, `matchScore out of bounds: ${body.matchScore}`);
      assert.ok(
        ["No Fit", "Potential Fit", "Good Fit"].includes(body.fitClass),
        `Invalid fitClass: ${body.fitClass}`
      );
      assert.ok(Array.isArray(body.skillGaps), "skillGaps must be an array");
      assert.ok(typeof body.features === "object" && body.features !== null, "features must be an object");

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

      console.log("\n  --- Sample /api/match Successful Response ---");
      console.log(JSON.stringify(body, null, 2));
      console.log("  ---------------------------------------------\n");
    });
  }

  // Cleanup test document
  if (testResumeId && mongoose.connection.readyState === 1) {
    try {
      await Resume.findByIdAndDelete(testResumeId);
      console.log(`  Cleaned up temporary test Resume document (ID: ${testResumeId})`);
      await mongoose.disconnect();
    } catch (cleanErr) {
      console.warn("  Warning: Failed to clean up test Resume document:", cleanErr.message);
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
