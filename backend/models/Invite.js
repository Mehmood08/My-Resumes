import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
    fromUserId: { type: String, required: true },
    toUserEmail: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
    acceptedAt: Date,
    acceptedByUserId: String,
}, { timestamps: true });

inviteSchema.index({ toUserEmail: 1, status: 1 });

export default mongoose.model('Invite', inviteSchema);
