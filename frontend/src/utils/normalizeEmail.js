export const MASKED_SENTINEL = '__MASKED__';

export default function normalizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

export function isMaskedValue(value) {
    return value === MASKED_SENTINEL;
}

export function parseEmailList(input) {
    if (Array.isArray(input)) {
        return [...new Set(input.map(normalizeEmail).filter(Boolean))];
    }

    if (typeof input !== 'string') return [];

    return [...new Set(
        input
            .split(/[\n,;]+/)
            .map((part) => normalizeEmail(part))
            .filter(Boolean)
    )];
}
