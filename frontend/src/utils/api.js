let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

export function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...extraHeaders };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

export async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: getAuthHeaders(options.headers),
    });

    if (res.status === 401 || res.status === 403) {
        unauthorizedHandler?.();
    }

    return res;
}
