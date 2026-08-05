import { Resend } from 'resend';
import { getEnvDefaults, isPlaceholderOrEmpty } from './configHelper.js';

const sendEmail = async (options, configOverride = null) => {
    const config = configOverride || getEnvDefaults();

    const apiKey = config.RESEND_API_KEY;
    const from = config.EMAIL_FROM || 'CV Builder <onboarding@resend.dev>';

    if (isPlaceholderOrEmpty(apiKey)) {
        throw new Error('Resend API key is not configured.');
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
