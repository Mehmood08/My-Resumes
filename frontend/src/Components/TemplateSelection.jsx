import React, { useMemo } from 'react';
import { LuCheck } from "react-icons/lu";
import CVPreview from "./CVPreview";
import { LiveThumbnail, DEMO_MARKDOWN } from './SharedLiveThumbnail';

const templateList = [
    { id: "America", name: "American", description: "Standard US Style", type: 'standard' },
    { id: "European", name: "European", description: "Modern EU Style", type: 'sidebar' },
    { id: "Gulf", name: "Gulf", description: "Middle East Standard", type: 'standard' },
    { id: "Professional", name: "Professional", description: "Classic Professional", type: 'standard' },
    { id: "Creative", name: "Creative", description: "Modern & Colorful", type: 'standard' },
    { id: "Minimalist", name: "Minimalist", description: "Clean & Simple", type: 'standard' },
    { id: "Executive", name: "Executive", description: "Senior Management", type: 'standard', filter: 'filter-executive' },
    { id: "Academic", name: "Academic", description: "Research & Edu", type: 'compact', filter: 'filter-academic' },
    { id: "Tech", name: "Tech", description: "Developer Focused", type: 'standard', filter: 'filter-tech' },
    { id: "Service", name: "Service", description: "Functional Layout", type: 'standard', filter: 'filter-service' },
];

export default function TemplateSelection({ currentFormat, onFormatChange, markdown, onSave }) {

    // Memoize the thumbnail list to prevent expensive re-renders
    const renderedThumbnails = useMemo(() => {
        return templateList.map((tmplt) => (
            <div
                key={tmplt.id}
                className={`selection-card-item ${currentFormat === tmplt.id ? "selected" : ""}`}
                onClick={() => onFormatChange(tmplt.id)}
            >
                <div className={`real-thumbnail-container ${tmplt.filter || ''}`}>
                    <LiveThumbnail
                        markdown={markdown}
                        formatId={tmplt.id}
                    />

                    <div className="magnifier-hint">Select {tmplt.name}</div>

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
    }, [currentFormat, onFormatChange, markdown]);

    // Use demo markdown for preview if current is empty or just a header
    const effectiveMarkdown = useMemo(() => {
        if (!markdown || markdown.length < 50 || markdown === "# [Name] | [Title]\n[Email] | [Phone]\n\n## SUMMARY\n\n") {
            return DEMO_MARKDOWN;
        }
        return markdown;
    }, [markdown]);

    return (
        <div className="template-selection-container">
            <div className="selection-split-layout">
                {/* Left Panel: Grid  can u tell me that like i want to tell u something in the mind and the */}
                <div className="left-panel-grid large-scroll">
                    <div className="template-header">
                        <h3>Choose Template</h3>
                        <p>Select a design to see how your CV looks.</p>
                    </div>
                    <div className="template-grid-container">
                        {renderedThumbnails}
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="right-panel-preview">
                    <div className="preview-label">Live Preview</div>
                    <div className="preview-stage large-scroll">
                        <CVPreview markdown={effectiveMarkdown} format={currentFormat} />
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
