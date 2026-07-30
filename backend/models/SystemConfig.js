import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
    JWT_SECRET:     { type: String, default: '' },
    GEMINI_API_KEY: { type: String, default: '' },
    RESEND_API_KEY: { type: String, default: '' },
    EMAIL_FROM:     { type: String, default: '' },  // "From" display address, e.g. noreply@yourdomain.com
    isConfigured:   { type: Boolean, default: false },
    updatedBy:      { type: String, default: '' }   // stores userId of last editor
}, {
    timestamps: true
});

const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);

export default SystemConfig;
