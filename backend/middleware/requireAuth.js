import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../utils/configHelper.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const secret = getJwtSecret();
    if (!secret) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured. Please set it in your backend .env file.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch {
        return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }

    try {
        req.userId = String(decoded.id);

        const user = await User.findById(decoded.id).select('googleId');
        if (!user) {
            return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
        }

        req.ownerIds = [...new Set([String(user._id), user.googleId].filter(Boolean))];
        next();
    } catch (err) {
        console.error('requireAuth DB error:', err);
        return res.status(503).json({ message: 'Database is unavailable. Please try again in a moment.' });
    }
};
