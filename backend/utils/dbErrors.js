const DB_DOWN_MESSAGES = [
    'buffering timed out',
    'MongoServerSelectionError',
    'MongoNetworkError',
    'MongoTimeoutError',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'connection timed out',
    'connect ECONNREFUSED',
];

export function isDatabaseError(err) {
    if (!err) return false;
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
        return true;
    }
    const message = `${err.message || ''} ${err.reason?.message || ''}`;
    return DB_DOWN_MESSAGES.some((fragment) => message.includes(fragment));
}

export function databaseUnavailableMessage(err) {
    if (isDatabaseError(err)) {
        return 'Database is unavailable. Please try again in a moment.';
    }
    return null;
}
