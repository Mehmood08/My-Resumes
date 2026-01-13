import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './api/auth.js';
import resumeRoutes from './api/resumes.js';
import aiRoutes from './api/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2563eb;">🚀 Backend is running!</h1>
            <p>This is the server side of your CV Builder.</p>
            <p><strong>To see your website, please go to:</strong></p>
            <a href="http://localhost:5173" style="font-size: 20px; color: #10b981; font-weight: bold;">http://localhost:5173</a>
        </div>
    `);
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', status: 'success' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
