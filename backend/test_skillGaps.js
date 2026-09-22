/**
 * test_skillGaps.js
 * ==================
 * Verification test for skillGaps calculation and API data flow.
 *
 * Verifies:
 * 1. matchingFeatureExtractor.js computes matchedSkills and skillGaps deterministically.
 * 2. POST /api/match returns non-empty skillGaps when candidate is missing required JD skills.
 *
 * Usage:
 *   node test_skillGaps.js
 */

require("dotenv").config();
const assert = require("assert");
const axios = require("axios");
const mongoose = require("mongoose");
const Resume = require("./src/models/Resume");
const { extractMatchingFeatures } = require("./src/services/matchingFeatureExtractor");

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
  console.log("\n=== Feature 4F / Pre-RAG Verification: skillGaps Data Flow Tests ===\n");

  // 1. Direct Unit Test of matchingFeatureExtractor
  await test("1. matchingFeatureExtractor correctly identifies matchedSkills and skillGaps", () => {
    const resumeData = {
      extractedText: "Experienced developer skilled in React, JavaScript, and Node.js.",
      skills: ["React", "JavaScript", "Node.js"],
    };
    const jdData = {
      requiredSkills: ["React", "Node.js", "TypeScript", "Python"],
      description: "Full stack software engineer position.",
    };

    const result = extractMatchingFeatures(resumeData, jdData);

    assert.ok(result.matchedSkills.includes("React"), "React should be in matchedSkills");
    assert.ok(result.matchedSkills.includes("Node.js"), "Node.js should be in matchedSkills");
    assert.ok(result.skillGaps.includes("TypeScript"), "TypeScript should be in skillGaps");
    assert.ok(result.skillGaps.includes("Python"), "Python should be in skillGaps");
  });

  // 2. Integration test via POST /api/match
  if (MONGO_URI && MONGO_URI !== "your_mongodb_connection_string") {
    let testResumeId = null;
    try {
      await mongoose.connect(MONGO_URI);

      const testResume = await Resume.create({
        candidateId: new mongoose.Types.ObjectId(),
        fileName: "test_resume_skillgaps.pdf",
        filePath: "uploads/test_resume_skillgaps.pdf",
        fileType: "pdf",
        extractedText: "Full stack engineer with 3 years of experience in React, JavaScript, and Node.js.",
        skills: ["React", "JavaScript", "Node.js"],
      });
      testResumeId = testResume._id.toString();

      await test("2. POST /api/match returns calculated skillGaps for missing skills", async () => {
        const jdText = "Role requires React, Node.js, TypeScript, and Python.";
        const res = await axios.post(`${BACKEND_URL}/api/match`, {
          resumeId: testResumeId,
          jdText: jdText,
        });

        assert.strictEqual(res.status, 200);
        const body = res.data;

        assert.ok(Array.isArray(body.skillGaps), "skillGaps must be an array");
        assert.ok(body.skillGaps.length > 0, "skillGaps should not be empty when skills are missing");
        assert.ok(body.skillGaps.includes("TypeScript"), "skillGaps should include TypeScript");

        console.log("\n  --- Sample /api/match Response with skillGaps ---");
        console.log(JSON.stringify(body, null, 2));
        console.log("  ------------------------------------------------\n");
      });

      // Cleanup
      if (testResumeId) {
        await Resume.findByIdAndDelete(testResumeId);
      }
      await mongoose.disconnect();
    } catch (dbErr) {
      console.warn("  Warning: DB test setup encountered an error:", dbErr.message);
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
