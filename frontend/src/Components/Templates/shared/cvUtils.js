/** Strip protocol and trailing slash for display URLs. */
export function getDisplayUrl(url = '') {
    try {
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    } catch {
        return url;
    }
}

/** Two-letter initials from a name (European sidebar fallback). */
export function getInitials(name) {
    return name ? name.substring(0, 2).toUpperCase() : 'ME';
}

export const DEFAULT_CONTACT_ORDER = ['email', 'phone', 'location', 'link1', 'link2'];

export const AMERICA_CONTACT_ORDER = ['location', 'email', 'phone', 'link1', 'link2'];
