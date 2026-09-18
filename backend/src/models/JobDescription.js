const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true
        },
        company: {
            type: String,
            trim: true,
            default: ""
        },
        description: {
            type: String,
            required: [true, "Job description text is required"]
        },
        requiredSkills: {
            type: [String],
            default: []
        },
        preferredSkills: {
            type: [String],
            default: []
        },
        experienceRequired: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);
