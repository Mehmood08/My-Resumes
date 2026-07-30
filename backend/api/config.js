import express from 'express';
import jwt from 'jsonwebtoken';
import SystemConfig from '../models/SystemConfig.js';
import { getSystemConfig, isPlaceholderOrEmpty, DEFAULT_GEMINI_MODEL } from '../utils/configHelper.js';

const router = express.Router();

/**
 * Middleware: Verifies the JWT token and attaches userId to the request.
 * Uses getSystemConfig() so the secret matches exactly what was used to sign the token.
 */
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ message: 'Authentication required to access system settings.' });
    }
    try {
        const { config } = await getSystemConfig();
        const secret = config.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured. Please set it in your backend .env file.' });
        }
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
};

// ─── GET /api/config/status ───────────────────────────────────────────────────
// Public: used by frontend on boot to get Google Client ID from env (no DB needed)
router.get('/status', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    });
});

// ─── GET /api/config/models ──────────────────────────────────────────────────
// Protected: Lists Gemini models available for the configured (or provided) API key.
router.get('/models', requireAuth, async (req, res) => {
    try {
        const { config } = await getSystemConfig();
        const apiKey = (req.query.apiKey || config.GEMINI_API_KEY || '').trim();

        if (isPlaceholderOrEmpty(apiKey)) {
            return res.status(400).json({ message: 'Gemini API Key is required to list available models.' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini models list error:', response.status, errBody);
            return res.status(response.status).json({
                message: 'Failed to fetch models from Google. Check your API key.',
                error: errBody
            });
        }

        const data = await response.json();
        const models = (data.models || [])
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({
                id: m.name.replace(/^models\//, ''),
                displayName: m.displayName || m.name.replace(/^models\//, ''),
                description: m.description || ''
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        res.json({ models, selectedModel: config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL });
    } catch (err) {
        console.error('GET /api/config/models Error:', err);
        res.status(500).json({ message: 'Failed to fetch Gemini models', error: err.message });
    }
});

// ─── GET /api/config ─────────────────────────────────────────────────────────
// Protected: Returns current settings for the logged-in user to view/edit.
router.get('/', requireAuth, async (req, res) => {
    try {
        const { config } = await getSystemConfig();
        const { GOOGLE_CLIENT_ID, ...editableConfig } = config;
        res.json(editableConfig);
    } catch (err) {
        console.error('GET /api/config Error:', err);
        res.status(500).json({ message: 'Failed to fetch system config', error: err.message });
    }
});

// ─── POST /api/config ────────────────────────────────────────────────────────
// Protected: Save / update system settings.
router.post('/', requireAuth, async (req, res) => {
    try {
        const { JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, RESEND_API_KEY, EMAIL_FROM } = req.body;

        if (isPlaceholderOrEmpty(GEMINI_API_KEY)) {
            return res.status(400).json({ message: 'Gemini API Key is required to enable AI features.' });
        }

        let configDoc = await SystemConfig.findOne();
        if (!configDoc) configDoc = new SystemConfig();

        if (JWT_SECRET     !== undefined) configDoc.JWT_SECRET     = JWT_SECRET.trim();
        if (GEMINI_API_KEY !== undefined) configDoc.GEMINI_API_KEY = GEMINI_API_KEY.trim();
        if (GEMINI_MODEL   !== undefined) configDoc.GEMINI_MODEL   = (GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
        if (RESEND_API_KEY !== undefined) configDoc.RESEND_API_KEY = RESEND_API_KEY.trim();
        if (EMAIL_FROM     !== undefined) configDoc.EMAIL_FROM     = EMAIL_FROM.trim();

        configDoc.isConfigured = true;
        configDoc.updatedBy    = req.userId;

        await configDoc.save();
        console.log(`✅ System config saved by user: ${req.userId}`);

        res.json({
            message: 'System settings updated successfully!',
            config: {
                JWT_SECRET:     configDoc.JWT_SECRET,
                GEMINI_API_KEY: configDoc.GEMINI_API_KEY,
                GEMINI_MODEL:   configDoc.GEMINI_MODEL,
                RESEND_API_KEY: configDoc.RESEND_API_KEY,
                EMAIL_FROM:     configDoc.EMAIL_FROM,
                isConfigured:   true,
                updatedBy:      configDoc.updatedBy
            }
        });

    } catch (err) {
        console.error('POST /api/config Error:', err);
        res.status(500).json({ message: 'Failed to save system settings', error: err.message });
    }
});

export default router;
