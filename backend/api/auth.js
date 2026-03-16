import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth
router.post('/google', async (req, res) => {
    const { token } = req.body;
    console.log("Google Auth Request received. Token present:", !!token);

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1042081648232-0jteg1ui82qc1k1ckid5i08lsmtb3oa6.apps.googleusercontent.com";

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        console.log("Token verified successfully for:", ticket.getPayload().email);
        const { sub, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
            console.log("New user created via Google:", email);
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.picture) user.picture = picture;
            await user.save();
            console.log("Existing user linked to Google:", email);
        }

        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        const userData = {
            ...user._doc,
            googleId: user.googleId || user._id.toString()
        };

        res.json({ token: sessionToken, user: userData });
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ message: "Invalid Token" });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        let user = await User.findOne({ email });
        
        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            // If user exists but has no password (signed up via Google previously)
            if (!user.password) {
                user.password = hashedPassword;
                if (!user.name) user.name = name; // Update name if missing
                await user.save();
                console.log(`Password added to existing Google account: ${email}`);
            } else {
                return res.status(400).json({ message: "User already exists with this email." });
            }
        } else {
            // Completely new user
            user = new User({ email, password: hashedPassword, name });
            await user.save();
            user.googleId = user._id.toString(); // Fallback ID
            await user.save();
            console.log(`New user registered: ${email}`);
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        const userData = { ...user._doc, googleId: user.googleId || user._id.toString() };
        res.status(201).json({ token, user: userData });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No account found with this email. Please register." });
        }

        if (!user.password) {
            return res.status(400).json({ message: "You previously signed in with Google. Please use the 'Sign in with Google' button, or register to set a password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

        if (!user.googleId) {
            user.googleId = user._id.toString();
            await user.save();
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        const userData = { ...user._doc, googleId: user.googleId || user._id.toString() };
        res.json({ token, user: userData });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error during login." });
    }
});

export default router;
