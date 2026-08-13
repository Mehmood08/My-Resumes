import React from 'react';
import { useMarkdownHtml } from './useMarkdownHtml';

/**
 * Single CV section: title + markdown body.
 */
export default function CVEntry({
    title,
    content,
    sectionClassName = 'cv-section',
    titleClassName = 'section-title',
    bodyClassName = 'section-content',
    titleAs: TitleTag = 'h2',
    titlePrefix = '',
    nestedBody = true,
}) {
    const html = useMarkdownHtml(content);

    return (
        <section className={sectionClassName}>
            <TitleTag className={titleClassName}>
                {titlePrefix}{title}
            </TitleTag>
            {nestedBody ? (
                <div className={bodyClassName}>
                    {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
                </div>
            ) : (
                html ? (
                    <div className={bodyClassName} dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                    <div className={bodyClassName} />
                )
            )}
        </section>
    );
}
