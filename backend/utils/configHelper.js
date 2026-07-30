import SystemConfig from '../models/SystemConfig.js';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';

const PLACEHOLDERS = [
    'your_jwt_secret_key',
    'your_google_gemini_api_key',
    're_your_resend_api_key',
    'your_email@gmail.com'
];

/**
 * Checks if a given value is missing, empty, or a default template placeholder.
 */
export const isPlaceholderOrEmpty = (val) => {
    if (!val || typeof val !== 'string') return true;
    const trimmed = val.trim();
    if (trimmed === '') return true;
    return PLACEHOLDERS.some(p => trimmed.toLowerCase() === p.toLowerCase());
};

/**
 * Fetches the system config from DB (creates default if none exists).
 * GOOGLE_CLIENT_ID is always read from process.env — never stored in DB.
 * No hardcoded fallback strings — values must come from .env or MongoDB only.
 */
export const getSystemConfig = async () => {
    try {
        let configDoc = await SystemConfig.findOne();
        if (!configDoc) {
            configDoc = await SystemConfig.create({
                JWT_SECRET:     process.env.JWT_SECRET     || '',
                GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
                GEMINI_MODEL:   process.env.GEMINI_MODEL   || DEFAULT_GEMINI_MODEL,
                RESEND_API_KEY: process.env.RESEND_API_KEY || '',
                EMAIL_FROM:     process.env.EMAIL_FROM     || '',
                isConfigured:   false
            });
        }

        // DB takes priority over process.env; no hardcoded fallback strings
        const jwtSecret     = !isPlaceholderOrEmpty(configDoc.JWT_SECRET)     ? configDoc.JWT_SECRET     : process.env.JWT_SECRET     || '';
        const geminiApiKey  = !isPlaceholderOrEmpty(configDoc.GEMINI_API_KEY)  ? configDoc.GEMINI_API_KEY  : process.env.GEMINI_API_KEY  || '';
        const geminiModel   = !isPlaceholderOrEmpty(configDoc.GEMINI_MODEL)    ? configDoc.GEMINI_MODEL    : process.env.GEMINI_MODEL    || DEFAULT_GEMINI_MODEL;
        const resendApiKey  = !isPlaceholderOrEmpty(configDoc.RESEND_API_KEY)  ? configDoc.RESEND_API_KEY  : process.env.RESEND_API_KEY  || '';
        const emailFrom     = !isPlaceholderOrEmpty(configDoc.EMAIL_FROM)      ? configDoc.EMAIL_FROM      : process.env.EMAIL_FROM      || '';

        return {
            configDoc,
            config: {
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',  // always from .env
                JWT_SECRET:       jwtSecret,
                GEMINI_API_KEY:   geminiApiKey,
                GEMINI_MODEL:     geminiModel,
                RESEND_API_KEY:   resendApiKey,
                EMAIL_FROM:       emailFrom,
                isConfigured:     configDoc.isConfigured,
                updatedBy:        configDoc.updatedBy || ''
            }
        };
    } catch (err) {
        console.error('Config Helper Error:', err);
        // Pure process.env fallback if DB is unavailable
        return {
            configDoc: null,
            config: {
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
                JWT_SECRET:       process.env.JWT_SECRET        || '',
                GEMINI_API_KEY:   process.env.GEMINI_API_KEY    || '',
                GEMINI_MODEL:     process.env.GEMINI_MODEL      || DEFAULT_GEMINI_MODEL,
                RESEND_API_KEY:   process.env.RESEND_API_KEY    || '',
                EMAIL_FROM:       process.env.EMAIL_FROM        || '',
                isConfigured:     false,
                updatedBy:        ''
            }
        };
    }
};
