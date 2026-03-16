import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './api/auth.js';
import resumeRoutes from './api/resumes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://my-resumes-alpha.vercel.app', 
        'https://my-resumes-ixfh.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        if (err.code === 'ENOTFOUND') {
            console.error('❌ MongoDB Connection Error: DNS address not found (ENOTFOUND).');
            console.error('👉 Please check your internet connection or the MONGODB_URI in your .env file.');
        } else {
            console.error('❌ Could not connect to MongoDB:', err);
        }
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

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
    const state = mongoose.connection.readyState;
    // 1 = connected, 2 = connecting
    const isDbWorking = state === 1 || state === 2;
    
    res.json({ 
        message: 'Backend is working!', 
        status: isDbWorking ? 'success' : 'error',
        database: state 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
