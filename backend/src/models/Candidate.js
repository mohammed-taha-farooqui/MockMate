const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Candidate name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Candidate email is required"],
            unique: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Candidate", candidateSchema);
