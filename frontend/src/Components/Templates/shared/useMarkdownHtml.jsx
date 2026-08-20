import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Sanitized HTML string from markdown — memoized per content. */
export function useMarkdownHtml(markdown) {
    return useMemo(() => {
        if (!markdown) return '';
        return DOMPurify.sanitize(marked(markdown));
    }, [markdown]);
}

/** Renders sanitized markdown as HTML inside a wrapper element. */
export function MarkdownHtml({ content, className, as: Tag = 'div' }) {
    const html = useMarkdownHtml(content);
    if (!html) return null;
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
