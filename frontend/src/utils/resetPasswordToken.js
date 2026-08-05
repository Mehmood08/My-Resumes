const STORAGE_KEY = 'resetPasswordToken';

function persistAndCleanUrl(token) {
    sessionStorage.setItem(STORAGE_KEY, token);
    window.history.replaceState({}, '', '/reset-password');
    return token;
}

export function consumeResetPasswordToken() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashToken = hashParams.get('token');
    if (hashToken) {
        return persistAndCleanUrl(hashToken);
    }

    const queryToken = new URLSearchParams(window.location.search).get('token');
    if (queryToken) {
        return persistAndCleanUrl(queryToken);
    }

    const path = window.location.pathname;
    if (path.startsWith('/reset-password/') && path.length > '/reset-password/'.length) {
        const pathToken = path.slice('/reset-password/'.length);
        if (pathToken) {
            return persistAndCleanUrl(pathToken);
        }
    }

    if (path === '/reset-password') {
        return sessionStorage.getItem(STORAGE_KEY);
    }

    return null;
}

export function clearResetPasswordToken() {
    sessionStorage.removeItem(STORAGE_KEY);
}
