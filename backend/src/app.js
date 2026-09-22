const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./services/db");

// Routes
const authRouter = require("./routes/authRoutes");
const resumeRouter = require("./routes/resumeRoutes");
const matchRouter = require("./routes/matchRoutes");
const interviewRouter = require("./routes/interviewRoutes");
const answerScoreRouter = require("./routes/answerScoreRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/match", matchRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/score-answer", answerScoreRouter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    res.status(200).json({
        success: true,
        message: "Backend is running",
        timestamp: new Date().toISOString(),
        database: dbStatusMap[dbState] || "unknown"
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});

module.exports = app;
