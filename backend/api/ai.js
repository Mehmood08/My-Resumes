import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// AI Generation Route
router.post('/generate', async (req, res) => {
    const { prompt, context } = req.body;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("AI Request started. Key exists:", !!apiKey);
        if (apiKey) console.log("Key prefix:", apiKey.substring(0, 7));

        const genAI = new GoogleGenerativeAI(apiKey);
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

export default router;
