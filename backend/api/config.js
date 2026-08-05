import express from 'express';
import UserConfig from '../models/UserConfig.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
    getEffectiveConfig,
    isPlaceholderOrEmpty,
    DEFAULT_GEMINI_MODEL,
    MASKED_SENTINEL,
    MASKABLE_CONFIG_FIELDS,
    maskConfigForClient,
} from '../utils/configHelper.js';
import { verifyGeminiApiKey, verifyResendApiKey } from '../utils/inviteCredentials.js';
import { withDevDetails } from '../utils/errorResponse.js';

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    });
});

router.post('/models', requireAuth, async (req, res) => {
    try {
        const { config } = await getEffectiveConfig(req.userId);
        const apiKey = (req.body?.apiKey || config.GEMINI_API_KEY || '').trim();

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
        console.error('POST /api/config/models Error:', err);
        res.status(500).json(withDevDetails({ message: 'Failed to fetch Gemini models' }, err));
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
        let userConfigDoc = await UserConfig.findOne({ userId: String(req.userId) });

        if (!userConfigDoc) {
            userConfigDoc = new UserConfig({
                userId: String(req.userId),
            });
        }

        const updates = req.body;
        const providedGeminiKey = updates.GEMINI_API_KEY !== undefined
            && updates.GEMINI_API_KEY !== MASKED_SENTINEL
            && !isPlaceholderOrEmpty(updates.GEMINI_API_KEY);
        const providedResendKey = updates.RESEND_API_KEY !== undefined
            && updates.RESEND_API_KEY !== MASKED_SENTINEL
            && !isPlaceholderOrEmpty(updates.RESEND_API_KEY);

        if (providedGeminiKey) {
            const geminiError = await verifyGeminiApiKey(updates.GEMINI_API_KEY.trim());
            if (geminiError) {
                return res.status(400).json({
                    message: 'Gemini API key is invalid or expired. Please check the key and try again.',
                });
            }
        }

        if (providedResendKey) {
            const resendError = await verifyResendApiKey(updates.RESEND_API_KEY.trim());
            if (resendError) {
                return res.status(400).json({
                    message: 'Resend API key is invalid or expired. Please check the key and try again.',
                });
            }
        }

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
