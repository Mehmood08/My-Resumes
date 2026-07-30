import SystemConfig from '../models/SystemConfig.js';

const PLACEHOLDERS = [
    'your_jwt_secret_key',
    'your_google_gemini_api_key',
    'your_email@gmail.com',
    'your_app_specific_password'
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
 * Fetches the system config document from DB (creates default if none exists).
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
                EMAIL_HOST:     process.env.EMAIL_HOST     || '',
                EMAIL_PORT:     Number(process.env.EMAIL_PORT) || 465,
                EMAIL_USER:     process.env.EMAIL_USER     || '',
                EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
                EMAIL_FROM:     process.env.EMAIL_FROM     || '',
                isConfigured:   false
            });
        }

        // DB takes priority over process.env; no hardcoded fallback strings
        const jwtSecret     = !isPlaceholderOrEmpty(configDoc.JWT_SECRET)     ? configDoc.JWT_SECRET     : process.env.JWT_SECRET     || '';
        const geminiApiKey  = !isPlaceholderOrEmpty(configDoc.GEMINI_API_KEY)  ? configDoc.GEMINI_API_KEY  : process.env.GEMINI_API_KEY  || '';
        const emailHost     = !isPlaceholderOrEmpty(configDoc.EMAIL_HOST)      ? configDoc.EMAIL_HOST      : process.env.EMAIL_HOST      || '';
        const emailPort     = configDoc.EMAIL_PORT || Number(process.env.EMAIL_PORT) || 465;
        const emailUser     = !isPlaceholderOrEmpty(configDoc.EMAIL_USER)      ? configDoc.EMAIL_USER      : process.env.EMAIL_USER      || '';
        const emailPassword = !isPlaceholderOrEmpty(configDoc.EMAIL_PASSWORD)  ? configDoc.EMAIL_PASSWORD  : process.env.EMAIL_PASSWORD  || '';
        const emailFrom     = !isPlaceholderOrEmpty(configDoc.EMAIL_FROM)      ? configDoc.EMAIL_FROM      : process.env.EMAIL_FROM      || '';

        return {
            configDoc,
            config: {
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',  // always from .env
                JWT_SECRET:       jwtSecret,
                GEMINI_API_KEY:   geminiApiKey,
                EMAIL_HOST:       emailHost,
                EMAIL_PORT:       emailPort,
                EMAIL_USER:       emailUser,
                EMAIL_PASSWORD:   emailPassword,
                EMAIL_FROM:       emailFrom,
                isConfigured:     configDoc.isConfigured,
                updatedBy:        configDoc.updatedBy || ''
            }
        };
    } catch (err) {
        console.error('Config Helper Error:', err);
        // Pure process.env fallback if DB is unavailable — still no hardcoding
        return {
            configDoc: null,
            config: {
                GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
                JWT_SECRET:       process.env.JWT_SECRET       || '',
                GEMINI_API_KEY:   process.env.GEMINI_API_KEY   || '',
                EMAIL_HOST:       process.env.EMAIL_HOST       || '',
                EMAIL_PORT:       Number(process.env.EMAIL_PORT) || 465,
                EMAIL_USER:       process.env.EMAIL_USER       || '',
                EMAIL_PASSWORD:   process.env.EMAIL_PASSWORD   || '',
                EMAIL_FROM:       process.env.EMAIL_FROM       || '',
                isConfigured:     false,
                updatedBy:        ''
            }
        };
    }
};
