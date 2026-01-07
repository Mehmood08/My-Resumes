import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resume from './models/Resume.js';

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Auth Route
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
        }

        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token: sessionToken, user });
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ message: "Invalid Token" });
    }
});

// AI Generation Route
app.post('/api/ai/generate', async (req, res) => {
    const { prompt, context } = req.body;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("AI Request started. Key exists:", !!apiKey);
        if (apiKey) console.log("Key prefix:", apiKey.substring(0, 7));

        // Use the model - trying 'gemini-1.5-flash' which is the standard
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const systemText = "You are a professional CV and Resume writing expert. " +
            "Your task is to help the user write, polish, or expand their professional resume. " +
            "Always respond with professional, high-impact language. " +
            "Keep responses concise and formatted in clean Markdown suitable for a CV.";

        const fullPrompt = `${systemText}\n\nContext (Current CV Content): ${context}\n\nTask: ${prompt}`;

        console.log("Calling Google AI Content Generation...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
        });

        const response = await result.response;
        const text = response.text();

        console.log("AI Response received successfully.");
        res.json({ text });
    } catch (err) {
        console.error("AI Backend Error Details:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error(err);
        }
        res.status(500).json({ message: "AI Generation failed", error: err.message });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', status: 'success' });
});

// GET All (Filtered by User)
app.get('/api/resumes', async (req, res) => {
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
app.get('/api/resumes/:id', async (req, res) => {
    try {
        const resume = await Resume.findOne({ id: req.params.id });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Create
app.post('/api/resumes', async (req, res) => {
    console.log("Received POST /api/resumes body:", req.body); // DEBUG
    const { id, title, desc, script, date, parentId, cvFormat, userId } = req.body;

    if (!userId) return res.status(401).json({ message: "UserId required to save" });

    // If ID is not provided, generate one
    const resumeId = id || new mongoose.Types.ObjectId().toString();

    const newResume = new Resume({
        id: resumeId, title, desc, script, date, parentId, cvFormat, userId
    });

    try {
        const savedResume = await newResume.save();
        console.log("Saved successfully:", savedResume); // DEBUG
        res.status(201).json(savedResume);
    } catch (err) {
        console.error("Save Error:", err.message); // DEBUG
        res.status(400).json({ message: err.message });
    }
});

// PUT Update
app.put('/api/resumes/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: "UserId required" });

        const updatedResume = await Resume.findOneAndUpdate(
            { id: req.params.id, userId }, // Must match both ID and Owner
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
app.delete('/api/resumes/:id', async (req, res) => {
    try {
        const { userId } = req.query; // Pass userId as query param for delete
        if (!userId) return res.status(401).json({ message: "UserId required" });

        const result = await Resume.findOneAndDelete({ id: req.params.id, userId });
        if (!result) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
