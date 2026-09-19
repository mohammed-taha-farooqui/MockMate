/**
 * interviewRoutes.js
 * ==================
 * Express router for Interview creation API.
 */

const express = require("express");
const { createInterview } = require("../controllers/interviewController");

const router = express.Router();

// POST /api/interview/create
router.post("/create", createInterview);

module.exports = router;
