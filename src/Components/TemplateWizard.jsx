import React, { useState } from "react";
import { LuX, LuChevronLeft, LuCheck } from "react-icons/lu";
import cvPreviewImg from "../assets/templates/cv_preview.png";
import "./professionalEditor.css";

const steps = [
    { id: "occupation", title: "What is your occupation?" },
    { id: "layout", title: "What layout suits you best?" },
    { id: "style", title: "What style do you prefer?" },
    { id: "photo", title: "Will you be adding a photo?" },
];

const occupations = [
    "Management & Executive",
    "Software & IT Services",
    "Business & Finance",
    "Retail & Sales",
    "Healthcare & Medical",
    "Education & Training",
    "Creative & Design",
    "Other / Student",
];

const layouts = [
    { id: "America", name: "American", description: "Standard US Style", img: cvPreviewImg },
    { id: "European", name: "European", description: "Modern EU Style", img: cvPreviewImg },
    { id: "Gulf", name: "Gulf Style", description: "Middle East Standard", img: cvPreviewImg },
    { id: "Professional", name: "Professional", description: "Classic Professional", img: cvPreviewImg },
    { id: "Creative", name: "Creative", description: "Modern & Colorful", img: cvPreviewImg },
    { id: "Minimalist", name: "Minimalist", description: "Clean & Simple", img: cvPreviewImg },
    { id: "Executive", name: "Executive", description: "Senior Management", img: cvPreviewImg },
    { id: "Academic", name: "Academic", description: "Research & Edu", img: cvPreviewImg },
    { id: "Tech", name: "Tech", description: "Developer Focused", img: cvPreviewImg },
    { id: "Service", name: "Service", description: "Functional Layout", img: cvPreviewImg },
];

const styles = [
    { id: "classic", name: "Simple & Classic", img: "/cv-classic.png" },
    { id: "modern", name: "Modern & Subtle", img: "/cv-modern.png" },
    { id: "bold", name: "Bold & Striking", img: "/cv-creative.png" },
];

export default function TemplateWizard({ isOpen, onClose, onCreate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({
        occupation: "",
        layout: "American",
        style: "classic",
        photo: "no",
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onCreate(selections);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateSelection = (key, value) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="occupation-list">
                        {occupations.map((occ) => (
                            <div
                                key={occ}
                                className={`occupation-item ${selections.occupation === occ ? "selected" : ""}`}
                                onClick={() => updateSelection("occupation", occ)}
                            >
                                {occ}
                                {selections.occupation === occ && <LuCheck />}
                            </div>
                        ))}
                    </div>
                );
            case 1:
                return (
                    <div className="selection-grid">
                        {layouts.map((layout) => (
                            <div
                                key={layout.id}
                                className={`selection-card large ${selections.layout === layout.id ? "selected" : ""}`}
                                onClick={() => updateSelection("layout", layout.id)}
                            >
                                <div className={`cv-thumbnail-container tmplt-mini-preview tmplt-${layout.id}`}>
                                    <div className="mini-sidebar">
                                        <div className="mini-text-block" style={{ padding: '0 4px' }}>
                                            <div className="mini-text-line" style={{ width: '80%' }}></div>
                                            <div className="mini-text-line" style={{ width: '60%' }}></div>
                                            <div className="mini-text-line" style={{ width: '70%' }}></div>
                                        </div>
                                    </div>
                                    <div className="mini-content">
                                        <div className="mini-header"></div>
                                        <div className="mini-body">
                                            <div className="mini-line med"></div>
                                            <div className="mini-text-block">
                                                <div className="mini-text-line"></div>
                                                <div className="mini-text-line" style={{ width: '90%' }}></div>
                                                <div className="mini-text-line" style={{ width: '95%' }}></div>
                                            </div>
                                            <div className="mini-line"></div>
                                            <div className="mini-text-block">
                                                <div className="mini-text-line" style={{ width: '85%' }}></div>
                                                <div className="mini-text-line" style={{ width: ' boards%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h4>{layout.name}</h4>
                                <p>{layout.description}</p>
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="selection-grid">
                        {styles.map((style) => (
                            <div
                                key={style.id}
                                className={`selection-card large ${selections.style === style.id ? "selected" : ""}`}
                                onClick={() => updateSelection("style", style.id)}
                            >
                                <div className="cv-thumbnail-container">
                                    <img src={style.img} alt={style.name} className="cv-thumbnail" />
                                </div>
                                <h4>{style.name}</h4>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className="selection-grid">
                        <div
                            className={`selection-card large ${selections.photo === "yes" ? "selected" : ""}`}
                            onClick={() => updateSelection("photo", "yes")}
                        >
                            <div className="photo-preview with-photo">
                                <div className="p-head"></div>
                                <div className="p-lines"><span></span><span></span><span></span></div>
                            </div>
                            <h4>With Photo</h4>
                        </div>
                        <div
                            className={`selection-card large ${selections.photo === "no" ? "selected" : ""}`}
                            onClick={() => updateSelection("photo", "no")}
                        >
                            <div className="photo-preview no-photo">
                                <div className="p-lines"><span></span><span></span><span></span></div>
                            </div>
                            <h4>Without Photo</h4>
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
                    <div className="progress-dots">
                        {steps.map((_, idx) => (
                            <div key={idx} className={`dot ${idx === currentStep ? "active" : ""}`} />
                        ))}
                    </div>
                    <button className="wizard-close-btn" onClick={onClose}>
                        <LuX size={24} />
                    </button>
                </div>

                <div className="wizard-modal-content">
                    <h2>{steps[currentStep].title}</h2>
                    <p>
                        {currentStep === 0 && "Choose your industry to get the best content recommendations."}
                        {currentStep === 1 && "Select the layout that best organizes your information."}
                        {currentStep === 2 && "Pick a style that matches your personal brand."}
                        {currentStep === 3 && "Some regions or industries prefer photos. What's your choice?"}
                    </p>
                    {renderStepContent()}
                </div>

                <div className="wizard-modal-footer">
                    {currentStep > 0 ? (
                        <button className="back-text-btn" onClick={handleBack}>
                            <LuChevronLeft size={20} /> Back
                        </button>
                    ) : (
                        <div />
                    )}
                    <button
                        className="continue-btn"
                        disabled={currentStep === 0 && !selections.occupation}
                        onClick={handleNext}
                    >
                        {currentStep === steps.length - 1 ? "Create CV" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}
