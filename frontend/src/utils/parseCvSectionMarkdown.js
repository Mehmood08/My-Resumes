/** Strip simple inline markdown for plain-text PDF rendering. */
export function stripInlineMarkdown(text = '') {
    return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .trim();
}

/**
 * Parse a section markdown body into render blocks for react-pdf.
 * Supports ### headings, *dates*, bullet lists, and paragraphs.
 */
export function parseSectionBlocks(content = '') {
    const blocks = [];
    let listItems = null;

    const flushList = () => {
        if (listItems?.length) {
            blocks.push({ type: 'ul', items: listItems });
        }
        listItems = null;
    };

    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            continue;
        }

        const h3 = trimmed.match(/^#{3}\s+(.+)/);
        if (h3) {
            flushList();
            blocks.push({ type: 'h3', text: stripInlineMarkdown(h3[1]) });
            continue;
        }

        const h2 = trimmed.match(/^#{2}\s+(.+)/);
        if (h2) {
            flushList();
            blocks.push({ type: 'h3', text: stripInlineMarkdown(h2[1]) });
            continue;
        }

        const emWrapped = trimmed.match(/^(\*|_)(.+)\1$/);
        if (emWrapped) {
            flushList();
            blocks.push({ type: 'date', text: stripInlineMarkdown(emWrapped[2]) });
            continue;
        }

        const bullet = trimmed.match(/^[-*+]\s+(.+)/);
        if (bullet) {
            if (!listItems) listItems = [];
            listItems.push(stripInlineMarkdown(bullet[1]));
            continue;
        }

        const ordered = trimmed.match(/^\d+\.\s+(.+)/);
        if (ordered) {
            if (!listItems) listItems = [];
            listItems.push(stripInlineMarkdown(ordered[1]));
            continue;
        }

        flushList();
        blocks.push({ type: 'p', text: stripInlineMarkdown(trimmed) });
    }

    flushList();
    return blocks;
}
