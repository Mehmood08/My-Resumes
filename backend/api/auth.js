import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth
router.post('/google', async (req, res) => {
    const { token } = req.body;
    
    // Use environment variable OR hardcoded fallback (Must match frontend)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1042081648232-0jteg1ui82qc1k1ckid5i08lsmtb3oa6.apps.googleusercontent.com";
    
    // Initialize client inside handler to ensure GOOGLE_CLIENT_ID is captured correctly
    const authClient = new OAuth2Client(GOOGLE_CLIENT_ID);

    try {
        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const ticket = await authClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });

        const { sub, email, name, picture } = ticket.getPayload();
        console.log("✅ Token verified for:", email);

        let user = await User.findOne({ email });
        // ... user creation logic remains same ...
        if (!user) {
            user = new User({ googleId: sub, email, name, picture });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.picture) user.picture = picture;
            await user.save();
        }

        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token: sessionToken, user: { ...user._doc, googleId: user.googleId || user._id.toString() } });

    } catch (err) {
        console.error("❌ Google Auth Backend Error:", err.message);
        
        let customMessage = "Authentication Failed";
        if (err.message.includes("buffering timed out")) {
            customMessage = "Server Busy (Database Timeout). Please click login again.";
        } else if (err.message.includes("audience")) {
            customMessage = "Google Console Mismatch (Wait 5 min after whitelist)";
        }

        res.status(401).json({ 
            message: customMessage, 
            error_type: "GOOGLE_VERIFY_ERROR",
            details: err.message 
        });
    }
});




// Register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        let user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            // No matter if it's a Google account or Password account, don't allow registration
            return res.status(400).json({ message: "An account already exists with this email. Please Login instead or use Forgot Password." });
        }

        // Case 3: Completely new user
        user = new User({ email, password: hashedPassword, name });
        await user.save();
        user.googleId = user._id.toString(); // Fallback ID
        await user.save();
        console.log(`New user registered: ${email}`);

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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('Forgot password request for:', email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('USER NOT FOUND IN DATABASE:', email);
            // Send same message even if email not found for security
            return res.json({ message: "If an account exists with this email, a reset link has been sent." });
        }
        console.log('USER FOUND:', user.email);

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry to DB
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Send Email
        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const message = `You requested a password reset. Please click the link below to set a new password:\n\n${resetURL}\n\nIf you didn't request this, please ignore this email.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #777; font-size: 0.9em;">This link will expire in 15 minutes.</p>
                <p style="color: #777; font-size: 0.9em;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `;

        try {
            console.log('Attempting to send email to:', user.email);
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                message,
                html
            });
            console.log('EMAIL SENT SUCCESSFULLY via Mailtrap');
            res.json({ message: "If an account exists with this email, a reset link has been sent." });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error("Email Error:", err);
            return res.status(500).json({ message: "There was an error sending the email. Try again later." });
        }

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Server error during forgot password request." });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired." });
        }

        // Hash new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful! You can now log in with your new password." });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Server error during password reset." });
    }
});

export default router;
