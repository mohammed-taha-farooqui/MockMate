/**
 * matchRoutes.js
 * ==============
 * Express router for Feature 4E – Resume & Job Description Match Scoring.
 */

const express = require("express");
const { getMatchResult } = require("../controllers/matchController");

const router = express.Router();

// POST /api/match
router.post("/", getMatchResult);

module.exports = router;
