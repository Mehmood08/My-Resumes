import React, { useState } from "react";
import { LuX, LuChevronLeft, LuCheck } from "react-icons/lu";
import americaPreview from "../assets/templates/america_preview.png";
import europeanPreview from "../assets/templates/european_preview.png";
import gulfPreview from "../assets/templates/gulf_preview.png";
import professionalPreview from "../assets/templates/professional_preview.png";
import creativePreview from "../assets/templates/creative_preview.png";
import minimalistPreview from "../assets/templates/minimalist_preview.png";

const steps = [
    { id: "layout", title: "What layout suits you best?" },
    { id: "occupation", title: "What is your occupation?" },
    { id: "photo", title: "Will you be adding a photo?" },
];

const occupations = [
    "Software & IT Services",
    "Business & Finance",
    "Management & Executive",
    "HR & Recruitment",
    "Marketing & PR",
    "Sales & Business Development",
    "Engineering & Manufacturing",
    "Healthcare & Medical",
    "Education & Training",
    "Retail & Customer Service",
    "Creative & Design",
    "Logistics & Supply Chain",
    "Legal & Compliance",
    "Government & Public Sector",
    "Other / Student",
];

const layouts = [
    { id: "America", name: "American Standard", description: "Clean, traditional & results-focused.", img: americaPreview, type: 'standard' },
    { id: "European", name: "European Modern", description: "Sleek, organized & structured.", img: europeanPreview, type: 'sidebar' },
    { id: "Gulf", name: "Gulf Professional", description: "Refined & optimized for the Gulf region.", img: gulfPreview, type: 'standard' },
    { id: "Professional", name: "Classic Professional", description: "Timeless business-standard layout.", img: professionalPreview, type: 'standard' },
    { id: "Creative", name: "Creative Edge", description: "Bold design for modern industries.", img: creativePreview, type: 'standard' },
    { id: "Minimalist", name: "Clean Minimalist", description: "Simple, easy to read & distraction-free.", img: minimalistPreview, type: 'standard' },
    { id: "Executive", name: "Senior Executive", description: "Sophisticated for top-tier roles.", img: professionalPreview, type: 'standard', filter: 'filter-executive' },
    { id: "Academic", name: "Academic / Research", description: "Detailed structure for scholars.", img: professionalPreview, type: 'compact', filter: 'filter-academic' },
    { id: "Tech", name: "Technical Specialist", description: "Optimized for skills & tech stack.", img: creativePreview, type: 'standard', filter: 'filter-tech' },
    { id: "Service", name: "Customer Service", description: "Practical & experience-heavy.", img: professionalPreview, type: 'standard', filter: 'filter-service' },
];

const SkeletonOverlay = ({ type }) => {
    if (type === 'sidebar') {
        return (
            <div className="skeleton-overlay" style={{ padding: '15px' }}>
                <div className="skeleton-sidebar">
                    <div className="skel-side">
                        <div className="skel-sub" style={{ width: '80%', height: '18px', background: '#3b82f6' }}></div>
                        {[1, 2, 3].map(i => <div key={i} className="skel-line" style={{ height: '2px' }} />)}
                    </div>
                    <div className="skel-main">
                        <div className="skel-header" style={{ height: '10px' }}></div>
                        {[1, 2, 3, 4].map(i => <div key={i} className="skel-line" />)}
                    </div>
                </div>
            </div>
        );
    }
    if (type === 'compact') {
        return (
            <div className="skeleton-overlay" style={{ padding: '20px' }}>
                <div className="skel-centered-header">
                    <div className="skel-header" style={{ width: '50%', height: '12px' }}></div>
                    <div className="skel-sub" style={{ width: '30%' }}></div>
                </div>
                <div className="skel-section-block" style={{ marginTop: '10px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`skel-line ${i % 3 === 0 ? 'mid' : ''}`} />
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="skeleton-overlay" style={{ padding: '15px' }}>
            <div className="skel-header" style={{ height: '12px' }}></div>
            <div className="skel-sub"></div>
            <div className="skel-section-block" style={{ marginTop: '10px' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className={`skel-line ${i % 2 === 0 ? 'mid' : ''}`} />)}
            </div>
        </div>
    );
};

export default function TemplateWizard({ isOpen, onClose, onCreate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showGuidance, setShowGuidance] = useState(true);
    const [selections, setSelections] = useState({
        occupation: "",
        layout: "America",
        style: "classic",
        photo: "no",
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep === 0) setShowGuidance(false);
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onCreate(selections);
            onClose();
            // Reset for next time
            setTimeout(() => setCurrentStep(0), 300);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateSelection = (key, value) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
        // Auto-next for single-selection steps to feel faster (except Layout since it has many options)
        if (key === "occupation" || key === "photo") {
            // Give user a split second to see the selection checkmark
            setTimeout(() => handleNext(), 200);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="selection-grid large-scroll" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                        {layouts.map((layout) => (
                            <div
                                key={layout.id}
                                className={`selection-card large ${selections.layout === layout.id ? "selected" : ""}`}
                                onClick={() => updateSelection("layout", layout.id)}
                            >
                                <div className={`cv-thumbnail-container ${layout.filter || ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                                    <img
                                        src={layout.img}
                                        alt={layout.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'top',
                                            transition: 'transform 0.5s ease'
                                        }}
                                        className="cv-thumb-img"
                                    />
                                    {/* <SkeletonOverlay type={layout.type} /> */}
                                </div>
                                <h4>{layout.name}</h4>
                                <p style={{ fontSize: '11px' }}>{layout.description}</p>
                            </div>
                        ))}
                    </div>
                );
            case 1:
                return (
                    <div className="occupation-list large-scroll" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {occupations.map((occ) => (
                            <div
                                key={occ}
                                className={`occupation-item ${selections.occupation === occ ? "selected" : ""}`}
                                onClick={() => updateSelection("occupation", occ)}
                            >
                                {occ}
                                {selections.occupation === occ && <LuCheck className="check-icon" />}
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="selection-grid photo-step">
                        <div
                            className={`selection-card large ${selections.photo === "yes" ? "selected" : ""}`}
                            onClick={() => updateSelection("photo", "yes")}
                        >
                            <div className="photo-preview with-photo">
                                <div className="p-head"></div>
                                <div className="p-lines"><span></span><span></span><span></span></div>
                            </div>
                            <h4>With Photo</h4>
                            <p>Recommended for European.</p>
                        </div>
                        <div
                            className={`selection-card large ${selections.photo === "no" ? "selected" : ""}`}
                            onClick={() => updateSelection("photo", "no")}
                        >
                            <div className="photo-preview no-photo">
                                <div className="p-lines"><span></span><span></span><span></span></div>
                            </div>
                            <h4>No Photo</h4>
                            <p>Standard for  Tech roles.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="template-wizard-overlay">
            <div className="template-wizard-modal">
                <div className="wizard-modal-header">
                    <div className="progress-container">
                        <div className="progress-label">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</div>
                        <div className="progress-dots">
                            {steps.map((_, idx) => (
                                <div key={idx} className={`dot ${idx === currentStep ? "active" : ""} ${idx < currentStep ? "completed" : ""}`} />
                            ))}
                        </div>
                    </div>
                    <button className="wizard-close-btn" onClick={onClose}>
                        <LuX size={24} />
                    </button>
                </div>

                <div className="wizard-modal-content">
                    {currentStep === 0 && showGuidance && (
                        <div className="guidance-popup fadeIn">
                            <div className="guidance-content">
                                <span className="guidance-icon">💡</span>
                                <div className="guidance-text">
                                    <strong>Template Selection</strong>
                                    <p>Choose a base format. You can customize details later!</p>
                                </div>

                            </div>
                        </div>
                    )}

                    <div className="wizard-step-body animate-slide">
                        <h2>{steps[currentStep].title}</h2>
                        <div className="wizard-main-selection">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>

                <div className="wizard-modal-footer">
                    <button
                        className={`back-text-btn ${currentStep === 0 ? "hidden" : ""}`}
                        onClick={handleBack}
                    >
                        <LuChevronLeft size={20} /> Back
                    </button>

                    <div className="footer-actions">
                        <button
                            className="continue-btn premium"
                            disabled={currentStep === 1 && !selections.occupation}
                            onClick={handleNext}
                        >
                            {currentStep === steps.length - 1 ? "Finish & Create ✨" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
