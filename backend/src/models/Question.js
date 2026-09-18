const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: [true, "Interview reference is required"]
        },
        questionText: {
            type: String,
            required: [true, "Question text is required"],
            trim: true
        },
        referenceAnswer: {
            type: String,
            default: ""
        },
        questionType: {
            type: String,
            enum: ["technical", "behavioral", "situational", "follow-up"],
            default: "technical"
        },
        targetSkill: {
            type: String,
            trim: true,
            default: ""
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium"
        },
        order: {
            type: Number,
            default: 1
        },
        isFollowUp: {
            type: Boolean,
            default: false
        },
        parentQuestionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Question", questionSchema);
