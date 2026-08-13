import React from 'react';
import { getInitials } from './cvUtils';

/**
 * Profile photo with optional initials fallback (European sidebar).
 */
export default function CVPhoto({
    photo,
    name,
    className = 'cv-photo-container',
    imgClassName = 'cv-photo',
    fallback = 'none',
    initialsClassName = 'user-initials',
}) {
    if (photo) {
        return (
            <div className={className}>
                <img src={photo} alt="Profile" className={imgClassName} />
            </div>
        );
    }

    if (fallback === 'initials') {
        return <div className={initialsClassName}>{getInitials(name)}</div>;
    }

    return null;
}
