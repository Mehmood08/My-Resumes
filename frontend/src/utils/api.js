export function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...extraHeaders };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}
