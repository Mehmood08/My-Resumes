import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Client-side UUID for now

    title: String,
    desc: String, // Markdown content
    script: String,
    date: String,
    parentId: String,
    cvFormat: String,
    userId: { type: String } // Link to User model (optional for now to allow legacy data)
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);
