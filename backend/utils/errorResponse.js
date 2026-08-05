const isProduction = () => process.env.NODE_ENV === 'production';

export function withDevDetails(payload, err) {
    if (isProduction() || !err?.message) {
        return payload;
    }
    return { ...payload, details: err.message };
}
