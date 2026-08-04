import { isPlaceholderOrEmpty } from './configHelper.js';

export function getInviteCredentialIssues(config) {
    const issues = [];

    if (isPlaceholderOrEmpty(config.GEMINI_API_KEY)) {
        issues.push('Add a valid Gemini API key in Settings before inviting users.');
    }

    if (isPlaceholderOrEmpty(config.RESEND_API_KEY)) {
        issues.push('Add a valid Resend API key in Settings before sending invitations.');
    }

    if (isPlaceholderOrEmpty(config.EMAIL_FROM)) {
        issues.push('Add a From Email Address in Settings before sending invitations.');
    }

    return issues;
}

export async function verifyGeminiApiKey(apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);

    if (response.ok) return null;

    if (response.status === 400 || response.status === 403) {
        return 'Your Gemini API key is invalid or expired. Update it in Settings before inviting users.';
    }

    return 'Could not verify your Gemini API key. Please try again.';
}

export async function verifyResendApiKey(apiKey) {
    const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.status === 401 || response.status === 403) {
        return 'Your Resend API key is invalid or expired. Update it in Settings before inviting users.';
    }

    if (!response.ok) {
        return 'Could not verify your Resend API key. Please try again.';
    }

    return null;
}

export async function assertInviteReady(config) {
    const issues = getInviteCredentialIssues(config);
    if (issues.length > 0) {
        const err = new Error(issues[0]);
        err.issues = issues;
        throw err;
    }

    const geminiError = await verifyGeminiApiKey(config.GEMINI_API_KEY);
    if (geminiError) {
        throw new Error(geminiError);
    }

    const resendError = await verifyResendApiKey(config.RESEND_API_KEY);
    if (resendError) {
        throw new Error(resendError);
    }
}
