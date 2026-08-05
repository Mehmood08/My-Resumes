import express from 'express';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import sendEmail from '../utils/sendEmail.js';
import normalizeEmail, { parseEmailList } from '../utils/normalizeEmail.js';
import { getEffectiveConfig } from '../utils/configHelper.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { createInvite, validateInviteToken } from '../utils/inviteHelper.js';
import { assertInviteReady, getInviteCredentialIssues } from '../utils/inviteCredentials.js';

const router = express.Router();
const MAX_BULK_INVITES = 25;

async function sendInviteEmail({ email, inviter, config, inviteDoc }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/register?invite=${inviteDoc.token}`;
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
}

async function processSingleInvite(fromUserId, rawEmail, inviter, config) {
    const email = normalizeEmail(rawEmail);
    if (!email) {
        throw new Error('A valid email address is required.');
    }

    if (inviter && normalizeEmail(inviter.email) === email) {
        throw new Error('You cannot invite your own email address.');
    }

    let invite = null;
    try {
        const { invite: inviteDoc, resent } = await createInvite(fromUserId, email);
        invite = inviteDoc;

        await sendInviteEmail({ email, inviter, config, inviteDoc });

        return {
            email,
            success: true,
            resent,
            message: resent
                ? `Invitation resent to ${email}.`
                : `Invitation sent to ${email}.`,
            invite: {
                toUserEmail: invite.toUserEmail,
                expiresAt: invite.expiresAt,
            },
        };
    } catch (err) {
        if (invite?._id) {
            await Invite.findByIdAndDelete(invite._id).catch(() => {});
        }
        throw err;
    }
}

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

router.get('/eligibility', requireAuth, async (req, res) => {
    try {
        const { config } = await getEffectiveConfig(req.userId);
        const issues = getInviteCredentialIssues(config);

        res.json({
            canInvite: issues.length === 0,
            issues,
        });
    } catch (err) {
        console.error('Invite eligibility error:', err);
        res.status(500).json({
            canInvite: false,
            issues: ['Could not check invite eligibility. Please try again.'],
        });
    }
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const emails = req.body.emails
            ? parseEmailList(req.body.emails)
            : parseEmailList(req.body.email || '');

        if (!emails.length) {
            return res.status(400).json({ message: 'At least one valid email address is required.' });
        }

        if (emails.length > MAX_BULK_INVITES) {
            return res.status(400).json({
                message: `You can invite up to ${MAX_BULK_INVITES} emails at a time.`,
            });
        }

        const inviter = await User.findById(req.userId);
        const { config } = await getEffectiveConfig(req.userId);
        await assertInviteReady(config);

        if (emails.length === 1) {
            try {
                const result = await processSingleInvite(req.userId, emails[0], inviter, config);
                return res.status(201).json({
                    message: result.message,
                    resent: result.resent,
                    invite: result.invite,
                });
            } catch (err) {
                console.error('Create invite error:', err);
                return res.status(mapInviteErrorStatus(err)).json({
                    message: err.message || 'Failed to send invitation.',
                });
            }
        }

        const results = [];
        for (const email of emails) {
            try {
                const result = await processSingleInvite(req.userId, email, inviter, config);
                results.push(result);
            } catch (err) {
                results.push({
                    email,
                    success: false,
                    message: err.message || 'Failed to send invitation.',
                });
            }
        }

        const sent = results.filter((result) => result.success).length;
        const failed = results.length - sent;

        return res.status(failed === results.length ? 400 : 201).json({
            message: failed
                ? `Sent ${sent} invitation${sent === 1 ? '' : 's'}. ${failed} failed.`
                : `Successfully sent ${sent} invitation${sent === 1 ? '' : 's'}.`,
            sent,
            failed,
            results,
        });
    } catch (err) {
        console.error('Create invite error:', err);
        res.status(mapInviteErrorStatus(err)).json({
            message: err.message || 'Failed to send invitations.',
        });
    }
});

function mapInviteErrorStatus(err) {
    const isEmailError = err.message?.includes('email') && !err.message?.includes('Settings');
    const isCredentialError = err.message?.includes('Gemini')
        || err.message?.includes('Resend')
        || err.message?.includes('Settings')
        || err.message?.includes('From Email');

    if (isCredentialError) return 403;
    if (isEmailError) return 502;
    return 400;
}

export default router;
