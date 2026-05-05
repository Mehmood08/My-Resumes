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
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});



// MongoDB Connection logic for Serverless/Production
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';
    
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        // Standard Mongoose options for stable production connection
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // Wait 30 seconds before timing out
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        cachedDb = conn;
        console.log('✅ Connected to MongoDB Successfully');
        return conn;
    } catch (err) {
        console.error('❌ MongoDB Connection ERROR:', err.message);
        throw err;
    }
};

// Initial connection attempt with error recovery
connectDB().catch(err => {
    console.error("Initial DB connect failed. Will retry on request.");
});

// Middleware to ensure DB is connected before any API route executes
app.use(async (req, res, next) => {
    // Only wait for DB on /api routes
    if (req.path.startsWith('/api')) {
        try {
            await connectDB();
            next();
        } catch (err) {
            console.error("📛 Request failed due to DB connection issues.");
            return res.status(503).json({ 
                status: 'error', 
                message: 'Database is still waking up. Please refresh in 5 seconds.',
                details: err.message
            });
        }
    } else {
        next();
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

// Fallback: If someone accidentally hits /reset-password on the BACKEND, redirect them to FRONTEND
app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/reset-password/${token}`);
});

app.listen(PORT, () => {
    console.log(`
    🚀 Backend is running!
    📡 Port: ${PORT}
    🔗 URL: http://localhost:${PORT}
    `);
});

export default app;
