import UserConfig from '../models/UserConfig.js';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';
export const MASKED_SENTINEL = '__MASKED__';
export const SENSITIVE_CONFIG_FIELDS = ['GEMINI_API_KEY', 'RESEND_API_KEY'];
export const MASKABLE_CONFIG_FIELDS = [...SENSITIVE_CONFIG_FIELDS, 'EMAIL_FROM'];
export const CLIENT_EDITABLE_FIELDS = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'RESEND_API_KEY', 'EMAIL_FROM'];

const PLACEHOLDERS = [
    'your_jwt_secret_key',
    'your_google_gemini_api_key',
    're_your_resend_api_key',
    'your_email@gmail.com',
];

export const getJwtSecret = () => process.env.JWT_SECRET || '';

export const assertJwtSecretConfigured = () => {
    const secret = getJwtSecret();
    if (!secret || secret.length < 32) {
        console.error('FATAL: JWT_SECRET must be set in .env and be at least 32 characters.');
        process.exit(1);
    }
};

export const getEnvDefaults = () => ({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',
});

/**
 * Checks if a given value is missing, empty, or a default template placeholder.
 */
export const isPlaceholderOrEmpty = (val) => {
    if (!val || typeof val !== 'string') return true;
    const trimmed = val.trim();
    if (trimmed === '') return true;
    return PLACEHOLDERS.some(p => trimmed.toLowerCase() === p.toLowerCase());
};

const pickValue = (stored, fallback) => (
    !isPlaceholderOrEmpty(stored) ? stored.trim() : fallback
);

const buildEffectiveValues = (source, envDefaults) => ({
    GEMINI_API_KEY: pickValue(source?.GEMINI_API_KEY, envDefaults.GEMINI_API_KEY),
    GEMINI_MODEL: pickValue(source?.GEMINI_MODEL, envDefaults.GEMINI_MODEL),
    RESEND_API_KEY: pickValue(source?.RESEND_API_KEY, envDefaults.RESEND_API_KEY),
    EMAIL_FROM: pickValue(source?.EMAIL_FROM, envDefaults.EMAIL_FROM),
});

export const getInheritedMaskedFields = (values) => (
    MASKABLE_CONFIG_FIELDS.filter((field) => !isPlaceholderOrEmpty(values[field]))
);

export const maskConfigForClient = (config) => {
    const clientConfig = {
        GEMINI_MODEL: config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
        isConfigured: Boolean(config.isConfigured),
        hasUserConfig: Boolean(config.hasUserConfig),
        copiedFromUserId: config.copiedFromUserId || '',
    };

    const maskedFields = [];
    for (const field of MASKABLE_CONFIG_FIELDS) {
        if (!isPlaceholderOrEmpty(config[field])) {
            clientConfig[field] = MASKED_SENTINEL;
            maskedFields.push(field);
        } else {
            clientConfig[field] = '';
        }
    }

    clientConfig.maskedFields = maskedFields;
    return clientConfig;
};

/**
 * Returns merged config for a user: UserConfig overrides env defaults.
 */
export const getEffectiveConfig = async (userId = null) => {
    const envDefaults = getEnvDefaults();

    try {
        if (userId) {
            const userConfigDoc = await UserConfig.findOne({ userId: String(userId) });
            if (userConfigDoc) {
                const values = buildEffectiveValues(userConfigDoc, envDefaults);
                return {
                    configDoc: userConfigDoc,
                    isUserConfig: true,
                    config: {
                        ...values,
                        hasUserConfig: true,
                        copiedFromUserId: userConfigDoc.copiedFromUserId || '',
                        isConfigured: true,
                    },
                };
            }
        }

        const values = buildEffectiveValues(null, envDefaults);
        return {
            configDoc: null,
            isUserConfig: false,
            config: {
                ...values,
                hasUserConfig: false,
                copiedFromUserId: '',
                isConfigured: !isPlaceholderOrEmpty(values.GEMINI_API_KEY),
            },
        };
    } catch (err) {
        console.error('getEffectiveConfig Error:', err);
        const values = buildEffectiveValues(null, envDefaults);
        return {
            configDoc: null,
            isUserConfig: false,
            config: {
                ...values,
                hasUserConfig: false,
                copiedFromUserId: '',
                isConfigured: false,
            },
        };
    }
};

/**
 * Backwards-compatible helper used by auth and legacy callers.
 * JWT, Google Client ID, and DB URL always come from env.
 */
export const getSystemConfig = async () => {
    const envDefaults = getEnvDefaults();
    return {
        configDoc: null,
        config: {
            GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
            JWT_SECRET: getJwtSecret(),
            ...envDefaults,
            isConfigured: !isPlaceholderOrEmpty(envDefaults.GEMINI_API_KEY),
            updatedBy: '',
        },
    };
};
