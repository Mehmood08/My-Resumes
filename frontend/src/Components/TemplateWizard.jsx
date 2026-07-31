import React, { useState } from "react";
import { LuX, LuChevronLeft, LuCheck } from "react-icons/lu";
import { validateWizardAiFields, hasValidationErrors } from "../utils/cvValidation";
import { useAuth } from "../context/AuthContext";

const steps = [
    { id: "mode", title: "Choose Your Creation Mode" },
    { id: "education", title: "What is your education level?" },
    { id: "occupation", title: "What is your occupation?" },
    { id: "experience", title: "What is your experience level?" },
    { id: "photo", title: "Will you be adding a photo?" },
];

const aiSteps = [
    { id: "ai_contact", title: "Contact Information", type: "multi", fields: [
        { id: "fullName", placeholder: "Full Name (e.g., Mehmood Shah)", type: "text" },
        { id: "email", placeholder: "Email Address", type: "email" },
        { id: "phone", placeholder: "Phone Number", type: "tel" },
        { id: "city", placeholder: "Your Residing City", type: "text" },
        { id: "linkedin", placeholder: "LinkedIn Profile URL (Optional)", type: "text", optional: true },
        { id: "github", placeholder: "GitHub Profile URL (Optional)", type: "text", optional: true }
    ]},
    { id: "ai_education", title: "Your Qualification", type: "multi", fields: [
        { id: "ai_education", placeholder: "Degree | Highest Education | Your Basic Skill e.g., Driver", type: "text" },
        { id: "ai_school", placeholder: "Qualification Institute (e..g. University | Institute)", type: "text" },
        { id: "ai_school_city", placeholder: "Qualification City", type: "text" },
        { id: "ai_year", placeholder: "Qualification Completion Year", type: "text" }
    ]},
    { id: "ai_worker_jd", title: "Target Job Description", type: "single", fieldId: "ai_jd", fieldType: "textarea", placeholder: "Paste the full Job Description you are applying for..." },
    { id: "ai_experience", title: "Professional Experience", type: "multi", fields: [
        { id: "experienceYears", placeholder: "Total Years of Experience", type: "text" },
        { id: "ai_summary", placeholder: "Detailed summary of your past experiences, roles, and achievements...", type: "textarea" }
    ]},
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


export default function TemplateWizard({ isOpen, onClose, onCreate, initialMode = "select", initialStep = 0 }) {
    const { getUserId } = useAuth();
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [wizardMode, setWizardMode] = useState(initialMode); // 'select', 'manual', 'ai'

    // Reset or update state when wizard opens with specific props
    React.useEffect(() => {
        if (isOpen) {
            setWizardMode(initialMode);
            setCurrentStep(initialStep);
        }
    }, [isOpen, initialMode, initialStep]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState(null);
    const [isSuggestingSummary, setIsSuggestingSummary] = useState(false);
    const [errorType, setErrorType] = useState(null); // null, 'quota', 'error'
    const [fieldErrors, setFieldErrors] = useState({});
    const [selections, setSelections] = useState({
        education: "",
        occupation: "",
        experience: "",
        layout: "America",
        photo: "no",
        ai_education: "",
        ai_school: "",
        ai_school_city: "",
        ai_year: "",
        ai_summary: "",
        ai_jd: "",
        fullName: "",
        email: "",
        phone: "",
        city: "",
        linkedin: "",
        github: "",
        experienceYears: ""
    });

    if (!isOpen) return null;

    const handleNext = async () => {
        if (wizardMode === "select") {
            return;
        }

        if (wizardMode === "ai") {
            const errors = validateWizardAiFields(selections, currentStep);
            if (hasValidationErrors(errors)) {
                setFieldErrors(errors);
                return;
            }
            setFieldErrors({});

            if (currentStep < aiSteps.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                await handleAiGenerate();
            }
            return;
        }

        // Manual Mode logic
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onCreate(selections);
            handleClose();
        }
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        setErrorType(null);
        try {
            // Check if VITE_API_URL exists, otherwise use relative path which follows Vite proxy
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/resumes/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    education: selections.ai_education,
                    year: selections.ai_year,
                    school: selections.ai_school,
                    schoolCity: selections.ai_school_city,
                    summary: selections.ai_summary,
                    jd: selections.ai_jd,
                    fullName: selections.fullName,
                    email: selections.email,
                    phone: selections.phone,
                    city: selections.city,
                    linkedin: selections.linkedin,
                    github: selections.github,
                    experienceYears: selections.experienceYears,
                    userId: getUserId(),
                })
            });

            const data = await response.json();
            
            if (response.status === 429) {
                setErrorType('quota');
                setIsGenerating(false);
                return;
            }

            if (response.ok && data.markdown) {
                setIsGenerating(false);
                // Directly create CV — verification happens in GuidedEditor
                onCreate({ ...selections, aiGenerated: data.markdown, mode: 'ai' });
                handleClose();
            } else {
                setErrorType('error');
                setIsGenerating(false);
            }
        } catch (err) {
            console.error("AI Gen Error:", err);
            setErrorType('error');
            setIsGenerating(false);
        }
    };

    const handleSuggestExperience = async () => {
        if (!selections.ai_education) return;

        setIsSuggestingSummary(true);
        setErrorType(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/resumes/suggest-experience`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qualification: selections.ai_education,
                    years: selections.experienceYears,
                    institute: selections.ai_school,
                    jd: selections.ai_jd,
                    userId: getUserId(),
                })
            });

            const data = await response.json();
            
            if (response.status === 429) {
                setErrorType('quota');
            } else if (response.ok && data.suggestion) {
                setSelections(prev => ({ ...prev, ai_summary: data.suggestion }));
            }
        } catch (err) {
            console.error("Fetch Suggestion Error:", err);
            setErrorType('error');
        } finally {
            setIsSuggestingSummary(false);
        }
    };

    const handleImportFile = async (file) => {
        if (!file) return;

        const ext = file.name.toLowerCase();
        if (!ext.endsWith('.pdf') && !ext.endsWith('.doc') && !ext.endsWith('.docx')) {
            setImportError('Please upload a PDF, DOC, or DOCX file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setImportError('File is too large. Maximum size is 10 MB.');
            return;
        }

        setIsImporting(true);
        setImportError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${apiUrl}/api/resumes/import`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to import CV.');
            }

            if (data.markdown) {
                onCreate({
                    mode: 'import',
                    aiGenerated: data.markdown,
                    importedTitle: data.title || file.name.replace(/\.[^.]+$/, ''),
                });
                handleClose();
            } else {
                throw new Error('No content could be extracted from this file.');
            }
        } catch (err) {
            console.error('Import Error:', err);
            setImportError(err.message || 'Failed to import CV. Please try another file.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleUseFallback = () => {
        const fallbackContent = generateFallbackMarkdown();
        setErrorType(null);
        onCreate({ ...selections, aiGenerated: fallbackContent, mode: 'ai' });
        handleClose();
    };

    const generateFallbackMarkdown = () => {
        const contactLine = [
            selections.email || '[Email]',
            selections.phone || '[Phone]',
            selections.city || '[City]',
            selections.linkedin || null,
            selections.github || null
        ].filter(Boolean).join(' | ');

        return `# ${selections.fullName || '[Your Name]'} | Professional
${contactLine}

## SUMMARY
Highly motivated professional with ${selections.experienceYears || 'proven'} experience. Targeted towards achieving excellence in roles matching the job requirements.

## EXPERIENCE
${selections.ai_summary || "Professional experience details regarding recent roles and achievements."}

## EDUCATION
- ${selections.ai_education} | ${selections.ai_school || '[University Name]'}, ${selections.ai_school_city || '[City]'} | Class of ${selections.ai_year}

## SKILLS
- [Skill 1]
- [Skill 2]
- [Skill 3]`;
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setCurrentStep(0);
            setWizardMode("select");
            setIsSuggestingSummary(false);
            setIsImporting(false);
            setImportError(null);
            setFieldErrors({});
            setSelections({
                education: "",
                occupation: "",
                experience: "",
                layout: "America",
                photo: "no",
                ai_education: "",
                ai_school: "",
                ai_school_city: "",
                ai_year: "",
                ai_summary: "",
                ai_jd: "",
                fullName: "",
                email: "",
                phone: "",
                city: "",
                linkedin: "",
                github: "",
                experienceYears: ""
            });
        }, 300);
    };

    const handleBack = () => {
        setFieldErrors({});
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            setWizardMode("select");
        }
    };

    const updateSelection = (key, value) => {
        setSelections((prev) => ({ ...prev, [key]: value }));
        if (fieldErrors[key]) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
        // Auto-advance for list-based selections
        if (["education", "occupation", "experience", "photo"].includes(key)) {
            setTimeout(() => handleNext(), 200);
        }
    };

    const renderStepContent = () => {
        if (isGenerating || isImporting) {
            return (
                <div className="ai-loading-container">
                    <div className="ai-anim-box">
                        <div className="sparkle s1">✨</div>
                        <div className="sparkle s2">🪄</div>
                        <div className="sparkle s3">💎</div>
                    </div>
                    <h3>{isImporting ? 'Importing your CV...' : 'Gemini is Thinking...'}</h3>
                    <p>{isImporting
                        ? 'Extracting content and mapping it to your CV sections.'
                        : 'Analyzing JD and your verified profile to create a master-class CV.'}</p>
                </div>
            );
        }

        if (importError) {
            return (
                <div className="ai-error-fallback">
                    <div className="error-icon">⚠️</div>
                    <h3>Import failed</h3>
                    <p>{importError}</p>
                    <div className="fallback-options">
                        <button className="fallback-btn secondary" onClick={() => setImportError(null)}>Try again</button>
                        <button className="fallback-btn primary" onClick={() => { setImportError(null); setWizardMode('select'); }}>Back to options</button>
                    </div>
                </div>
            );
        }

        if (errorType) {
            return (
                <div className="ai-error-fallback">
                    <div className="error-icon">{errorType === 'quota' ? "⏳" : "⚠️"}</div>
                    <h3>{errorType === 'quota' ? "AI is catching its breath..." : "Something went wrong"}</h3>
                    <p>
                        {errorType === 'quota' 
                          ? "We've reached the free AI limit for this minute. You can wait a bit, or use our Smart Template to continue right now!"
                          : "We couldn't generate the AI tailoring at this moment."}
                    </p>
                    <div className="fallback-options">
                        <button className="fallback-btn secondary" onClick={() => setErrorType(null)}>Retry AI ✨</button>
                        <button className="fallback-btn primary" onClick={handleUseFallback}>Use Smart Template 📄</button>
                    </div>
                </div>
            )
        }

        if (wizardMode === "select") {
            return (
                <div className="mode-selection-grid">
                    <div className="mode-card ai-premium" onClick={() => { setWizardMode("ai"); setCurrentStep(0); }}>
                        <div className="mode-icon">✨</div>
                        <div className="mode-badge">RECOMMENDED</div>
                        <h4>Build with AI</h4>
                        <p>Generate a 100% tailored CV for a specific job in seconds.</p>
                    </div>
                    <div className="mode-card manual-standard" onClick={() => { setWizardMode("manual"); setCurrentStep(1); }}>
                        <div className="mode-icon">✍️</div>
                        <h4>Manual Setup</h4>
                        <p>Answer a few questions, then fill in your details yourself.</p>
                    </div>
                    <div className="mode-card import-option" onClick={() => { setWizardMode("import"); setCurrentStep(0); }}>
                        <div className="mode-icon">📂</div>
                        <h4>Import CV</h4>
                        <p>Upload an existing PDF or Word document and we'll map it to your sections.</p>
                    </div>
                </div>
            );
        }

        if (wizardMode === "import") {
            return (
                <div className="import-step">
                    <div className="import-dropzone">
                        <div className="import-icon">📄</div>
                        <h4>Upload your CV</h4>
                        <p>Supported formats: PDF, DOC, DOCX (max 10 MB). Content is mapped to sections with Gemini.</p>
                        <label className="import-file-btn">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => handleImportFile(e.target.files?.[0])}
                                hidden
                            />
                            Choose file
                        </label>
                    </div>
                    <p className="import-hint">Gemini will map your content into CV sections and save automatically.</p>
                </div>
            );
        }

        if (wizardMode === "ai") {
            const step = aiSteps[currentStep];
            if (step.type === "multi") {
                return (
                    <div className="ai-input-step multi-fields">
                        {step.fields.map(f => (
                            f.type === "textarea" ? (
                                <div key={f.id} className="textarea-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {f.id === "ai_summary" && (
                                        <button 
                                            className="score-btn" 
                                            onClick={handleSuggestExperience} 
                                            disabled={isSuggestingSummary || !selections.ai_education}
                                            style={{ alignSelf: 'flex-start', padding: '8px 12px', fontSize: '13px', opacity: (isSuggestingSummary || !selections.ai_education) ? 0.6 : 1 }}
                                            type="button"
                                        >
                                            {isSuggestingSummary ? "Suggesting..." : "✨ Suggest Experience with AI"}
                                        </button>
                                    )}
                                    <textarea
                                        className={`wizard-textarea ${fieldErrors[f.id] ? "input-error" : ""}`}
                                        placeholder={f.placeholder}
                                        value={selections[f.id]}
                                        onChange={(e) => updateSelection(f.id, e.target.value)}
                                    />
                                    {fieldErrors[f.id] && (
                                        <span className="field-error-msg">{fieldErrors[f.id]}</span>
                                    )}
                                </div>
                            ) : (
                                <div key={f.id} className="wizard-field-group">
                                    <input
                                        type={f.type}
                                        className={`wizard-input ${fieldErrors[f.id] ? "input-error" : ""}`}
                                        placeholder={f.placeholder}
                                        value={selections[f.id]}
                                        onChange={(e) => updateSelection(f.id, e.target.value)}
                                    />
                                    {fieldErrors[f.id] && (
                                        <span className="field-error-msg">{fieldErrors[f.id]}</span>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                );
            }
            return (
                <div className="ai-input-step">
                    {step.fieldType === "textarea" ? (
                        <>
                            <textarea
                                className={`wizard-textarea ${fieldErrors[step.fieldId] ? "input-error" : ""}`}
                                placeholder={step.placeholder}
                                value={selections[step.fieldId]}
                                onChange={(e) => updateSelection(step.fieldId, e.target.value)}
                                autoFocus
                            />
                            {fieldErrors[step.fieldId] && (
                                <span className="field-error-msg">{fieldErrors[step.fieldId]}</span>
                            )}
                        </>
                    ) : (
                        <>
                            <input
                                type={step.fieldType}
                                className={`wizard-input ${fieldErrors[step.fieldId] ? "input-error" : ""}`}
                                placeholder={step.placeholder}
                                value={selections[step.fieldId]}
                                onChange={(e) => updateSelection(step.fieldId, e.target.value)}
                                autoFocus
                            />
                            {fieldErrors[step.fieldId] && (
                                <span className="field-error-msg">{fieldErrors[step.fieldId]}</span>
                            )}
                        </>
                    )}
                </div>
            );
        }

        switch (currentStep) {
            case 1: // Education
                return (
                    <div className="selection-list-modern large-scroll">
                        {educationLevels.map((edu) => (
                            <div
                                key={edu}
                                className={`selection-card-mini ${selections.education === edu ? "selected" : ""}`}
                                onClick={() => updateSelection("education", edu)}
                            >
                                <span className="item-text">{edu}</span>
                                <div className="indicator-circle">
                                    {selections.education === edu && <LuCheck className="check-icon" />}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 2: // Occupation
                return (
                    <div className="selection-list-modern large-scroll">
                        {occupations.map((occ) => (
                            <div
                                key={occ}
                                className={`selection-card-mini ${selections.occupation === occ ? "selected" : ""}`}
                                onClick={() => updateSelection("occupation", occ)}
                            >
                                <span className="item-text">{occ}</span>
                                <div className="indicator-circle">
                                    {selections.occupation === occ && <LuCheck className="check-icon" />}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 3: // Experience
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
                        <div className="progress-label">
                            {isGenerating ? "Generation in progress..." : isImporting ? "Import in progress..." : (
                                wizardMode === "select" ? "Selection Mode" : 
                                (wizardMode === "ai" ? `AI Step ${currentStep + 1} of ${aiSteps.length}` :
                                 wizardMode === "import" ? "Import CV" :
                                 `Manual Step ${currentStep} of ${steps.length - 1}`)
                            )}
                        </div>
                        <div className="progress-dots">
                            {(wizardMode === "ai" ? aiSteps : wizardMode === "import" ? [{ id: "import" }] : steps).map((_, idx) => (
                                <div key={idx} className={`dot ${idx === currentStep ? "active" : ""} ${idx < currentStep ? "completed" : ""}`} />
                            ))}
                        </div>
                    </div>
                    <button className="wizard-close-btn" onClick={handleClose}>
                        <LuX size={24} />
                    </button>
                </div>

                <div className="wizard-modal-content">
                    <div className="wizard-step-body animate-slide">
                        <h2>
                            {isGenerating ? "Gemini is thinking..." : isImporting ? "Importing your CV..." : (
                                wizardMode === "select" ? "How would you like to build your CV?" : 
                                (wizardMode === "ai" ? aiSteps[currentStep].title :
                                 wizardMode === "import" ? "Import from PDF or Word" :
                                 steps[currentStep].title)
                            )}
                        </h2>
                        <div className="wizard-main-selection">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>

                <div className="wizard-modal-footer">
                    <button
                        className={`back-text-btn ${wizardMode === "select" || isGenerating || isImporting ? "hidden" : ""}`}
                        onClick={handleBack}
                    >
                        <LuChevronLeft size={20} /> Back
                    </button>

                    <div className="footer-actions">
                        {wizardMode !== "select" && !isGenerating && !isImporting && wizardMode !== "import" && (
                            <button
                                className="continue-btn premium"
                                onClick={handleNext}
                                disabled={
                                    (wizardMode === "manual" && currentStep === 1 && !selections.education) ||
                                    (wizardMode === "manual" && currentStep === 2 && !selections.occupation) ||
                                    (wizardMode === "manual" && currentStep === 3 && !selections.experience)
                                }
                            >
                                {wizardMode === "ai" && currentStep === aiSteps.length - 1 ? "Confirm & Generate CV ✨" : 
                                 (wizardMode === "manual" && currentStep === steps.length - 1 ? "Finish & Create" : "Continue")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
