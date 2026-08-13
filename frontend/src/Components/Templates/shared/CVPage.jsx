import React from 'react';

/**
 * A4 page wrapper for CV templates.
 * Set flush for full-bleed layouts (sidebar, colored headers).
 */
const CVPage = ({ theme, className = '', flush = false, children }) => {
    const pageClass = [
        'cv-page',
        flush ? 'cv-page--flush' : '',
        theme ? `cv-theme-${theme}` : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className="cv-page-scaler">
            <div className="cv-page-viewport">
                <article className={pageClass} lang="en">
                    {children}
                </article>
            </div>
        </div>
    );
};

export default CVPage;
