const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: [true, "Interview reference is required"],
            unique: true
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate"
        },
        matchScore: {
            type: Number,
            default: 0
        },
        fitClass: {
            type: String,
            default: ""
        },
        averageAnswerScore: {
            type: Number,
            default: 0
        },
        finalScore: {
            type: Number,
            default: 0
        },
        skillGaps: {
            type: [String],
            default: []
        },
        strengths: {
            type: [String],
            default: []
        },
        weaknesses: {
            type: [String],
            default: []
        },
        feedback: {
            type: String,
            default: ""
        },
        recommendations: {
            type: [String],
            default: []
        },
        emailStatus: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending"
        },
        emailSentAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Report", reportSchema);
