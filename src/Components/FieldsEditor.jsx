import React, { useState, useEffect } from 'react';
import { parseMarkdownToSections, sectionsToMarkdown } from '../utils/cvParser';
import { LuPlus, LuTrash2 } from "react-icons/lu";

export default function FieldsEditor({ markdown, onChange }) {
    const [sections, setSections] = useState([]);

    useEffect(() => {
        setSections(parseMarkdownToSections(markdown));
    }, [markdown]);

    const handleSectionChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
        onChange(sectionsToMarkdown(newSections));
    };

    const addSection = () => {
        const newSections = [...sections, { title: 'New Section', content: '' }];
        setSections(newSections);
        onChange(sectionsToMarkdown(newSections));
    };

    const deleteSection = (index) => {
        if (sections[index].title === 'Header') return; // Cannot delete header
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
        onChange(sectionsToMarkdown(newSections));
    };

    return (
        <div className="fields-editor large-scroll">
            <div className="fields-header">
                <h3>Structured CV Sections</h3>
                <p>Manage your CV sections as individual blocks. Changes sync with Markdown.</p>
            </div>

            <div className="sections-list">
                {sections.map((section, idx) => (
                    <div key={idx} className={`section-card ${section.title === 'Header' ? 'header-card' : ''}`}>
                        <div className="section-card-header">
                            {section.title === 'Header' ? (
                                <span className="section-title-label">Primary Info / Contact</span>
                            ) : (
                                <input
                                    type="text"
                                    className="section-title-input"
                                    value={section.title}
                                    onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                                    placeholder="Section Title (e.g., Skills)"
                                />
                            )}

                            {section.title !== 'Header' && (
                                <button className="delete-section-btn" onClick={() => deleteSection(idx)} title="Delete Section">
                                    <LuTrash2 size={16} />
                                </button>
                            )}
                        </div>

                        <textarea
                            className="section-content-textarea"
                            value={section.content}
                            onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                            placeholder={section.title === 'Header' ? "# Name\nContact info..." : "Bullet points or description..."}
                        />
                    </div>
                ))}
            </div>

            <button className="add-field-btn" onClick={addSection}>
                <LuPlus size={18} />
                Add New Section
            </button>
        </div>
    );
}
