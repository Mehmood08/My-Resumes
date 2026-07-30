import { Resend } from 'resend';
import { getSystemConfig } from './configHelper.js';

const sendEmail = async (options) => {
    const { config } = await getSystemConfig();

    const apiKey  = config.RESEND_API_KEY;
    const from    = config.EMAIL_FROM || 'CV Builder <onboarding@resend.dev>';

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured. Please add it in System Settings.');
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
        from,
        to:      options.email,
        subject: options.subject,
        text:    options.message,
        html:    options.html,
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message || 'Failed to send email via Resend.');
    }

    console.log(`✅ Email sent via Resend. ID: ${data.id}`);
};

export default sendEmail;
