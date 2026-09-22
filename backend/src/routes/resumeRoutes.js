const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadResume } = require("../controllers/resumeController");

const router = express.Router();

// Multer error-handling wrapper
function handleMulterError(err, req, res, next) {
  if (err && err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
}

// POST /api/resume/upload
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadResume
);

module.exports = router;
