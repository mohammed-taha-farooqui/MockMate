const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

// Destination: backend/uploads (relative to this file: src/middleware -> ../../uploads)
const uploadDir = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString("hex");
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    // Pass the error to multer; the controller handles it
    cb(new Error("Invalid file type. Only PDF files are allowed."), false);
  }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
