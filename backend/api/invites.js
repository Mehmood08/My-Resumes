import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import sendEmail from '../utils/sendEmail.js';
import normalizeEmail from '../utils/normalizeEmail.js';
import { getSystemConfig, getEffectiveConfig, isPlaceholderOrEmpty } from '../utils/configHelper.js';
import { createInvite, validateInviteToken } from '../utils/inviteHelper.js';

const router = express.Router();

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required.' });
    }
    try {
        const { config } = await getSystemConfig();
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired session.' });
    }
};

router.get('/validate/:token', async (req, res) => {
    try {
        const result = await validateInviteToken(req.params.token);
        if (!result.valid) {
            return res.status(400).json({ valid: false, message: result.message });
        }
        res.json({
            valid: true,
            email: result.email,
            inviterName: result.inviterName,
        });
    } catch (err) {
        console.error('Validate invite error:', err);
        res.status(500).json({ valid: false, message: 'Failed to validate invitation.' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    let invite = null;
    try {
        const email = normalizeEmail(req.body.email);
        if (!email) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }

        const inviter = await User.findById(req.userId);
        if (inviter && normalizeEmail(inviter.email) === email) {
            return res.status(400).json({ message: 'You cannot invite your own email address.' });
        }

        const { config } = await getEffectiveConfig(req.userId);

        if (isPlaceholderOrEmpty(config.GEMINI_API_KEY)) {
            return res.status(400).json({
                message: 'Configure your Gemini API key in Settings before inviting users.',
            });
        }

        if (isPlaceholderOrEmpty(config.RESEND_API_KEY)) {
            return res.status(400).json({
                message: 'Add your Resend API key in Settings to send invitation emails.',
            });
        }

        const { invite: inviteDoc, resent } = await createInvite(req.userId, email);
        invite = inviteDoc;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteUrl = `${frontendUrl}/register?invite=${invite.token}`;
        const inviterName = inviter?.name || 'Someone';

        const message = `${inviterName} invited you to join My Resumes.\n\nCreate your account here:\n${inviteUrl}\n\nThis link expires in 7 days.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 560px; margin: auto;">
                <h2 style="color: #0f172a; margin-top: 0;">You're invited to My Resumes</h2>
                <p style="color: #475569; line-height: 1.6;">
                    <strong>${inviterName}</strong> invited you to create an account and start building CVs with AI.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${inviteUrl}" style="background: #1e293b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Accept Invitation & Register
                    </a>
                </div>
                <p style="color: #64748b; font-size: 13px;">Or copy this link: ${inviteUrl}</p>
                <p style="color: #94a3b8; font-size: 12px;">This invitation expires in 7 days.</p>
            </div>
        `;

        await sendEmail({
            email,
            subject: `${inviterName} invited you to My Resumes`,
            message,
            html,
        }, config);

        res.status(201).json({
            message: resent
                ? `Invitation resent to ${email}.`
                : `Invitation sent to ${email}.`,
            resent,
            invite: {
                toUserEmail: invite.toUserEmail,
                expiresAt: invite.expiresAt,
            },
        });
    } catch (err) {
        console.error('Create invite error:', err);
        if (invite?._id) {
            await Invite.findByIdAndDelete(invite._id).catch(() => {});
        }

        const isEmailError = err.message?.includes('Resend') || err.message?.includes('email');
        res.status(isEmailError ? 502 : 400).json({
            message: err.message || 'Failed to send invitation.',
        });
    }
});

export default router;
