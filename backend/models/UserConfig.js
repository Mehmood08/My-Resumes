import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    GEMINI_API_KEY: { type: String, default: '' },
    GEMINI_MODEL: { type: String, default: 'gemini-2.5-flash-lite' },
    RESEND_API_KEY: { type: String, default: '' },
    EMAIL_FROM: { type: String, default: '' },
    copiedFromUserId: { type: String, default: '' },
    maskedFields: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('UserConfig', userConfigSchema);
