import express from 'express';
import Resume from '../models/Resume.js';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const router = express.Router();

// GET All (Filtered by User)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(401).json({ message: "UserId required" });

        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET One
router.get('/:id', async (req, res) => {
    try {
        const resume = await Resume.findOne({ id: req.params.id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST AI Score
router.post('/score', async (req, res) => {
    try {
        const { markdown } = req.body;
        if (!markdown || markdown.trim() === '') {
            return res.status(400).json({ message: "CV content required for scoring" });
        }

        const prompt = `Analyze the following CV markdown and provide a score out of 100 based strictly on this JSON format:
{
  "totalScore": 78,
  "breakdown": {
    "contact": 8,
    "summary": 12,
    "experience": 25,
    "skills": 20,
    "education": 13
  },
  "tips": [
    "Add more quantifiable results in the experience section.",
    "Include a link to your portfolio or LinkedIn."
  ]
}
Max breakdown scores: contact (10), summary (15), experience (30), skills (25), education (20).

CV Content:
${markdown}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const jsonScore = JSON.parse(response.text);
        res.json(jsonScore);

    } catch (err) {
        console.error("Scoring Error:", err);
        res.status(500).json({ message: "Failed to score CV with AI. Please try again." });
    }
});

// POST Create
router.post('/', async (req, res) => {
    console.log("Received POST /api/resumes body:", req.body);
    const { id, title, desc, script, date, parentId, cvFormat, userId } = req.body;

    if (!userId) return res.status(401).json({ message: "UserId required to save" });

    const resumeId = id || new mongoose.Types.ObjectId().toString();

    const newResume = new Resume({
        id: resumeId, title, desc, script, date, parentId, cvFormat, userId
    });

    try {
        const savedResume = await newResume.save();
        console.log("Saved successfully:", savedResume);
        res.status(201).json(savedResume);
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// PUT Update
router.put('/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: "UserId required" });

        const updatedResume = await Resume.findOneAndUpdate(
            { id: req.params.id, userId },
            req.body,
            { new: true }
        );
        if (!updatedResume) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json(updatedResume);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE Remove
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(401).json({ message: "UserId required" });

        const result = await Resume.findOneAndDelete({ id: req.params.id, userId });
        if (!result) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
