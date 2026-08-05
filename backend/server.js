import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './api/auth.js';
import resumeRoutes from './api/resumes.js';
import configRoutes from './api/config.js';
import inviteRoutes from './api/invites.js';
import { isJwtSecretConfigured } from './utils/configHelper.js';
import { authRateLimiter } from './middleware/rateLimit.js';
dotenv.config();

if (process.env.NODE_ENV === 'production' && !isJwtSecretConfigured()) {
    console.warn('JWT_SECRET is not set in environment variables. Auth routes will fail until it is configured.');
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://my-resumes-alpha.vercel.app', 
        'https://my-resumes-ixfh.vercel.app'
    ],
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));



// MongoDB Connection logic for Serverless/Production
let cachedDb = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.db.admin().ping();
            return mongoose.connection;
        } catch (err) {
            cachedDb = null;
            console.error('MongoDB ping failed:', err.message);
        }
    }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app';

    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 15000,
        });
        cachedDb = conn;
        console.log('✅ Connected to MongoDB Successfully');
        return conn;
    } catch (err) {
        cachedDb = null;
        console.error('❌ MongoDB Connection ERROR:', err.message);
        throw err;
    }
};

// Initial connection attempt with error recovery
connectDB().catch(err => {
    console.error("Initial DB connect failed. Will retry on request.");
});

// Middleware to ensure DB is connected before API routes that need it
const DB_OPTIONAL_PATHS = ['/api/config/status'];

app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api') || DB_OPTIONAL_PATHS.includes(req.path)) {
        return next();
    }

    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("📛 Request failed due to DB connection issues.");
        return res.status(503).json({
            status: 'error',
            message: 'Database is unavailable. Please try again in a moment.',
            ...(isProduction ? {} : { details: err.message }),
        });
    }
});



// Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/config', configRoutes);
app.use('/api/invites', inviteRoutes);

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

app.get('/api/test', async (req, res) => {
    const state = mongoose.connection.readyState;

    if (state !== 1) {
        return res.status(503).json({
            message: 'Backend is running but the database is not connected.',
            status: 'error',
            database: state,
        });
    }

    try {
        await mongoose.connection.db.admin().ping();
        res.json({
            message: 'Backend is working!',
            status: 'success',
            database: state,
        });
    } catch (err) {
        res.status(503).json({
            message: 'Database is unavailable.',
            status: 'error',
            database: state,
            ...(isProduction ? {} : { details: err.message }),
        });
    }
});

// Fallback: If someone accidentally hits /reset-password on the BACKEND, redirect them to FRONTEND
app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/reset-password#token=${token}`);
});

app.get('/register', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.redirect(`${frontendUrl}/register${query}`);
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
    🚀 Backend is running!
    📡 Port: ${PORT}
    🔗 URL: http://localhost:${PORT}
    `);
    });
}

export default app;
