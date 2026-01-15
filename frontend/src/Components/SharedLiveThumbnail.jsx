import React from 'react';
import CVPreview from './CVPreview';

export const DEMO_MARKDOWN = `# Mehmood Shah | Full Stack Developer
Mardan, Pakistan | mehmood@example.com | 0347-1234567
https://github.com/mehmood08 | https://linkedin.com/in/mehmood

## Professional Summary
Passionate Full Stack Developer with 1 years of experience building scalable web applications. Expert in React.js, Node.js, and modern CSS frameworks. Proactive problem solver with a focus on clean code and user experience.

## Technical Skills
- **Frontend**: React.js, Next.js, Redux, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, MongoDB, PostgreSQL, GraphQL
- **Tools**: Git, Docker, Vercel, AWS, Jenkins

## Experience
### Juniour Full Stack Developer | Lycus inc.
*2022 - Present*
- Led the architectural design of a high-traffic e-commerce platform using Next.js.
- Optimized API performance by 40% through advanced caching strategies.
- Mentored a cross-functional team of 6 developers.

### Software Engineer | Creative Solutions
*2020 - 2022*
- Developed and maintained over 15 responsive web applications.
- Collaborated with designers to implement pixel-perfect UI.

## Education
### BS in Software Engineering
*University of Hazara*
`;

export const LiveThumbnail = ({ markdown, formatId }) => {
    // Determine if we should show demo data
    const isDefaultMarkdown = (md) => {
        if (!md) return true;
        if (md.length < 50) return true;
        if (md.includes("# [Name] | [Title]")) return true;
        return false;
    };

    const effectiveMarkdown = isDefaultMarkdown(markdown) ? DEMO_MARKDOWN : markdown;

    return (
        <div className="live-thumbnail-modern">
            <div className="thumbnail-scale-wrapper">
                <CVPreview markdown={effectiveMarkdown} format={formatId} />
            </div>
            {/* Overlay to block internal pointer events but allow click on card */}
            <div className="thumbnail-interact-blocker" />
        </div>
    );
};
