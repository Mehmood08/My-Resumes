import { createRequire } from 'module';
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';
import { GoogleGenAI } from '@google/genai';
import { getSystemConfig, DEFAULT_GEMINI_MODEL } from './configHelper.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const STANDARD_SECTIONS = [
    'SUMMARY',
    'EXPERIENCE',
    'PROJECTS',
    'EDUCATION',
    'SKILLS',
    'LANGUAGES',
    'CERTIFICATIONS',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export function getFileExtension(filename = '') {
    const lower = filename.toLowerCase();
    const match = ALLOWED_EXTENSIONS.find((ext) => lower.endsWith(ext));
    return match || '';
}

/** Extract plain text and optional markup (HTML for DOCX) from uploaded file. */
export async function extractContentFromFile(buffer, filename) {
    const ext = getFileExtension(filename);
    if (!ext) {
        throw new Error('Unsupported file type. Please upload a PDF, DOC, or DOCX file.');
    }

    if (ext === '.pdf') {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        const plainText = (result.text || '').trim();
        return { plainText, markup: null, format: 'pdf' };
    }

    if (ext === '.docx') {
        const [textResult, htmlResult] = await Promise.all([
            mammoth.extractRawText({ buffer }),
            mammoth.convertToHtml({ buffer }),
        ]);
        return {
            plainText: (textResult.value || '').trim(),
            markup: (htmlResult.value || '').trim(),
            format: 'docx',
        };
    }

    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    const plainText = (doc.getBody() || '').trim();
    return { plainText, markup: null, format: 'doc' };
}

/** @deprecated Use extractContentFromFile */
export async function extractTextFromFile(buffer, filename) {
    const { plainText } = await extractContentFromFile(buffer, filename);
    return plainText;
}

function extractTitleFromMarkdown(markdown) {
    const headingMatch = markdown.match(/^#\s+(.+)$/m);
    if (!headingMatch) return null;
    const namePart = headingMatch[1].split('|')[0].trim();
    return namePart ? `${namePart} CV` : null;
}

function buildGeminiPrompt({ plainText, markup, format, filename }) {
    const markupBlock = markup
        ? `\nStructured markup extracted from the ${format.toUpperCase()} file (use headings, lists, and emphasis to infer sections):\n${markup.substring(0, 14000)}\n`
        : '';

    return `You are a CV import assistant. Map the extracted resume content below into our standard Markdown CV format.

TARGET SECTIONS (use these exact ## titles; omit sections with no source content):
${STANDARD_SECTIONS.map((s) => `- ${s}`).join('\n')}

SECTION MAPPING RULES:
- SUMMARY: professional summary, profile, objective, about me
- EXPERIENCE: work history, employment, internships (use ### Job Title | Company and bullet achievements)
- PROJECTS: personal or professional projects
- EDUCATION: degrees, schools, certifications of study
- SKILLS: technical and soft skills
- LANGUAGES: spoken languages and proficiency
- CERTIFICATIONS: licenses, certificates, awards

HEADER FORMAT (required):
# FirstName LastName | Profession
City, Province, Zip | email | phone
Optional line 3: LinkedIn URL | GitHub URL (only if present in source)

STRICT RULES:
1. DO NOT invent or hallucinate any information — only use content from the source.
2. Preserve dates, company names, job titles, and achievements exactly as written.
3. Use markdown bullets (- ) under EXPERIENCE, PROJECTS, EDUCATION, SKILLS, etc.
4. Map ambiguous content to the closest matching standard section.
5. Return ONLY valid JSON: { "markdown": "FULL_CV_MARKDOWN", "title": "FirstName LastName CV" }

Source file: ${filename}
${markupBlock}
Plain text extraction:
${plainText.substring(0, 12000)}`;
}

async function mapWithGemini(content, filename) {
    const { config } = await getSystemConfig();
    if (!config.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Please add it in System Settings to import CVs.');
    }

    const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    const model = config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const prompt = buildGeminiPrompt({ ...content, filename });

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
        },
    });

    const cleanText = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    if (!parsed.markdown?.trim()) {
        throw new Error('Gemini returned an empty CV mapping.');
    }

    return {
        markdown: parsed.markdown.trim(),
        title: parsed.title || extractTitleFromMarkdown(parsed.markdown) || 'Imported CV',
        mappedBy: 'gemini',
    };
}

export async function importCvFromContent(content, filename = '') {
    const { plainText } = content;
    if (!plainText?.trim()) {
        throw new Error('Could not extract any text from the uploaded file.');
    }

    try {
        return await mapWithGemini(content, filename);
    } catch (err) {
        if (err.message?.includes('429') || err.message?.includes('Quota')) {
            const quotaErr = new Error('Gemini API quota reached. Please wait a moment and try again.');
            quotaErr.status = 429;
            throw quotaErr;
        }
        throw err;
    }
}

/** @deprecated Use importCvFromContent */
export async function importCvFromText(rawText, filename = '') {
    return importCvFromContent({ plainText: rawText, markup: null, format: 'text' }, filename);
}
