export const parseMarkdownToSections = (markdown) => {
    if (!markdown) return [];

    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = { title: 'Header', content: [] };

    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (currentSection.title !== 'Header' || currentSection.content.length > 0) {
                sections.push({
                    ...currentSection,
                    content: currentSection.content.join('\n').trim()
                });
            }
            currentSection = {
                title: line.replace('## ', '').trim(),
                content: []
            };
        } else {
            currentSection.content.push(line);
        }
    }

    sections.push({
        ...currentSection,
        content: currentSection.content.join('\n').trim()
    });

    return sections;
};

export const sectionsToMarkdown = (sections) => {
    return sections.map(section => {
        if (section.title === 'Header') {
            return section.content;
        }
        return `\n## ${section.title}\n${section.content}`;
    }).join('\n').trim();
};
