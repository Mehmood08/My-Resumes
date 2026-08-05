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

    try {
        const decoded = jwt.verify(token, secret);
        req.userId = String(decoded.id);

        const user = await User.findById(decoded.id).select('googleId');
        if (!user) {
            return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
        }

        req.ownerIds = [...new Set([String(user._id), user.googleId].filter(Boolean))];
        next();
    } catch {
        return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
    }
};
