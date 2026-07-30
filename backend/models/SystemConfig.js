import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
    JWT_SECRET: { type: String, default: '' },
    GEMINI_API_KEY: { type: String, default: '' },
    EMAIL_HOST: { type: String, default: 'smtp.gmail.com' },
    EMAIL_PORT: { type: Number, default: 465 },
    EMAIL_USER: { type: String, default: '' },
    EMAIL_PASSWORD: { type: String, default: '' },
    EMAIL_FROM: { type: String, default: '' },
    isConfigured: { type: Boolean, default: false },
    updatedBy: { type: String, default: '' }   // stores userId of last editor
}, {
    timestamps: true
});

const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

export default SystemConfig;
