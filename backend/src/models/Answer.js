const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: [true, "Interview reference is required"]
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: [true, "Question reference is required"]
        },
        answerText: {
            type: String,
            required: [true, "Answer text is required"]
        },
        transcript: {
            type: String,
            default: ""
        },
        mode: {
            type: String,
            enum: ["text", "voice"],
            default: "text"
        },
        score: {
            type: Number,
            min: 0,
            max: 10,
            default: null
        },
        features: {
            semanticSimilarity: { type: Number, default: 0 },
            keywordOverlap: { type: Number, default: 0 },
            answerLength: { type: Number, default: 0 },
            technicalKeywordCount: { type: Number, default: 0 }
        },
        feedback: {
            strengths: { type: String, default: "" },
            missingPoints: { type: String, default: "" },
            improvement: { type: String, default: "" }
        },
        sentimentConfidence: {
            label: { type: String, default: "" },
            score: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Answer", answerSchema);
