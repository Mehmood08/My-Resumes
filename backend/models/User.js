import mongoose from 'mongoose';
import normalizeEmail from '../utils/normalizeEmail.js';

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: String,
    picture: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    invitedBy: String,
}, { timestamps: true });

userSchema.pre('save', function {
    if (this.email) {
        this.email = normalizeEmail(this.email);
    }
});

export default mongoose.model('User', userSchema);
