const SECTION_ALIASES = {
    summary: ['summary', 'professional summary', 'profile', 'about'],
    experience: ['experience', 'work experience', 'employment'],
    projects: ['projects', 'personal projects'],
    education: ['education', 'academic'],
    skills: ['skills', 'technical skills', 'core competencies'],
    languages: ['languages'],
    certifications: ['certifications', 'certificates', 'licenses'],
};

function normalizeTitle(title) {
    return title.replace(/^#+\s*/, '').trim().toLowerCase();
}

function sectionMatches(sectionId, title) {
    const normalized = normalizeTitle(title);
    const aliases = SECTION_ALIASES[sectionId] || [sectionId];
    return aliases.some((alias) => normalized.includes(alias));
}

export function extractSectionBody(markdown, sectionId) {
    if (!markdown?.trim() || !sectionId) return '';

    const lines = markdown.split('\n');
    let inSection = false;
    const bodyLines = [];

    for (const line of lines) {
        const headingMatch = line.match(/^#{1,3}\s+(.+)/);
        if (headingMatch) {
            if (inSection) break;
            inSection = sectionMatches(sectionId, headingMatch[1]);
            continue;
        }
        if (inSection) bodyLines.push(line);
    }

    return bodyLines.join('\n').trim();
}

export function buildSectionDraft(section, markdown) {
    const current = extractSectionBody(markdown, section.id) || '';
    const suggested = section.suggestedContent?.trim() || current;
    return { current, suggested, savedCurrent: current };
}
