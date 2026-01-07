// Required modules
require("dotenv").config();       // .env file load karne ke liye
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Resume = require("./models/Resume"); // Resume model import

const app = express();

// Middleware
app.use(cors());                 // Different origin se requests allow karne ke liye
app.use(express.json());         // JSON body parse karne ke liye

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ------------------- ROUTES -------------------

// 1️⃣ POST API - Add new resume
app.post("/api/resume", async (req, res) => {
  try {
    const resume = new Resume(req.body);   // Request body se data lo
    const savedResume = await resume.save(); // MongoDB me save karo
    res.status(201).json(savedResume);      // Response me saved resume bhejo
  } catch (error) {
    res.status(500).json({ message: "Error saving resume" });
  }
});

// 2️⃣ GET all resumes
app.get("/api/resume", async (req, res) => {
  try {
    const resumes = await Resume.find();   // Sab resumes fetch karo
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resumes" });
  }
});

// 3️⃣ GET resume by ID
app.get("/api/resume/:id", async (req, res) => {
  const { id } = req.params;  // URL se ID lo
  try {
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);  // Specific resume bhejo
  } catch (error) {
    res.status(500).json({ message: "Error fetching resume" });
  }
});

// 4️⃣ PUT resume by ID (update)
app.put("/api/resume/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedResume = await Resume.findByIdAndUpdate(
      id,
      req.body,
      { new: true }  // Updated document return kare
    );

    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(updatedResume); // Updated resume response me bhejo
  } catch (error) {
    res.status(500).json({ message: "Error updating resume" });
  }
});

// ------------------- SERVER -------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
