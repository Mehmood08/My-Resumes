import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { getJwtSecret } from '../utils/configHelper.js';
import normalizeEmail from '../utils/normalizeEmail.js';
import { databaseUnavailableMessage } from '../utils/dbErrors.js';
import { validateInviteToken, acceptInvite, copyInviterSettingsToUser } from '../utils/inviteHelper.js';
import { toSafeUser } from '../utils/userDto.js';
import { withDevDetails } from '../utils/errorResponse.js';

const router = express.Router();
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

async function applyInviteToNewUser(user, inviteToken, email) {
    if (!inviteToken) return;

    const validation = await validateInviteToken(inviteToken);
    if (!validation.valid) {
        throw new Error(validation.message);
    }
    if (validation.email !== email) {
        throw new Error('This invitation was sent to a different email address.');
    }

    user.invitedBy = validation.invite.fromUserId;
    await user.save();
    await copyInviterSettingsToUser(validation.invite.fromUserId, user._id.toString());
    await acceptInvite(validation.invite, user._id.toString(), email);
}

// Google Auth
router.post('/google', async (req, res) => {
    const { token, inviteToken } = req.body;
    
    // GOOGLE_CLIENT_ID always comes from process.env (not DB)
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ;
    
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

        const { sub, email: rawEmail, name, picture } = ticket.getPayload();
        const email = normalizeEmail(rawEmail);
        if (!email) {
            return res.status(400).json({ message: "No email provided by Google account." });
        }
        console.log("✅ Token verified for:", email);

        let user = await User.findOne({ email });

        if (!user) {
            if (inviteToken) {
                const validation = await validateInviteToken(inviteToken);
                if (!validation.valid) {
                    return res.status(400).json({ message: validation.message });
                }
                if (validation.email !== email) {
                    return res.status(400).json({ message: 'Google account email must match the invited address.' });
                }
            }

            user = new User({ googleId: sub, email, name, picture });
            await user.save();
            if (inviteToken) {
                await applyInviteToNewUser(user, inviteToken, email);
            }
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.picture) user.picture = picture;
            await user.save();
        }

        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
            getJwtSecret(),
            { expiresIn: '7d' }
        );

        res.json({ token: sessionToken, user: toSafeUser(user) });

    } catch (err) {
        console.error("❌ Google Auth Backend Error:", err.message);

        const dbMessage = databaseUnavailableMessage(err);
        if (dbMessage) {
            return res.status(503).json(withDevDetails({
                message: dbMessage,
                error_type: 'DATABASE_UNAVAILABLE',
            }, err));
        }

        let customMessage = "Authentication Failed";
        if (err.message.includes("audience")) {
            customMessage = "Google Console Mismatch (Wait 5 min after whitelist)";
        }

        res.status(401).json(withDevDetails({
            message: customMessage,
            error_type: "GOOGLE_VERIFY_ERROR",
        }, err));
    }
});




// Register
router.post('/register', async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const { password, name, confirmPassword, inviteToken } = req.body;
    if (!email) {
        return res.status(400).json({ message: "A valid email is required." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }
    try {
        if (inviteToken) {
            const validation = await validateInviteToken(inviteToken);
            if (!validation.valid) {
                return res.status(400).json({ message: validation.message });
            }
            if (validation.email !== email) {
                return res.status(400).json({ message: "Email must match the invited address." });
            }
        }

        let user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            return res.status(400).json({ message: "An account already exists with this email. Please Login instead or use Forgot Password." });
        }

        user = new User({ email, password: hashedPassword, name });
        await user.save();
        user.googleId = user._id.toString();
        await user.save();

        if (inviteToken) {
            await applyInviteToNewUser(user, inviteToken, email);
        }

        console.log(`New user registered: ${email}`);

        const token = jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
        res.status(201).json({ token, user: toSafeUser(user) });
    } catch (err) {
        console.error("Register Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "An account already exists with this email. Please Login instead or use Forgot Password." });
        }
        const dbMessage = databaseUnavailableMessage(err);
        if (dbMessage) {
            return res.status(503).json(withDevDetails({ message: dbMessage }, err));
        }
        res.status(500).json({ message: "Server error during registration." });
    }
});

// Login
router.post('/login', async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email) {
        return res.status(400).json({ message: "A valid email is required." });
    }
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: INVALID_CREDENTIALS_MESSAGE });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: INVALID_CREDENTIALS_MESSAGE });

        if (!user.googleId) {
            user.googleId = user._id.toString();
            await user.save();
        }

        const token = jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
        res.json({ token, user: toSafeUser(user) });
    } catch (err) {
        console.error("Login Error:", err);
        const dbMessage = databaseUnavailableMessage(err);
        if (dbMessage) {
            return res.status(503).json(withDevDetails({ message: dbMessage }, err));
        }
        res.status(500).json({ message: "Server error during login." });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const email = normalizeEmail(req.body.email);
    console.log('Forgot password request for:', email);
    if (!email) {
        return res.json({ message: "If an account exists with this email, a reset link has been sent." });
    }
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
        const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password#token=${resetToken}`;
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
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ message: 'Reset token and new password are required.' });
    }
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
