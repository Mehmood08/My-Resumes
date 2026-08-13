import React from 'react';
import CVEntry from './CVEntry';
import { MarkdownHtml } from './useMarkdownHtml';

/**
 * Renders optional intro + a list of CV sections.
 */
export default function CVSections({
    sections = [],
    intro,
    introClassName = 'cv-intro',
    wrapperClassName,
    entryProps = {},
}) {
    const sectionList = sections.map((sec, idx) => (
        <CVEntry
            key={idx}
            title={sec.title}
            content={sec.content}
            {...entryProps}
        />
    ));

    return (
        <>
            {intro ? (
                <div className={introClassName}>
                    <MarkdownHtml content={intro} />
                </div>
            ) : null}
            {wrapperClassName ? (
                <div className={wrapperClassName}>{sectionList}</div>
            ) : (
                sectionList
            )}
        </>
    );
}
