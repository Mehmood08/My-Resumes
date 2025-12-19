import React, { useMemo } from 'react';
import { marked } from 'marked';
import "./cvPreview.css";

// Templates
import CVGulf from './Templates/CVGulf';
import CVEuropean from './Templates/CVEuropean';
import CVAmerica from './Templates/CVAmerica';

const CVPreview = ({ markdown, format }) => {
    const parsedData = useMemo(() => {
        if (!markdown) return { name: "", email: "", phone: "", intro: "", sections: [], raw: "" };

        const lines = markdown.split('\n');
        let name = "";
        let email = "";
        let phone = "";
        let introLines = [];
        const sections = [];
        let currentSection = null;

        for (let line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('# ')) {
                if (!name) name = trimmedLine.replace('# ', '');
                continue;
            }

            // Extract email/phone
            if (trimmedLine.includes('@') && !email) {
                const emailMatch = trimmedLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch) email = emailMatch[0];
            }
            const phoneMatch = trimmedLine.match(/(\+?\d[\d -]{8,}\d)/);
            if (phoneMatch && !phone) {
                if (trimmedLine.length < 50) phone = phoneMatch[0];
            }

            if (trimmedLine.startsWith('## ')) {
                if (currentSection) {
                    sections.push({ ...currentSection, content: currentSection.content.join('\n') });
                }
                currentSection = { title: trimmedLine.replace('## ', ''), content: [] };
            } else {
                if (currentSection) {
                    currentSection.content.push(line);
                } else {
                    if (trimmedLine) introLines.push(line);
                }
            }
        }
        if (currentSection) {
            sections.push({ ...currentSection, content: currentSection.content.join('\n') });
        }

        return { name, email, phone, intro: introLines.join('\n'), sections, raw: markdown };
    }, [markdown]);

    // Handle Template Rendering with fallback
    const renderTemplate = () => {
        switch (format) {
            case 'Gulf': return <CVGulf data={parsedData} />;
            case 'European': return <CVEuropean data={parsedData} />;
            case 'America': return <CVAmerica data={parsedData} />;
            case 'Plain':
            default:
                return <div className="html-preview large-scroll" dangerouslySetInnerHTML={{ __html: marked(markdown) }} />;
        }
    };

    return (
        <div className="cv-preview">
            {renderTemplate()}
        </div>
    );
};

export default CVPreview;
