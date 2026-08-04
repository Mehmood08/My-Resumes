import express from 'express';
import jwt from 'jsonwebtoken';
import UserConfig from '../models/UserConfig.js';
import {
    getEffectiveConfig,
    getEnvDefaults,
    getJwtSecret,
    isPlaceholderOrEmpty,
    DEFAULT_GEMINI_MODEL,
    MASKED_SENTINEL,
    MASKABLE_CONFIG_FIELDS,
    maskConfigForClient,
} from '../utils/configHelper.js';

const router = express.Router();

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required to access settings.' });
    }

    const secret = getJwtSecret();
    if (!secret) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured. Please set it in your backend .env file.' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
};

router.get('/status', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    });
});

router.get('/models', requireAuth, async (req, res) => {
    try {
        const { config } = await getEffectiveConfig(req.userId);
        const apiKey = (req.query.apiKey || config.GEMINI_API_KEY || '').trim();

        if (isPlaceholderOrEmpty(apiKey) || apiKey === MASKED_SENTINEL) {
            return res.status(400).json({ message: 'Gemini API Key is required to list available models.' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini models list error:', response.status, errBody);
            return res.status(response.status).json({
                message: 'Failed to fetch models from Google. Check your API key.',
                error: errBody,
            });
        }

        const data = await response.json();
        const models = (data.models || [])
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => ({
                id: m.name.replace(/^models\//, ''),
                displayName: m.displayName || m.name.replace(/^models\//, ''),
                description: m.description || '',
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        res.json({ models, selectedModel: config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL });
    } catch (err) {
        console.error('GET /api/config/models Error:', err);
        res.status(500).json({ message: 'Failed to fetch Gemini models', error: err.message });
    }
});

router.get('/', requireAuth, async (req, res) => {
    try {
        const { config } = await getEffectiveConfig(req.userId);
        res.json(maskConfigForClient(config));
    } catch (err) {
        console.error('GET /api/config Error:', err);
        res.status(500).json({ message: 'Failed to fetch settings', error: err.message });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const envDefaults = getEnvDefaults();
        let userConfigDoc = await UserConfig.findOne({ userId: String(req.userId) });

        if (!userConfigDoc) {
            userConfigDoc = new UserConfig({
                userId: String(req.userId),
                GEMINI_API_KEY: envDefaults.GEMINI_API_KEY,
                GEMINI_MODEL: envDefaults.GEMINI_MODEL,
                RESEND_API_KEY: envDefaults.RESEND_API_KEY,
                EMAIL_FROM: envDefaults.EMAIL_FROM,
                maskedFields: MASKABLE_CONFIG_FIELDS.filter(
                    (field) => !isPlaceholderOrEmpty(envDefaults[field])
                ),
            });
        }

        const updates = req.body;
        const providedResendKey = updates.RESEND_API_KEY !== undefined
            && updates.RESEND_API_KEY !== MASKED_SENTINEL
            && !isPlaceholderOrEmpty(updates.RESEND_API_KEY);

        if (providedResendKey) {
            const providedFromEmail = updates.EMAIL_FROM !== undefined
                && updates.EMAIL_FROM !== MASKED_SENTINEL
                && !isPlaceholderOrEmpty(updates.EMAIL_FROM);

            if (!providedFromEmail) {
                return res.status(400).json({
                    message: 'From Email Address is required when providing your own Resend API key.',
                });
            }
        }

        for (const key of MASKABLE_CONFIG_FIELDS) {
            if (updates[key] === undefined || updates[key] === MASKED_SENTINEL) continue;
            if (typeof updates[key] === 'string' && updates[key].trim() !== '') {
                userConfigDoc[key] = updates[key].trim();
                userConfigDoc.maskedFields = (userConfigDoc.maskedFields || []).filter(f => f !== key);
            }
        }

        if (updates.GEMINI_MODEL !== undefined && updates.GEMINI_MODEL !== MASKED_SENTINEL) {
            userConfigDoc.GEMINI_MODEL = (updates.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
        }

        await userConfigDoc.save();

        const { config } = await getEffectiveConfig(req.userId);
        res.json({
            message: 'Settings updated successfully!',
            config: maskConfigForClient(config),
        });
    } catch (err) {
        console.error('POST /api/config Error:', err);
        res.status(500).json({ message: 'Failed to save settings', error: err.message });
    }
});

export default router;
