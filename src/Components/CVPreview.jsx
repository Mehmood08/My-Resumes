import React, { useMemo } from 'react';
import { marked } from 'marked';
import "./cvPreview.css";


const CVPreview = ({ markdown, format }) => {
    const parsedData = useMemo(() => {
        // Basic Parsing Logic
        const lines = markdown.split('\n');
        let name = "";
        let email = "";
        let phone = "";
        let sections = [];
        let currentSection = null;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Extract Name (First H1)
            if (line.startsWith('# ') && !name) {
                name = line.replace('# ', '').trim();
                continue;
            }

            // Extract Contact Info (Simple Regex)
            const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch && !email) {
                email = emailMatch[0];
            }

            const phoneMatch = line.match(/(\+?\d[\d -]{8,}\d)/);
            if (phoneMatch && !phone) {
                // crude check to avoid matching dates or just numbers, usually phone is early on
                if (line.length < 50) phone = phoneMatch[0];
            }

            // Sections (H2)
            if (line.startsWith('## ')) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: line.replace('## ', '').trim(),
                    content: []
                };
                continue;
            }

            // Content for sections
            if (currentSection) {
                currentSection.content.push(line);
            }
        }

        if (currentSection) {
            sections.push(currentSection);
        }

        return { name, email, phone, sections, raw: markdown };
    }, [markdown]);

    const renderSectionContent = (contentLines) => {
        // Helper to render markdown content within a section
        const text = contentLines.join('\n');
        return <div dangerouslySetInnerHTML={{ __html: marked(text) }} />;
    };

    if (format === 'Gulf') {
        return (
            <div className="cv-preview">
                <div className="cv-gulf">
                    <header className="cv-header">
                        <h1>{parsedData.name || "Your Name"}</h1>
                        <div className="contact-info">
                            {parsedData.email && <span>{parsedData.email}</span>}
                            {parsedData.phone && <span>{parsedData.phone}</span>}
                        </div>
                    </header>
                    <div className="cv-body">
                        {parsedData.sections.map((sec, idx) => (
                            <section key={idx} className="cv-section">
                                <h2 className="section-title">{sec.title}</h2>
                                <div className="section-content">
                                    {renderSectionContent(sec.content)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (format === 'European') {
        return (
            <div className="cv-preview">
                <div className="cv-european">
                    <aside className="cv-sidebar">
                        <div className="user-initials">
                            {parsedData.name ? parsedData.name.substring(0, 2).toUpperCase() : "ME"}
                        </div>
                        <div className="sidebar-contact">
                            <h3>Contact</h3>
                            {parsedData.email && <p>{parsedData.email}</p>}
                            {parsedData.phone && <p>{parsedData.phone}</p>}
                        </div>
                    </aside>
                    <main className="cv-main">
                        <header className="main-header">
                            <h1>{parsedData.name || "Your Name"}</h1>
                            <hr />
                        </header>
                        {parsedData.sections.map((sec, idx) => (
                            <section key={idx} className="cv-section">
                                <h2 className="section-title">{sec.title}</h2>
                                <div className="section-content">
                                    {renderSectionContent(sec.content)}
                                </div>
                            </section>
                        ))}
                    </main>
                </div>
            </div>
        );
    }

    // Default / Raw Preview
    return (
        <div className="html-preview large-scroll" dangerouslySetInnerHTML={{ __html: marked(markdown) }} />
    );
};

export default CVPreview;
