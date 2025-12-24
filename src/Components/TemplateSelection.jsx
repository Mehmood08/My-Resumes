import React from 'react';
import { LuCheck } from "react-icons/lu";
import cvPreviewImg from "../assets/templates/cv_preview.png";
import CVPreview from "./CVPreview";

const templateList = [
    { id: "America", name: "American", description: "Standard US Style", img: cvPreviewImg },
    { id: "European", name: "European", description: "Modern EU Style", img: cvPreviewImg },
    { id: "Gulf", name: "Gulf", description: "Middle East Standard", img: cvPreviewImg },
    { id: "Professional", name: "Professional", description: "Classic Professional", img: cvPreviewImg },
    { id: "Creative", name: "Creative", description: "Modern & Colorful", img: cvPreviewImg },
    { id: "Minimalist", name: "Minimalist", description: "Clean & Simple", img: cvPreviewImg },
    { id: "Executive", name: "Executive", description: "Senior Management", img: cvPreviewImg },
    { id: "Academic", name: "Academic", description: "Research & Edu", img: cvPreviewImg },
    { id: "Tech", name: "Tech", description: "Developer Focused", img: cvPreviewImg },
    { id: "Service", name: "Service", description: "Functional Layout", img: cvPreviewImg },
];

export default function TemplateSelection({ currentFormat, onFormatChange, markdown, onSave }) {
    return (
        <div className="template-selection-container">
            {/* Left Pane: Template Selection List */}
            <div className="template-selection-left">
                <div className="selection-list-wrapper large-scroll">
                    <h3>Select CV Format</h3>
                    <p>Choose a format that best represents your professional profile.</p>

                    <div className="selection-list">
                        {templateList.map((tmplt) => (
                            <div
                                key={tmplt.id}
                                className={`selection-card-horizontal ${currentFormat === tmplt.id ? "selected" : ""}`}
                                onClick={() => onFormatChange(tmplt.id)}
                            >
                                <div className={`thumb-mini tmplt-mini-preview tmplt-${tmplt.id}`}>
                                    <div className="mini-sidebar"></div>
                                    <div className="mini-content">
                                        <div className="mini-header" style={{ height: '4px', marginBottom: '4px' }}></div>
                                        <div className="mini-body">
                                            <div className="mini-line med" style={{ height: '1px' }}></div>
                                            <div className="mini-text-block">
                                                <div className="mini-text-line" style={{ height: '0.5px' }}></div>
                                                <div className="mini-text-line" style={{ width: '80%', height: '0.5px' }}></div>
                                            </div>
                                            <div className="mini-line" style={{ height: '1px', marginTop: '2px' }}></div>
                                        </div>
                                    </div>
                                    {currentFormat === tmplt.id && (
                                        <div className="selection-badge-mini">
                                            <LuCheck size={12} />
                                        </div>
                                    )}
                                </div>
                                <div className="tmplt-details">
                                    <h4>{tmplt.name}</h4>
                                    <p>{tmplt.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="selection-footer">
                    <button className="footer-save-btn" onClick={onSave}>
                        Save & Continue
                    </button>
                </div>
            </div>

            {/* Right Pane: Live Preview */}
            <div className="template-selection-right">
                <div className="preview-label">Live Preview</div>
                <div className="preview-wrapper large-scroll">
                    <CVPreview markdown={markdown} format={currentFormat} />
                </div>
            </div>
        </div>
    );
}
