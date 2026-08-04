import express from 'express';
import jwt from 'jsonwebtoken';
import SystemConfig from '../models/SystemConfig.js';
import UserConfig from '../models/UserConfig.js';
import {
    getSystemConfig,
    getEffectiveConfig,
    isPlaceholderOrEmpty,
    DEFAULT_GEMINI_MODEL,
    MASKED_SENTINEL,
    MASKABLE_CONFIG_FIELDS,
    SENSITIVE_CONFIG_FIELDS,
    maskConfigForClient,
} from '../utils/configHelper.js';

const router = express.Router();

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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

router.get('/status', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || ''
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

router.get('/', requireAuth, async (req, res) => {
    try {
        const { config, isUserConfig } = await getEffectiveConfig(req.userId);
        const { GOOGLE_CLIENT_ID, ...editableConfig } = config;

        if (isUserConfig) {
            return res.json(maskConfigForClient(editableConfig, config.maskedFields || []));
        }

        // Mask the system config so sensitive keys are never exposed to ordinary users
        const maskedSystemConfig = maskConfigForClient(editableConfig, SENSITIVE_CONFIG_FIELDS);
        res.json(maskedSystemConfig);
    } catch (err) {
        console.error('GET /api/config Error:', err);
        res.status(500).json({ message: 'Failed to fetch system config', error: err.message });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const userConfigDoc = await UserConfig.findOne({ userId: String(req.userId) });

        if (userConfigDoc) {
            const updates = req.body;
            for (const key of MASKABLE_CONFIG_FIELDS) {
                if (updates[key] === undefined || updates[key] === MASKED_SENTINEL) continue;
                if (typeof updates[key] === 'string' && updates[key].trim() !== '') {
                    userConfigDoc[key] = updates[key].trim();
                    userConfigDoc.maskedFields = (userConfigDoc.maskedFields || []).filter(f => f !== key);
                }
            }
            if (updates.GEMINI_MODEL !== undefined) {
                userConfigDoc.GEMINI_MODEL = (updates.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
            }
            if (!isPlaceholderOrEmpty(userConfigDoc.GEMINI_API_KEY)) {
                userConfigDoc.isConfigured = true;
            }
            await userConfigDoc.save();

            const { config } = await getEffectiveConfig(req.userId);
            const { GOOGLE_CLIENT_ID, ...editableConfig } = config;
            return res.json({
                message: 'Settings updated successfully!',
                config: maskConfigForClient(editableConfig, config.maskedFields || []),
            });
        }

        const { JWT_SECRET, GEMINI_API_KEY, GEMINI_MODEL, RESEND_API_KEY, EMAIL_FROM } = req.body;

        if (isPlaceholderOrEmpty(GEMINI_API_KEY)) {
            return res.status(400).json({ message: 'Gemini API Key is required to enable AI features.' });
        }

        let configDoc = await SystemConfig.findOne();
        if (!configDoc) configDoc = new SystemConfig();

        if (JWT_SECRET     !== undefined && JWT_SECRET !== MASKED_SENTINEL) configDoc.JWT_SECRET     = JWT_SECRET.trim();
        if (GEMINI_API_KEY !== undefined && GEMINI_API_KEY !== MASKED_SENTINEL) configDoc.GEMINI_API_KEY = GEMINI_API_KEY.trim();
        if (GEMINI_MODEL   !== undefined) configDoc.GEMINI_MODEL   = (GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
        if (RESEND_API_KEY !== undefined && RESEND_API_KEY !== MASKED_SENTINEL) configDoc.RESEND_API_KEY = RESEND_API_KEY.trim();
        if (EMAIL_FROM     !== undefined && EMAIL_FROM !== MASKED_SENTINEL) configDoc.EMAIL_FROM     = EMAIL_FROM.trim();

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
