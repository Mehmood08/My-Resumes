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
    { id: "America", name: "American", description: "Standard US Style", img: americaPreview, type: 'standard' },
    { id: "European", name: "European", description: "Modern EU Style", img: europeanPreview, type: 'sidebar' },
    { id: "Gulf", name: "Gulf", description: "Middle East Standard", img: gulfPreview, type: 'standard' },
    { id: "Professional", name: "Professional", description: "Classic Professional", img: professionalPreview, type: 'standard' },
    { id: "Creative", name: "Creative", description: "Modern & Colorful", img: creativePreview, type: 'standard' },
    { id: "Minimalist", name: "Minimalist", description: "Clean & Simple", img: minimalistPreview, type: 'standard' },
    { id: "Executive", name: "Executive", description: "Senior Management", img: professionalPreview, type: 'standard', filter: 'filter-executive' },
    { id: "Academic", name: "Academic", description: "Research & Edu", img: professionalPreview, type: 'compact', filter: 'filter-academic' },
    { id: "Tech", name: "Tech", description: "Developer Focused", img: creativePreview, type: 'standard', filter: 'filter-tech' },
    { id: "Service", name: "Service", description: "Functional Layout", img: professionalPreview, type: 'standard', filter: 'filter-service' },
];

const SkeletonOverlay = ({ type, name }) => {
    if (type === 'sidebar') {
        return (
            <div className="skeleton-overlay">
                <div className="skeleton-sidebar">
                    <div className="skel-side">
                        <div className="skel-sub" style={{ width: '80%', height: '22px', background: '#3b82f6', marginBottom: '10px' }}></div>
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skel-line" style={{ height: '3px' }} />)}
                        <div className="skel-sub" style={{ width: '60%', marginTop: '15px' }}></div>
                        {[1, 2, 3].map(i => <div key={i} className="skel-line" style={{ height: '3px' }} />)}
                    </div>
                    <div className="skel-main">
                        <div className="skel-header" style={{ width: '70%' }}></div>
                        <div className="skel-sub" style={{ width: '40%' }}></div>
                        <div className="skel-section-block" style={{ marginTop: '15px' }}>
                            <div className="skel-sub" style={{ width: '30%', height: '10px', background: '#f1f5f9' }}></div>
                            {[1, 2, 3, 4].map(i => <div key={i} className={`skel-line ${i % 2 === 0 ? 'mid' : ''}`} />)}
                        </div>
                        <div className="skel-section-block">
                            <div className="skel-sub" style={{ width: '30%', height: '10px', background: '#f1f5f9' }}></div>
                            {[1, 2, 3].map(i => <div key={i} className={`skel-line ${i % 3 === 0 ? 'short' : ''}`} />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (type === 'compact') {
        return (
            <div className="skeleton-overlay" style={{ padding: '30px' }}>
                <div className="skel-centered-header">
                    <div className="skel-header" style={{ width: '50%', height: '18px' }}></div>
                    <div className="skel-sub" style={{ width: '30%' }}></div>
                </div>
                <div className="skel-section-block" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className={`skel-line ${i % 4 === 0 ? 'short' : i % 3 === 0 ? 'mid' : ''}`} />
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="skeleton-overlay">
            <div className="skel-header"></div>
            <div className="skel-sub"></div>
            <div className="skel-section-block" style={{ marginTop: '20px' }}>
                <div className="skel-sub" style={{ width: '25%', height: '10px', background: '#cbd5e1', marginBottom: '5px' }}></div>
                {[1, 2, 3, 4].map(i => <div key={i} className={`skel-line ${i % 2 === 0 ? 'mid' : ''}`} />)}
            </div>
            <div className="skel-section-block">
                <div className="skel-sub" style={{ width: '25%', height: '10px', background: '#cbd5e1', marginBottom: '5px' }}></div>
                {[1, 2, 3, 4, 5].map(i => <div key={i} className={`skel-line ${i % 3 === 0 ? 'short' : ''}`} />)}
            </div>
        </div>
    );
};

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
                    <img
                        src={tmplt.img}
                        alt={tmplt.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.3
                        }}
                    />

                    <SkeletonOverlay type={tmplt.type} />

                    <div className="magnifier-hint">View Layout</div>

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
