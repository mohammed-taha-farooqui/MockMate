const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: [true, "Candidate reference is required"]
        },
        fileName: {
            type: String,
            required: [true, "Original file name is required"],
            trim: true
        },
        filePath: {
            type: String,
            default: ""
        },
        fileType: {
            type: String,
            default: ""
        },
        extractedText: {
            type: String,
            default: ""
        },
        skills: {
            type: [String],
            default: []
        },
        education: {
            type: [String],
            default: []
        },
        experience: {
            type: [String],
            default: []
        },
        contactEmail: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);
