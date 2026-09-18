const path = require("path");
const fs = require("fs");
const Resume = require("../models/Resume");
const { parseResumePdf } = require("../services/resumeParser");
const { cleanResumeText } = require("../services/textCleaner");
const { extractFields } = require("../services/fieldExtractor");

/**
 * POST /api/resume/upload
 * Accepts a PDF resume via multipart/form-data (field: "resume"),
 * parses it, extracts fields, and saves to MongoDB.
 */
async function uploadResume(req, res) {
  try {
    // 1. Check a file was provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file uploaded." });
    }

    // 2. Confirm it is a PDF (belt-and-suspenders after multer fileFilter)
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, message: "Invalid file type. Only PDF files are allowed." });
    }

    const filePath = req.file.path;

    // 3. Parse PDF → raw text
    let rawText;
    try {
      rawText = await parseResumePdf(filePath);
    } catch (err) {
      console.error("PDF parsing error:", err.message);
      return res.status(500).json({ success: false, message: "Failed to parse the PDF file." });
    }

    // 4. Clean text
    const cleanedText = cleanResumeText(rawText);

    // 5. Extract structured fields
    const extractedFields = extractFields(cleanedText);

    // 6. Build and persist the Resume document
    //    The Resume model requires candidateId; we use a placeholder ObjectId
    //    until the Candidate auth system is wired up.
    const mongoose = require("mongoose");
    const placeholderId = new mongoose.Types.ObjectId();

    let resume;
    try {
      resume = new Resume({
        candidateId: placeholderId,
        fileName: req.file.originalname,
        filePath: filePath,
        fileType: "pdf",
        extractedText: cleanedText,
        skills: extractedFields.skills,
        education: extractedFields.education,
        experience: extractedFields.experience,
        contactEmail: extractedFields.email,
      });
      await resume.save();
    } catch (err) {
      console.error("MongoDB save error:", err.message);
      return res.status(500).json({ success: false, message: "Failed to save resume to the database." });
    }

    // 7. Respond
    return res.status(200).json({
      success: true,
      resumeId: resume._id.toString(),
      extractedFields: {
        email: extractedFields.email,
        phone: extractedFields.phone,
        skills: extractedFields.skills,
        education: extractedFields.education,
        experience: extractedFields.experience,
      },
    });
  } catch (err) {
    console.error("Unexpected error in uploadResume:", err.message);
    return res.status(500).json({ success: false, message: "An unexpected error occurred." });
  }
}

module.exports = { uploadResume };
