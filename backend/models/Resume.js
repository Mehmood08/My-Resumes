const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  skills: { type: [String], default: [] },
  experience: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
