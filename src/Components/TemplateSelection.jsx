import React, { useMemo } from 'react';
import { LuCheck } from "react-icons/lu";
import CVPreview from "./CVPreview";

import americaPreview from "../assets/templates/america_preview.png";
import europeanPreview from "../assets/templates/european_preview.png";
import gulfPreview from "../assets/templates/gulf_preview.png";
import professionalPreview from "../assets/templates/professional_preview.png";
import creativePreview from "../assets/templates/creative_preview.png";
import minimalistPreview from "../assets/templates/minimalist_preview.png";

const templateList = [
    { id: "America", name: "American", description: "Standard US Style", img: americaPreview },
    { id: "European", name: "European", description: "Modern EU Style", img: europeanPreview },
    { id: "Gulf", name: "Gulf", description: "Middle East Standard", img: gulfPreview },
    { id: "Professional", name: "Professional", description: "Classic Professional", img: professionalPreview },
    { id: "Creative", name: "Creative", description: "Modern & Colorful", img: creativePreview },
    { id: "Minimalist", name: "Minimalist", description: "Clean & Simple", img: minimalistPreview },
    { id: "Executive", name: "Executive", description: "Senior Management", img: professionalPreview },
    { id: "Academic", name: "Academic", description: "Research & Edu", img: professionalPreview },
    { id: "Tech", name: "Tech", description: "Developer Focused", img: creativePreview },
    { id: "Service", name: "Service", description: "Functional Layout", img: professionalPreview },
];

// Dummy data for the thumbnail to look populated and real
const dummyMarkdown = `
# John Doe | Software Engineer
New York, NY | email@example.com | 123-456-7890

## Experience
### Senior Developer | Tech Co
_2020 - Present_
Led a team of 5 developers.

## Education
### BS Computer Science | University of Tech
_2016 - 2020_

## Skills
- JavaScript
- React
- Node.js
`;

export default function TemplateSelection({ currentFormat, onFormatChange, markdown, onSave }) {

    // Memoize the thumbnail list to prevent expensive re-renders of 10x CVPreviews
    const renderedThumbnails = useMemo(() => {
        return templateList.map((tmplt) => (
            <div
                key={tmplt.id}
                className={`selection-card-item ${currentFormat === tmplt.id ? "selected" : ""}`}
                onClick={() => onFormatChange(tmplt.id)}
            >
                <div className="real-thumbnail-container" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={tmplt.img}
                        alt={tmplt.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                    />

                    {currentFormat === tmplt.id && (
                        <div className="selection-badge-overlay">
                            <LuCheck size={20} />
                        </div>
                    )}
                </div>

                <div className="tmplt-info">
                    <h4>{tmplt.name}</h4>
                    <p>{tmplt.description}</p>
                </div>
            </div>
        ));
    }, [currentFormat, onFormatChange]);

    return (
        <div className="template-selection-container">
            <div className="selection-split-layout">
                {/* Left Panel: Grid */}
                <div className="left-panel-grid large-scroll">
                    <div className="template-header">
                        <h3>Choose Template</h3>
                        <p>Select a design.</p>
                    </div>
                    <div className="template-grid-container">
                        {renderedThumbnails}
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="right-panel-preview">
                    <div className="preview-label">Live Preview</div>
                    <div className="preview-stage large-scroll">
                        <CVPreview markdown={markdown} format={currentFormat} />
                    </div>
                </div>
            </div>

            <div className="selection-footer-floating">
                <button className="footer-save-btn" onClick={onSave}>
                    Save & Continue
                </button>
            </div>
        </div>
    );
}
