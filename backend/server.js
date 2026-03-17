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

// Security Headers for Google Auth (COOP)
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional, keep commented unless needed
    next();
});


// MongoDB Connection logic for Serverless/Production
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) return cachedDb;

    try {
        console.log('🔄 Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app');
        cachedDb = conn;
        console.log('✅ Connected to MongoDB');
        return conn;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        throw err;
    }
};


// Initial connection attempt
connectDB().catch(err => console.error("Initial DB connect failed:", err));

// Middleware to ensure DB is connected for every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(503).json({ status: 'error', message: 'Database connection failed' });
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
