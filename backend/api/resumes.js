import express from 'express';
import multer from 'multer';
import Resume from '../models/Resume.js';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { getEffectiveConfig, DEFAULT_GEMINI_MODEL } from '../utils/configHelper.js';
import { extractContentFromFile, getFileExtension, importCvFromContent } from '../utils/cvImport.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const UPDATABLE_FIELDS = ['title', 'desc', 'script', 'date', 'parentId', 'cvFormat'];

const ownerFilter = (req) => ({ userId: { $in: req.ownerIds } });

const getAiConfig = async (req) => {
    const { config } = await getEffectiveConfig(req.userId);
    return config;
};

const hasOperatorKeys = (obj) => Object.keys(obj || {}).some((key) => key.startsWith('$'));

const pickUpdatableFields = (body) => {
    const updates = {};
    for (const field of UPDATABLE_FIELDS) {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    }
    return updates;
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (getFileExtension(file.originalname)) {
            cb(null, true);
            return;
        }
        cb(new Error('Unsupported file type. Please upload a PDF, DOC, or DOCX file.'));
    },
});

/**
 * Truncates long Job Descriptions to stay within Gemini token limits.
 * Focuses on extracting the most relevant sections if keywords like 'Requirements' are found.
 */
const truncateJD = (jd) => {
    if (!jd) return "";
    if (jd.length <= 2500) return jd;

    const keywords = ["Requirements", "Responsibilities", "Qualification", "What we look for", "Required Skills", "Qualifications"];
    let bestStart = -1;

    for (const kw of keywords) {
        const found = jd.toLowerCase().indexOf(kw.toLowerCase());
        if (found !== -1 && (bestStart === -1 || found < bestStart)) {
            bestStart = found;
        }
    }

    if (bestStart !== -1) {
        const start = Math.max(0, bestStart - 200);
        return jd.substring(start, start + 3000) + "... (truncated for brevity)";
    }

    return jd.substring(0, 3000) + "... (truncated for brevity)";
};

router.use(requireAuth);

// GET All (Filtered by authenticated user)
router.get('/', async (req, res) => {
    try {
        const resumes = await Resume.find(ownerFilter(req)).sort({ createdAt: -1 });
        res.json(resumes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch resumes.' });
    }
});

// POST AI Score
router.post('/score', aiRateLimiter, async (req, res) => {
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

        const config = await getAiConfig(req);
        if (!config.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key not configured in system settings." });
        }

        const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
        const model = config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

        const response = await ai.models.generateContent({
            model,
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

// POST AI Analyse CV against Job Description
router.post('/analyse', aiRateLimiter, async (req, res) => {
    try {
        const { markdown, jobDescription } = req.body;
        if (!markdown || markdown.trim() === '') {
            return res.status(400).json({ message: 'CV content required for analysis' });
        }
        if (!jobDescription || jobDescription.trim() === '') {
            return res.status(400).json({ message: 'Job description is required' });
        }

        const truncatedJD = truncateJD(jobDescription);

        const prompt = `Act as an expert CV coach and ATS specialist. Compare the candidate's CV against the Target Job Description and suggest concrete improvements section by section.

Return ONLY valid JSON in this exact format:
{
  "matchScore": 72,
  "summary": "One sentence overall fit assessment against the job.",
  "sections": [
    {
      "id": "experience",
      "title": "Experience",
      "improvements": [
        "Specific improvement tied to the JD",
        "Another actionable improvement"
      ],
      "existingBullets": [
        "Strong bullet from the CV to keep (verbatim or lightly edited)"
      ],
      "newBullets": [
        "Entirely new bullet addressing a JD gap — use placeholders like [Metric] if facts are unknown"
      ],
      "suggestedBullets": [
        {
          "original": "Weak or generic bullet currently in the CV",
          "suggested": "Rewritten version tailored to the JD with stronger impact"
        }
      ],
      "deletedBullets": [
        "Bullet from the CV that should be removed for this job"
      ],
      "suggestedContent": "Full rewritten section body in markdown (bullets allowed). Do NOT include the ## heading line."
    }
  ]
}

Rules:
- Include only sections that exist in the CV OR that are clearly important for this job (summary, experience, projects, education, skills, languages, certifications).
- Use id values: summary, experience, projects, education, skills, languages, certifications (lowercase).
- improvements: 2-4 specific, non-generic bullets per section referencing JD keywords/requirements.
- existingBullets: bullets from the CV that already align well with the JD — keep wording close to the original.
- newBullets: bullets NOT currently in the CV that would strengthen JD alignment — do NOT invent employers, dates, or degrees; use truthful facts or clear placeholders.
- suggestedBullets: pairs where an existing CV bullet should be rewritten; "original" must reflect actual CV content.
- deletedBullets: bullets currently in the CV that should be removed for this job (not kept, not rewritten).
- For paragraph sections (e.g. summary), use existingBullets for the current paragraph text and put the rewritten paragraph in suggestedBullets[0].suggested (with original in suggestedBullets[0].original); newBullets may be empty.
- For bulleted sections, each bullet in suggestedContent must appear in existingBullets, newBullets, or suggestedBullets.suggested — no duplicates.
- suggestedContent: complete replacement text for that section only, merging kept + rewritten + new bullets in logical order — tailored to the job, preserving truthful facts.
- matchScore: 0-100 indicating alignment with the job description.
- Prioritize sections with the weakest JD alignment.

Target Job Description:
${truncatedJD}

CV Content (markdown):
${markdown}
`;

        const config = await getAiConfig(req);
        if (!config.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'Gemini API Key not configured in system settings.' });
        }

        const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
        const model = config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                maxOutputTokens: 4096,
            },
        });

        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanText);

        if (!Array.isArray(result.sections)) {
            throw new Error('Invalid analysis response format');
        }

        res.json(result);
    } catch (err) {
        console.error('Analyse Error:', err);
        if (err.message?.includes('429')) {
            return res.status(429).json({ message: 'Gemini API quota reached. Please try again shortly.' });
        }
        res.status(500).json({ message: 'Failed to analyse CV. Please try again.' });
    }
});

// POST AI Generation
router.post('/generate', aiRateLimiter, async (req, res) => {
    try {
        const { education, year, school, schoolCity, summary, jd, fullName, email, phone, city, linkedin, github, experienceYears } = req.body;

        if (!education || !jd || !fullName || !email || !phone || !city || !school || !schoolCity || !year || !summary) {
            return res.status(400).json({ message: "All required fields must be provided: name, contact info, education, job description, and experience summary" });
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

        const config = await getAiConfig(req);
        if (!config.GEMINI_API_KEY) {
            return res.status(500).json({ message: "API Key not configured", error: "Please configure GEMINI_API_KEY in System Settings" });
        }

        const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
        const geminiModel = config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

        try {
            const response = await ai.models.generateContent({
                model: geminiModel,
                contents: prompt,
                config: {
                    maxOutputTokens: 1000
                }
            });

            let jsonResult;
            try {
                const cleanText = response.text.replace(/```json|```/g, "").trim();
                jsonResult = JSON.parse(cleanText);
            } catch {
                throw new Error("Invalid response format from AI.");
            }

            res.json(jsonResult);

        } catch (genErr) {
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
        res.status(500).json({ message: "Failed to generate CV with AI." });
    }
});

// POST AI Suggest Experience
router.post('/suggest-experience', aiRateLimiter, async (req, res) => {
    try {
        const { qualification, years, institute, jd } = req.body;

        if (!qualification) {
            return res.status(400).json({ message: "Qualification is required for contextual suggestion." });
        }

        const prompt = `Write a professional 4-line experience summary for a person with ${years || "an unspecified amount of"} experience in "${qualification}"${institute ? ` with a background from ${institute}` : ""}.
        ${jd ? `The summary MUST be highly tailored to match the following Target Job Description to ensure ATS optimization:
        ---
        ${jd}
        ---` : ""}
        DO NOT invent company names, specific dates, or fake projects. Focus on highlighting skills and achievements that align with the job requirements. Keep it professional. DO NOT wrap the output in markdown blockquotes or json, just return the plain string text.`;

        const config = await getAiConfig(req);
        if (!config.GEMINI_API_KEY) {
            return res.status(500).json({ message: "API Key not configured" });
        }

        const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
        const geminiModel = config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
        const response = await ai.models.generateContent({
            model: geminiModel,
            contents: prompt,
            config: {
                maxOutputTokens: 250
            }
        });

        res.json({ suggestion: response.text.trim() });
    } catch (err) {
        console.error("AI Suggestion Error:", err);
        if (err.message && err.message.includes("429")) {
            return res.status(429).json({ message: "Quota Full (429)", error: "Gemini API limits reached." });
        }
        res.status(500).json({ message: "Failed to generate suggestion." });
    }
});

// POST Import CV from PDF/Word
router.post('/import', aiRateLimiter, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'File is too large. Maximum size is 10 MB.'
                : err.message;
            return res.status(400).json({ message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please select a PDF, DOC, or DOCX file.' });
        }

        const content = await extractContentFromFile(req.file.buffer, req.file.originalname);
        const result = await importCvFromContent(content, req.file.originalname, req.userId);

        res.json(result);
    } catch (err) {
        console.error('CV Import Error:', err);
        if (err.message?.includes('Unsupported file type')) {
            return res.status(400).json({ message: err.message });
        }
        if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota')) {
            return res.status(429).json({ message: err.message || 'Gemini API quota reached. Please try again shortly.' });
        }
        if (err.message?.includes('Gemini API key')) {
            return res.status(503).json({ message: err.message });
        }
        res.status(500).json({
            message: err.message || 'Failed to import CV. Please try another file.',
        });
    }
});

// POST Create
router.post('/', async (req, res) => {
    if (hasOperatorKeys(req.body)) {
        return res.status(400).json({ message: 'Invalid request body.' });
    }

    const { id, title, desc, script, date, parentId, cvFormat } = req.body;
    const resumeId = id || new mongoose.Types.ObjectId().toString();

    const newResume = new Resume({
        id: resumeId,
        title,
        desc,
        script,
        date,
        parentId,
        cvFormat,
        userId: req.userId,
    });

    try {
        const savedResume = await newResume.save();
        res.status(201).json(savedResume);
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// GET One
router.get('/:id', async (req, res) => {
    try {
        const resume = await Resume.findOne({ id: req.params.id, ...ownerFilter(req) });
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        res.json(resume);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch resume.' });
    }
});

// PUT Update
router.put('/:id', async (req, res) => {
    try {
        if (hasOperatorKeys(req.body)) {
            return res.status(400).json({ message: 'Invalid request body.' });
        }

        const updates = pickUpdatableFields(req.body);
        const updatedResume = await Resume.findOneAndUpdate(
            { id: req.params.id, ...ownerFilter(req) },
            updates,
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
        const result = await Resume.findOneAndDelete({ id: req.params.id, ...ownerFilter(req) });
        if (!result) return res.status(404).json({ message: 'Resume not found or unauthorized' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete resume.' });
    }
});

export default router;
