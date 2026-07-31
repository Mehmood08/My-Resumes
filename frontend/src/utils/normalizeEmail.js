export const MASKED_SENTINEL = '__MASKED__';

export default function normalizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

export function isMaskedValue(value) {
    return value === MASKED_SENTINEL;
}
