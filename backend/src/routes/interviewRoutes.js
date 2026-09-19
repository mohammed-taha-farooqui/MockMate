/**
 * interviewRoutes.js
 * ==================
 * Express router for Interview creation, results, and report aggregation APIs.
 */

const express = require("express");
const {
  createInterview,
  getInterviewResults,
  getInterviewReport,
} = require("../controllers/interviewController");

const router = express.Router();

// POST /api/interview/create
router.post("/create", createInterview);

// GET /api/interview/:id/results
router.get("/:id/results", getInterviewResults);

// GET /api/interview/:id/report
router.get("/:id/report", getInterviewReport);

module.exports = router;
