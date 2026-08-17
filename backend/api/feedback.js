import express from 'express';
import sendEmail from '../utils/sendEmail.js';
import normalizeEmail from '../utils/normalizeEmail.js';
import { getEffectiveConfig, isPlaceholderOrEmpty } from '../utils/configHelper.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const FEEDBACK_RECIPIENTS = ['shakeel@lycusin.com', 'mehmood@lycusinc.com'];
const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildFeedbackSubject(name, email, subject) {
    const senderTag = `${name} (${email})`;
    const base = subject ? `[Feedback] ${senderTag}: ${subject}` : `[Feedback] ${senderTag}`;
    return base.slice(0, MAX_SUBJECT_LENGTH);
}

router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
            return res.status(400).json({ message: 'Name is required.' });
        }
        if (trimmedName.length > MAX_NAME_LENGTH) {
            return res.status(400).json({ message: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` });
        }

        const senderEmail = normalizeEmail(email);
        if (!senderEmail) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }
        if (!EMAIL_RE.test(senderEmail)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }

        const trimmedMessage = typeof message === 'string' ? message.trim() : '';
        if (!trimmedMessage) {
            return res.status(400).json({ message: 'Message is required.' });
        }
        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
        }

        const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
        const emailSubject = buildFeedbackSubject(trimmedName, senderEmail, trimmedSubject);

        const text = [
            `From: ${trimmedName} <${senderEmail}>`,
            `Reply-To: ${senderEmail}`,
            '',
            trimmedMessage,
        ].join('\n');

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 560px; margin: auto;">
                <h2 style="color: #0f172a; margin-top: 0;">My Resumes Feedback</h2>
                <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                    From <strong>${escapeHtml(trimmedName)}</strong>
                    (<a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a>)
                </p>
                <div style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(trimmedMessage)}</div>
            </div>
        `;

        const { config: systemConfig } = await getEffectiveConfig(null);
        let config = systemConfig;
        if (isPlaceholderOrEmpty(config.RESEND_API_KEY)) {
            ({ config } = await getEffectiveConfig(req.userId));
        }

        if (isPlaceholderOrEmpty(config.RESEND_API_KEY)) {
            return res.status(503).json({
                message: 'Feedback email is not configured on the server. Please try again later.',
            });
        }

        await sendEmail({
            email: FEEDBACK_RECIPIENTS,
            replyTo: senderEmail,
            subject: emailSubject,
            message: text,
            html,
        }, config);

        res.json({ message: 'Thank you! Your feedback has been sent.' });
    } catch (err) {
        console.error('Feedback email error:', err);
        res.status(500).json({
            message: 'Failed to send feedback. Please try again later.',
        });
    }
});

export default router;
