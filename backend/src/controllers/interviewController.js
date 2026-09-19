/**
 * interviewController.js
 * =======================
 * Controller for Member A Backend Features:
 * - Interview Creation API (POST /api/interview/create)
 * - Interview Results API (GET /api/interview/:id/results)
 * - Final Report Aggregation API (GET /api/interview/:id/report)
 */

const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Candidate = require("../models/Candidate");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Report = require("../models/Report");
const { extractMatchingFeatures } = require("../services/matchingFeatureExtractor");

/**
 * POST /api/interview/create
 */
async function createInterview(req, res) {
  try {
    const { candidateId, resumeId, jobDescriptionId } = req.body || {};

    // 1. Validate resumeId input
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        error: "resumeId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid resumeId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 2. Verify Resume document exists
    let resumeDoc;
    try {
      resumeDoc = await Resume.findById(resumeId);
    } catch (dbErr) {
      console.error("[InterviewController] Resume lookup error:", dbErr.message);
      return res.status(500).json({
        success: false,
        error: "Database error while querying Resume.",
      });
    }

    if (!resumeDoc) {
      return res.status(404).json({
        success: false,
        error: `Resume document with id '${resumeId}' not found.`,
      });
    }

    // 3. Determine candidateId to use (from request body or fallback to resumeDoc.candidateId)
    const candidateIdToUse = candidateId || (resumeDoc.candidateId ? resumeDoc.candidateId.toString() : null);

    if (!candidateIdToUse) {
      return res.status(400).json({
        success: false,
        error: "candidateId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateIdToUse)) {
      return res.status(400).json({
        success: false,
        error: "Invalid candidateId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 4. Verify Candidate document exists
    let candidateDoc;
    try {
      candidateDoc = await Candidate.findById(candidateIdToUse);
    } catch (dbErr) {
      console.error("[InterviewController] Candidate lookup error:", dbErr.message);
      return res.status(500).json({
        success: false,
        error: "Database error while querying Candidate.",
      });
    }

    if (!candidateDoc) {
      return res.status(404).json({
        success: false,
        error: `Candidate document with id '${candidateIdToUse}' not found.`,
      });
    }

    // 5. If jobDescriptionId is provided, validate and verify JobDescription document exists
    let validJdId = null;
    if (jobDescriptionId) {
      if (!mongoose.Types.ObjectId.isValid(jobDescriptionId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid jobDescriptionId format. Must be a valid MongoDB ObjectId.",
        });
      }

      let jdDoc;
      try {
        jdDoc = await JobDescription.findById(jobDescriptionId);
      } catch (dbErr) {
        console.error("[InterviewController] JobDescription lookup error:", dbErr.message);
        return res.status(500).json({
          success: false,
          error: "Database error while querying JobDescription.",
        });
      }

      if (!jdDoc) {
        return res.status(404).json({
          success: false,
          error: `JobDescription document with id '${jobDescriptionId}' not found.`,
        });
      }
      validJdId = jdDoc._id;
    }

    // 6. Create & initialize Interview document
    const interviewData = {
      candidateId: candidateDoc._id,
      resumeId: resumeDoc._id,
      status: "scheduled",
      currentQuestionIndex: 0,
      currentFollowUpCount: 0,
      questions: [],
    };

    if (validJdId) {
      interviewData.jobDescriptionId = validJdId;
    }

    const interview = new Interview(interviewData);
    await interview.save();

    // 7. Return success response
    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interviewId: interview._id.toString(),
      interview: {
        id: interview._id.toString(),
        candidateId: interview.candidateId.toString(),
        resumeId: interview.resumeId.toString(),
        jobDescriptionId: interview.jobDescriptionId ? interview.jobDescriptionId.toString() : null,
        status: interview.status,
        currentQuestionIndex: interview.currentQuestionIndex,
        currentFollowUpCount: interview.currentFollowUpCount,
        questions: interview.questions,
        createdAt: interview.createdAt,
      },
    });
  } catch (err) {
    console.error("[InterviewController] Unexpected error:", err.message);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while creating the interview.",
    });
  }
}

/**
 * GET /api/interview/:id/results
 */
async function getInterviewResults(req, res) {
  try {
    const { id } = req.params;

    // 1. Validate interview ID as a MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid interviewId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 2. Verify Interview exists
    let interviewDoc;
    try {
      interviewDoc = await Interview.findById(id);
    } catch (dbErr) {
      console.error("[InterviewController] Database query error:", dbErr.message);
      return res.status(500).json({
        error: "Database error while querying Interview.",
      });
    }

    if (!interviewDoc) {
      return res.status(404).json({
        error: `Interview document with id '${id}' not found.`,
      });
    }

    // 3. Fetch all Questions belonging to the interview
    let questions = [];
    try {
      questions = await Question.find({ interviewId: id }).sort({ order: 1, createdAt: 1 });
    } catch (dbErr) {
      console.error("[InterviewController] Questions fetch error:", dbErr.message);
      return res.status(500).json({
        error: "Database error while fetching questions.",
      });
    }

    // 4. Fetch all Answers belonging to the interview
    let answersList = [];
    try {
      answersList = await Answer.find({ interviewId: id });
    } catch (dbErr) {
      console.error("[InterviewController] Answers fetch error:", dbErr.message);
      return res.status(500).json({
        error: "Database error while fetching answers.",
      });
    }

    // Map answers by questionId string for quick lookup
    const answerMap = new Map();
    answersList.forEach((ans) => {
      if (ans.questionId) {
        answerMap.set(ans.questionId.toString(), ans);
      }
    });

    // 5. Build question-answer items & metrics
    let totalQuestions = questions.length;
    let answeredQuestions = 0;
    let totalScoreSum = 0;

    const answersArray = questions.map((q) => {
      const qIdStr = q._id.toString();
      const ans = answerMap.get(qIdStr);

      if (ans && ans.score !== null && ans.score !== undefined) {
        answeredQuestions += 1;
        totalScoreSum += Number(ans.score) || 0;

        return {
          questionId: qIdStr,
          questionText: q.questionText || "",
          questionType: q.questionType || "technical",
          answerText: ans.answerText || "",
          score: ans.score,
          features: ans.features ? {
            semanticSimilarity: ans.features.semanticSimilarity || 0,
            keywordOverlap: ans.features.keywordOverlap || 0,
            answerLength: ans.features.answerLength || 0,
            technicalKeywordCount: ans.features.technicalKeywordCount || 0,
          } : null,
        };
      } else if (ans) {
        // Answer document exists but score is null/undefined
        answeredQuestions += 1;
        return {
          questionId: qIdStr,
          questionText: q.questionText || "",
          questionType: q.questionType || "technical",
          answerText: ans.answerText || "",
          score: null,
          features: null,
        };
      } else {
        // No answer document exists for this question
        return {
          questionId: qIdStr,
          questionText: q.questionText || "",
          questionType: q.questionType || "technical",
          answerText: null,
          score: null,
          features: null,
        };
      }
    });

    // 6. Calculate average answer score (rounded to 2 decimal places)
    let averageAnswerScore = 0;
    if (answeredQuestions > 0) {
      averageAnswerScore = Math.round((totalScoreSum / answeredQuestions) * 100) / 100;
    }

    // 7. Return JSON response
    return res.status(200).json({
      interviewId: interviewDoc._id.toString(),
      status: interviewDoc.status || "scheduled",
      totalQuestions: totalQuestions,
      answeredQuestions: answeredQuestions,
      averageAnswerScore: averageAnswerScore,
      answers: answersArray,
    });
  } catch (err) {
    console.error("[InterviewController] Unexpected error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred while retrieving interview results.",
    });
  }
}

/**
 * GET /api/interview/:id/report
 */
async function getInterviewReport(req, res) {
  try {
    const { id } = req.params;

    // 1. Validate interview ID as a MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid interviewId format. Must be a valid MongoDB ObjectId.",
      });
    }

    // 2. Verify Interview exists
    let interviewDoc;
    try {
      interviewDoc = await Interview.findById(id);
    } catch (dbErr) {
      console.error("[InterviewController] Database query error:", dbErr.message);
      return res.status(500).json({
        error: "Database error while querying Interview.",
      });
    }

    if (!interviewDoc) {
      return res.status(404).json({
        error: `Interview document with id '${id}' not found.`,
      });
    }

    // 3. Fetch Questions and Answers belonging to the interview
    let questions = [];
    let answers = [];
    try {
      questions = await Question.find({ interviewId: id });
      answers = await Answer.find({ interviewId: id });
    } catch (dbErr) {
      console.error("[InterviewController] Questions/Answers lookup error:", dbErr.message);
      return res.status(500).json({
        error: "Database error while fetching interview Q&A.",
      });
    }

    // 4. Calculate totalQuestions, answeredQuestions, averageAnswerScore
    const totalQuestions = questions.length;
    const validAnswers = answers.filter((a) => a.score !== null && a.score !== undefined);
    const answeredQuestions = validAnswers.length;

    let averageAnswerScore = 0;
    if (answeredQuestions > 0) {
      const sumScore = validAnswers.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
      averageAnswerScore = Math.round((sumScore / answeredQuestions) * 100) / 100;
    }

    // 5. Get skill gaps and matchScore using existing matching pipeline if resumeId and jobDescriptionId exist
    let skillGaps = [];
    let matchScore = 0;

    if (interviewDoc.resumeId && interviewDoc.jobDescriptionId) {
      try {
        const resumeDoc = await Resume.findById(interviewDoc.resumeId);
        const jdDoc = await JobDescription.findById(interviewDoc.jobDescriptionId);

        if (resumeDoc && jdDoc) {
          const matchingFeatures = extractMatchingFeatures(resumeDoc, jdDoc);
          skillGaps = matchingFeatures.skillGaps || [];
          matchScore = Math.round((matchingFeatures.skillOverlap || 0) * 100);
        }
      } catch (matchErr) {
        console.warn("[InterviewController] Error extracting matching features:", matchErr.message);
      }
    }

    // 6. Derive simple strengths from answers with score >= 4.0
    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    const strengthsSet = new Set();
    validAnswers.forEach((ans) => {
      if (ans.score >= 4.0) {
        const q = questionMap.get(ans.questionId ? ans.questionId.toString() : "");
        if (q) {
          if (q.targetSkill && q.targetSkill.trim()) {
            strengthsSet.add(q.targetSkill.trim());
          } else if (q.questionText && q.questionText.trim()) {
            strengthsSet.add(`Strong response: ${q.questionText.trim()}`);
          }
        }
      }
    });
    const strengths = Array.from(strengthsSet);

    // 7. Create or update Report document (prevents duplicate reports)
    let reportDoc;
    try {
      reportDoc = await Report.findOne({ interviewId: id });
      if (reportDoc) {
        reportDoc.candidateId = interviewDoc.candidateId;
        reportDoc.matchScore = matchScore;
        reportDoc.averageAnswerScore = averageAnswerScore;
        reportDoc.skillGaps = skillGaps;
        reportDoc.strengths = strengths;
        await reportDoc.save();
      } else {
        reportDoc = await Report.create({
          interviewId: id,
          candidateId: interviewDoc.candidateId,
          matchScore: matchScore,
          averageAnswerScore: averageAnswerScore,
          skillGaps: skillGaps,
          strengths: strengths,
        });
      }
    } catch (reportErr) {
      console.error("[InterviewController] Report create/update error:", reportErr.message);
      return res.status(500).json({
        error: "Failed to generate or save report document.",
      });
    }

    // 8. Return response
    return res.status(200).json({
      reportId: reportDoc._id.toString(),
      interviewId: interviewDoc._id.toString(),
      candidateId: interviewDoc.candidateId ? interviewDoc.candidateId.toString() : null,
      matchScore: reportDoc.matchScore,
      averageAnswerScore: reportDoc.averageAnswerScore,
      skillGaps: reportDoc.skillGaps,
      strengths: reportDoc.strengths,
      answeredQuestions: answeredQuestions,
      totalQuestions: totalQuestions,
    });
  } catch (err) {
    console.error("[InterviewController] Unexpected error:", err.message);
    return res.status(500).json({
      error: "An unexpected error occurred while generating the interview report.",
    });
  }
}

module.exports = { createInterview, getInterviewResults, getInterviewReport };
