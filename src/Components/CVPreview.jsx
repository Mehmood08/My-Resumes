import React, { useMemo } from 'react';
import { marked } from 'marked';
import "./cvPreview.css";

// Templates
import CVGulf from './Templates/CVGulf';
import CVEuropean from './Templates/CVEuropean';
import CVAmerica from './Templates/CVAmerica';
import CVProfessional from './Templates/CVProfessional';
import CVCreative from './Templates/CVCreative';
import CVMinimalist from './Templates/CVMinimalist';
import CVExecutive from './Templates/CVExecutive';
import CVAcademic from './Templates/CVAcademic';
import CVTech from './Templates/CVTech';
import CVService from './Templates/CVService';

const CVPreview = ({ markdown, format }) => {
    const parsedData = useMemo(() => {
        if (!markdown) return { name: "", email: "", phone: "", profession: "", city: "", province: "", zip: "", link1: "", link2: "", sections: [], raw: "" };

        const lines = markdown.split('\n');
        let name = "";
        let profession = "";
        let email = "";
        let phone = "";
        let city = "";
        let province = "";
        let zip = "";
        let link1 = "";
        let link2 = "";
        const sections = [];
        let currentSection = null;
        let isHeaderParsing = true;

        for (let line of lines) {
            const trimmed = line.trim();

            if (line.startsWith('# ') && isHeaderParsing) {
                const titleLine = line.replace('# ', '').trim();
                const [namePart, professionPart] = titleLine.split('|').map(s => s.trim());
                name = namePart || "";
                profession = professionPart || "";
                continue;
            }

            if (isHeaderParsing && line.includes('|')) {
                const parts = line.split('|').map(s => s.trim());

                // Check if this line contains links (starts with http or www)
                if (parts.length >= 2 && (parts[0].includes('http') || parts[0].includes('www'))) {
                    link1 = parts[0] || "";
                    link2 = parts[1] || "";
                    continue;
                }

                // Otherwise, it's the contact info line
                if (parts.length >= 1) {
                    const locParts = parts[0].split(',').map(s => s.trim());
                    city = locParts[0] || "";
                    province = locParts[1] || "";
                    zip = locParts[2] || "";
                    email = parts[1] || "";
                    phone = parts[2] || "";
                }
                // Don't set isHeaderParsing = false here, continue parsing for links
                continue;
            }

            if (line.startsWith('## ')) {
                isHeaderParsing = false;
                if (currentSection) {
                    sections.push({ ...currentSection, content: currentSection.content.join('\n').trim() });
                }
                currentSection = { title: line.replace('## ', '').trim(), content: [] };
            } else if (currentSection) {
                currentSection.content.push(line);
            }
        }
        if (currentSection) {
            sections.push({ ...currentSection, content: currentSection.content.join('\n').trim() });
        }

        return { name, profession, email, phone, city, province, zip, link1, link2, sections, raw: markdown };
    }, [markdown]);

    // Handle Template Rendering with fallback
    const renderTemplate = () => {
        switch (format) {
            case 'Gulf': return <CVGulf data={parsedData} />;
            case 'European': return <CVEuropean data={parsedData} />;
            case 'America': return <CVAmerica data={parsedData} />;
            case 'Professional': return <CVProfessional data={parsedData} />;
            case 'Creative': return <CVCreative data={parsedData} />;
            case 'Minimalist': return <CVMinimalist data={parsedData} />;
            case 'Executive': return <CVExecutive data={parsedData} />;
            case 'Academic': return <CVAcademic data={parsedData} />;
            case 'Tech': return <CVTech data={parsedData} />;
            case 'Service': return <CVService data={parsedData} />;
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
