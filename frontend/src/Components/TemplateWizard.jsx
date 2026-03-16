import React, { useState } from "react";
import { LuX, LuChevronLeft, LuCheck } from "react-icons/lu";
import { LiveThumbnail } from "./SharedLiveThumbnail";

const steps = [
    { id: "education", title: "What is your education level?" },
    { id: "occupation", title: "What is your occupation?" },
    { id: "experience", title: "What is your experience level?" },
    { id: "layout", title: "What layout suits you best?" },
    { id: "photo", title: "Will you be adding a photo?" },
];

const educationLevels = [
    "High School Diploma",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD / Doctorate",
    "Certification / Vocational",
    "In Progress / Student"
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
    "Other / Professional"
];

const experienceLevels = [
    { id: "fresher", name: "Fresher / Entry Level", description: "Just starting out or changing careers." },
    { id: "junior", name: "Junior Level", description: "1-3 years of professional experience." },
    { id: "mid", name: "Mid Level", description: "3-7 years of professional experience." },
    { id: "senior", name: "Senior / Expert", description: "7+ years of professional experience." }
];

const layouts = [
    { id: "America", name: "American Standard", description: "Clean, traditional & results-focused.", type: 'standard' },
    { id: "European", name: "European Modern", description: "Sleek, organized & structured.", type: 'sidebar' },
    { id: "Gulf", name: "Gulf Professional", description: "Refined & optimized for the Gulf region.", type: 'standard' },
    { id: "Professional", name: "Classic Professional", description: "Timeless business-standard layout.", type: 'standard' },
    { id: "Creative", name: "Creative Edge", description: "Bold design for modern industries.", type: 'standard' },
    { id: "Minimalist", name: "Clean Minimalist", description: "Simple, easy to read & distraction-free.", type: 'standard' },
    { id: "Executive", name: "Senior Executive", description: "Sophisticated for top-tier roles.", type: 'standard', filter: 'filter-executive' },
    { id: "Academic", name: "Academic / Research", description: "Detailed structure for scholars.", type: 'compact', filter: 'filter-academic' },
    { id: "Tech", name: "Technical Specialist", description: "Optimized for skills & tech stack.", type: 'standard', filter: 'filter-tech' },
    { id: "Service", name: "Customer Service", description: "Practical & experience-heavy.", type: 'standard', filter: 'filter-service' },
];

export default function TemplateWizard({ isOpen, onClose, onCreate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showGuidance, setShowGuidance] = useState(true);
    const [selections, setSelections] = useState({
        education: "",
        occupation: "",
        experience: "",
        layout: "America",
        photo: "no"
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
            setTimeout(() => {
                setCurrentStep(0);
                setSelections({
                    education: "",
                    occupation: "",
                    experience: "",
                    layout: "America",
                    photo: "no"
                });
            }, 300);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateSelection = (key, value) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
        // Auto-advance for list-based selections
        if (["education", "occupation", "experience", "photo"].includes(key)) {
            setTimeout(() => handleNext(), 200);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Education
                return (
                    <div className="occupation-list large-scroll" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {educationLevels.map((edu) => (
                            <div
                                key={edu}
                                className={`occupation-item ${selections.education === edu ? "selected" : ""}`}
                                onClick={() => updateSelection("education", edu)}
                            >
                                {edu}
                                {selections.education === edu && <LuCheck className="check-icon" />}
                            </div>
                        ))}
                    </div>
                );
            case 1: // Occupation
                return (
                    <div className="occupation-list large-scroll" style={{ maxHeight: '420px', overflowY: 'auto' }}>
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
            case 2: // Experience
                return (
                    <div className="selection-grid experience-step">
                        {experienceLevels.map((exp) => (
                            <div
                                key={exp.id}
                                className={`selection-card large ${selections.experience === exp.id ? "selected" : ""}`}
                                onClick={() => updateSelection("experience", exp.id)}
                            >
                                <div className={`experience-icon-placeholder ${exp.id}`}>
                                    {exp.id === "fresher" && "🌱"}
                                    {exp.id === "junior" && "🚀"}
                                    {exp.id === "mid" && "💼"}
                                    {exp.id === "senior" && "👑"}
                                </div>
                                <h4>{exp.name}</h4>
                                <p style={{ fontSize: '11px' }}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                );
            case 3: // Layout
                return (
                    <div className="selection-grid large-scroll" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '10px' }}>
                        {layouts.map((layout) => (
                            <div
                                key={layout.id}
                                className={`selection-card large ${selections.layout === layout.id ? "selected" : ""}`}
                                onClick={() => updateSelection("layout", layout.id)}
                            >
                                <div className={`cv-thumbnail-container ${layout.filter || ''}`} style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                                    <LiveThumbnail
                                        formatId={layout.id}
                                        markdown="" /* Empty for generic samples */
                                    />
                                </div>
                                <h4>{layout.name}</h4>
                                <p style={{ fontSize: '11px' }}>{layout.description}</p>
                            </div>
                        ))}
                    </div>
                );
            case 4: // Photo
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
                            <p>Standard for Tech roles.</p>
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
                            onClick={handleNext}
                            disabled={
                                (currentStep === 0 && !selections.education) ||
                                (currentStep === 1 && !selections.occupation) ||
                                (currentStep === 2 && !selections.experience)
                            }
                        >
                            {currentStep === steps.length - 1 ? "Finish & Create" : "Continue"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
