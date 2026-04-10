import express from 'express';
import Resume from '../models/Resume.js';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

/**
 * Truncates long Job Descriptions to stay within Gemini token limits.
 * Focuses on extracting the most relevant sections if keywords like 'Requirements' are found.
 */
const truncateJD = (jd) => {
    if (!jd) return "";
    if (jd.length <= 2500) return jd;

    // Try to find the start of the most important sections
    const keywords = ["Requirements", "Responsibilities", "Qualification", "What we look for", "Required Skills", "Qualifications"];
    let bestStart = -1;

    for (const kw of keywords) {
        const found = jd.toLowerCase().indexOf(kw.toLowerCase());
        if (found !== -1 && (bestStart === -1 || found < bestStart)) {
            bestStart = found;
        }
    }

    if (bestStart !== -1) {
        // Start from 200 chars before the keyword if possible to get context
        const start = Math.max(0, bestStart - 200);
        return jd.substring(start, start + 3000) + "... (truncated for brevity)";
    }

    // Default: Just take the first 3000 characters
    return jd.substring(0, 3000) + "... (truncated for brevity)";
};

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

        const prompt = `Act as an expert HR Recruiter. Analyze the following CV markdown and provide a score out of 100 based strictly on this JSON format:
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
    "Experience: You haven't mentioned any metrics. Industry standard is to use quantifiable results (e.g., 'Increased sales by 20%').",
    "Summary: Your summary is too generic. Professionals highlight their specialized skills and years of experience in the first sentence."
  ]
}
Max breakdown scores: contact (10), summary (15), experience (30), skills (25), education (20).

Crucial Instruction for "tips": 
Ensure you provide 3 to 5 tips. Do NOT give generic advice. Be very specific about what is missing in their CV. For each tip, explicitly state what is lacking, and then explain the "Industry Standard" (what top professionals do) so the user clearly understands how to fix it.

CV Content:
${markdown}
`;

        const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log("Raw Gemini text:", response.text);
        const jsonScore = JSON.parse(response.text);
        res.json(jsonScore);

    } catch (err) {
        console.error("Scoring Error:", err);
        res.status(500).json({ message: "Failed to score CV with AI. Please try again.", error: err.message, stack: err.stack });
    }
});

// POST AI Generation
router.post('/generate', async (req, res) => {
    try {
        const { education, year, school, schoolCity, summary, jd, fullName, email, phone, city, linkedin, github, experienceYears } = req.body;

        if (!education || !jd) {
            return res.status(400).json({ message: "Education and Job Description are required" });
        }

        const truncatedJD = truncateJD(jd);
        
        const contactLine = [
            city || "[City]",
            email || "[Email]",
            phone || "[Phone]"
        ].join(" | ");

        let linksLine = "";
        if (linkedin || github) {
            linksLine = [linkedin || "", github || ""].filter(Boolean).join(" | ") + "\n";
        }

        const prompt = `Act as an elite CV Writer, Career Coach, and Universal Job Match-Maker. 
Create a professional CV in Markdown format perfectly tailored to the Target Job Description.

User Contact Info:
- Name: ${fullName || "[Your Name]"}
- Email: ${email || "[Email]"}
- Phone: ${phone || "[Phone]"}
- Location: ${city || "[City]"}
- LinkedIn: ${linkedin || "Not Provided"}
- GitHub: ${github || "Not Provided"}

User Profile:
- Recent Education: ${education}
- University/College: ${school || "[University Name]"}, ${schoolCity || "[City]"}
- Completion Year: ${year}
- Total Years of Experience: ${experienceYears || "Not specified"}
- Experience Summary details: ${summary}

Target Job Description:
${truncatedJD}

STRICT Anti-Hallucination & Formatting Rules:
1. DO NOT invent or fake any company names, job titles, or dates. If the user did not provide a specific company name or date, use placeholders like [Company Name], [Job Title], and [MM/YYYY - MM/YYYY].
2. Focus ONLY on framing the user's actual experiences (from the User Profile) to highlight the traits requested in the JD.
3. Every single achievement under EXPERIENCE MUST start with the Markdown bullet character: "- ". Do not write paragraphs.
4. Keep the CV concise, high-impact, and directly mapped to the JD requirements.

Structure Instructions:
1. MUST start with a Header EXACTLY like this:
# ${fullName || "[Your Name]"}
${contactLine}
${linksLine}
2. Followed by:
## SUMMARY
## EXPERIENCE
## EDUCATION
- ${education} | ${school || "[University Name]"}, ${schoolCity || "[City]"} | Class of ${year}
## SKILLS

3. Generate a dynamically bulleted SKILLS list that matches user experience to the JD.
4. Return ONLY a JSON object: { "markdown": "CV_HERE" }
`;

        if (!process.env.GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY in backend environment");
            return res.status(500).json({ message: "API Key not configured", error: "Please add GEMINI_API_KEY to your .env file" });
        }

        const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const model = ai.models;

        try {
            const response = await model.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: prompt,
                config: {
                    maxOutputTokens: 1000
                }
            });

            console.log("Raw Gemini text:", response.text);

            let jsonResult;
            try {
                const cleanText = response.text.replace(/```json|```/g, "").trim();
                jsonResult = JSON.parse(cleanText);
            } catch (parseErr) {
                console.error("JSON Parse Error. Raw Text:", response.text);
                throw new Error("Invalid response format from AI.");
            }

            res.json(jsonResult);

        } catch (genErr) {
            console.error("Gemini Execution Error:", genErr);
            // Specifically detect 429 Too Many Requests
            if (genErr.message && genErr.message.includes("429")) {
                return res.status(429).json({ 
                    message: "Quota Full (429)", 
                    error: "Your Gemini API limit has been reached for now. Please wait or use our Smart Template fallback."
                });
            }
            throw genErr;
        }

    } catch (err) {
        console.error("AI Generation Critical Error:", err);
        res.status(500).json({ 
            message: "Failed to generate CV with AI.", 
            error: err.message 
        });
    }
});

// POST AI Suggest Experience
router.post('/suggest-experience', async (req, res) => {
    try {
        const { qualification, years, institute } = req.body;

        if (!qualification) {
            return res.status(400).json({ message: "Qualification is required for contextual suggestion." });
        }

        const prompt = `Write a professional 4-line experience summary for a person with ${years || "an unspecified amount of"} experience in "${qualification}"${institute ? ` with a background from ${institute}` : ""}.
        DO NOT invent company names, specific dates, or fake projects. Keep it generic, skills-focused, and highly professional. DO NOT wrap the output in markdown blockquotes or json, just return the plain string text.`;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "API Key not configured" });
        }

        const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                maxOutputTokens: 250 // small max since it's just a summary
            }
        });

        res.json({ suggestion: response.text.trim() });
    } catch (err) {
        console.error("AI Suggestion Error:", err);
        if (err.message && err.message.includes("429")) {
            return res.status(429).json({ message: "Quota Full (429)", error: "Gemini API limits reached." });
        }
        res.status(500).json({ message: "Failed to generate suggestion.", error: err.message });
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
