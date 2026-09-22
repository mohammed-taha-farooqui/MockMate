const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: [true, "Candidate reference is required"]
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: [true, "Resume reference is required"]
        },
        jobDescriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobDescription"
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],
        status: {
            type: String,
            enum: ["scheduled", "in-progress", "completed", "cancelled"],
            default: "scheduled"
        },
        currentQuestionIndex: {
            type: Number,
            default: 0
        },
        currentFollowUpCount: {
            type: Number,
            default: 0
        },
        startedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Interview", interviewSchema);
