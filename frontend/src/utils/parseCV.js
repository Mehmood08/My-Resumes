/** Parse CV markdown into structured header + sections (shared by preview and PDF export). */
export function parseCV(markdown) {
    const empty = {
        photo: '',
        name: '',
        profession: '',
        email: '',
        phone: '',
        city: '',
        province: '',
        zip: '',
        link1: '',
        link2: '',
        sections: [],
        raw: markdown || '',
    };

    if (!markdown?.trim()) return empty;

    const lines = markdown.split('\n');
    let name = '';
    let profession = '';
    let email = '';
    let phone = '';
    let city = '';
    let province = '';
    let zip = '';
    let link1 = '';
    let link2 = '';
    let photo = '';
    const sections = [];
    let currentSection = null;
    let isHeaderParsing = true;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('![Profile](') && isHeaderParsing) {
            photo = trimmed.substring(11, trimmed.length - 1);
            continue;
        }

        if (line.startsWith('# ') && isHeaderParsing) {
            const titleLine = line.replace('# ', '').trim();
            const [namePart, professionPart] = titleLine.split('|').map((s) => s.trim());
            name = namePart || '';
            profession = professionPart || '';
            continue;
        }

        if (isHeaderParsing && line.includes('|')) {
            const parts = line.split('|').map((s) => s.trim());

            if (parts.length >= 2 && (parts[0].includes('http') || parts[0].includes('www'))) {
                link1 = parts[0] || '';
                link2 = parts[1] || '';
                continue;
            }

            if (parts.length >= 1) {
                const locParts = parts[0].split(',').map((s) => s.trim());
                city = locParts[0] || '';
                province = locParts[1] || '';
                zip = locParts[2] || '';
                email = parts[1] || '';
                phone = parts[2] || '';
            }
            continue;
        }

        if (line.startsWith('## ')) {
            isHeaderParsing = false;
            if (currentSection) {
                sections.push({
                    ...currentSection,
                    content: currentSection.content.join('\n').trim(),
                });
            }
            currentSection = { title: line.replace('## ', '').trim(), content: [] };
        } else if (currentSection) {
            currentSection.content.push(line);
        }
    }

    if (currentSection) {
        sections.push({
            ...currentSection,
            content: currentSection.content.join('\n').trim(),
        });
    }

    return {
        photo,
        name,
        profession,
        email,
        phone,
        city,
        province,
        zip,
        link1,
        link2,
        sections,
        raw: markdown,
    };
}
