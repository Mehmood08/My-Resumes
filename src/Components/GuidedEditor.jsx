import React, { useState, useEffect } from 'react';

/**
 * A Zety-inspired Wizard Editor for CVs.
 * Breaks down the CV creation process into manageable steps.
 */
const GuidedEditor = ({ markdown, onChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [personalInfo, setPersonalInfo] = useState({
        firstName: '',
        lastName: '',
        profession: '',
        city: '',
        province: '',
        zip: '',
        phone: '',
        email: ''
    });

    const [sections, setSections] = useState([]);

    const steps = [
        { id: 'heading', label: 'Heading', emoji: '👤' },
        { id: 'summary', label: 'Summary', emoji: '📝' },
        { id: 'experience', label: 'Experience', emoji: '💼' },
        { id: 'education', label: 'Education', emoji: '🎓' },
        { id: 'skills', label: 'Skills', emoji: '⚡' },
        { id: 'languages', label: 'Languages', emoji: '🌐' },
        { id: 'finalize', label: 'Finalize', emoji: '✔️' }
    ];

    // Parse Markdown into state
    useEffect(() => {
        const lines = markdown.split('\n');
        const parsedSections = [];
        let currentSec = null;
        let foundHeading = false;

        lines.forEach(line => {
            if (line.startsWith('# ') && !foundHeading) {
                foundHeading = true;
                const titleLine = line.replace('# ', '').trim();
                const [namePart, professionPart] = titleLine.split('|').map(s => s.trim());
                const nameWords = (namePart || '').split(' ');

                setPersonalInfo(prev => ({
                    ...prev,
                    firstName: nameWords[0] || '',
                    lastName: nameWords.slice(1).join(' ') || '',
                    profession: professionPart || ''
                }));

                currentSec = 'contact';
            } else if (line.startsWith('## ')) {
                if (currentSec && typeof currentSec === 'object') parsedSections.push(currentSec);
                const title = line.replace('## ', '').trim();
                currentSec = {
                    title: title,
                    content: []
                };
            } else if (currentSec === 'contact') {
                // Parse contact line: "City, Province, Zip | Email | Phone"
                const parts = line.split('|').map(s => s.trim());
                if (parts.length >= 1) {
                    const localParts = parts[0].split(',').map(s => s.trim());
                    setPersonalInfo(prev => ({
                        ...prev,
                        city: localParts[0] || '',
                        province: localParts[1] || '',
                        zip: localParts[2] || '',
                        email: parts[1] || '',
                        phone: parts[2] || ''
                    }));
                }
                currentSec = null;
            } else if (currentSec && typeof currentSec === 'object') {
                currentSec.content.push(line);
            }
        });
        if (currentSec && typeof currentSec === 'object') parsedSections.push(currentSec);
        setSections(parsedSections);
    }, [markdown]);

    const updateMarkdown = (newPersonalInfo, newSections) => {
        let md = `# ${newPersonalInfo.firstName} ${newPersonalInfo.lastName} | ${newPersonalInfo.profession}\n`;
        md += `${newPersonalInfo.city}, ${newPersonalInfo.province}, ${newPersonalInfo.zip} | ${newPersonalInfo.email} | ${newPersonalInfo.phone}\n\n`;

        newSections.forEach(sec => {
            md += `## ${sec.title}\n${sec.content.join('\n').trim()}\n\n`;
        });

        onChange(md.trim());
    };

    const handleInfoChange = (field, value) => {
        const updated = { ...personalInfo, [field]: value };
        setPersonalInfo(updated);
        updateMarkdown(updated, sections);
    };

    const handleSectionChange = (index, value) => {
        const updated = [...sections];
        updated[index].content = value.split('\n');
        setSections(updated);
        updateMarkdown(personalInfo, updated);
    };

    const renderStepContent = () => {
        const step = steps[currentStep];

        if (step.id === 'heading') {
            return (
                <div className="wizard-form">
                    <div className="wizard-header">
                        <h2>What's the best way for employers to contact you?</h2>
                        <p>We suggest including an email and phone number.</p>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={personalInfo.firstName}
                                onChange={(e) => handleInfoChange('firstName', e.target.value)}
                                placeholder="e.g. MEER"
                            />
                        </div>
                        <div className="form-group">
                            <label>Surname</label>
                            <input
                                type="text"
                                value={personalInfo.lastName}
                                onChange={(e) => handleInfoChange('lastName', e.target.value)}
                                placeholder="e.g. MEHMOOD"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Profession</label>
                            <input
                                type="text"
                                value={personalInfo.profession}
                                onChange={(e) => handleInfoChange('profession', e.target.value)}
                                placeholder="e.g. Senior Sales Manager"
                            />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                value={personalInfo.city}
                                onChange={(e) => handleInfoChange('city', e.target.value)}
                                placeholder="e.g. Peshawar"
                            />
                        </div>
                        <div className="form-group">
                            <label>Zip Code</label>
                            <input
                                type="text"
                                value={personalInfo.zip}
                                onChange={(e) => handleInfoChange('zip', e.target.value)}
                                placeholder="e.g. 25000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Province</label>
                            <input
                                type="text"
                                value={personalInfo.province}
                                onChange={(e) => handleInfoChange('province', e.target.value)}
                                placeholder="e.g. Balochistan"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                value={personalInfo.phone}
                                onChange={(e) => handleInfoChange('phone', e.target.value)}
                                placeholder="e.g. 0345 1234567"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Email address</label>
                            <input
                                type="email"
                                value={personalInfo.email}
                                onChange={(e) => handleInfoChange('email', e.target.value)}
                                placeholder="e.g. example@gmail.com"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // Generic section step (Summary, Experience, etc.)
        const activeSection = sections.find(s => s.title.toLowerCase().includes(step.id));
        const sectionIndex = sections.findIndex(s => s.title.toLowerCase().includes(step.id));

        return (
            <div className="wizard-form">
                <div className="wizard-header">
                    <h2>{step.label}</h2>
                    <p>Tell us about your {step.label.toLowerCase()}.</p>
                </div>
                <textarea
                    className="wizard-textarea"
                    value={activeSection ? activeSection.content.join('\n') : ''}
                    onChange={(e) => {
                        if (sectionIndex !== -1) {
                            handleSectionChange(sectionIndex, e.target.value);
                        } else {
                            // Create new section if it doesn't exist
                            const updated = [...sections, { title: step.label.toUpperCase(), content: [e.target.value] }];
                            setSections(updated);
                            updateMarkdown(personalInfo, updated);
                        }
                    }}
                    placeholder={`Enter your ${step.label.toLowerCase()} here... (Markdown supported)`}
                />
            </div>
        );
    };

    const completionPercent = Math.round(((currentStep + 1) / steps.length) * 100);

    return (
        <div className="wizard-container">
            <aside className="wizard-sidebar">
                <div className="wizard-steps-list">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`wizard-step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(idx)}
                        >
                            <div className="step-number">{idx + 1}</div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    ))}
                </div>

                <div className="completeness-tracker">
                    <div className="completeness-label">RESUME COMPLETENESS:</div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${completionPercent}%` }}></div>
                    </div>
                    <div className="percent-text">{completionPercent}%</div>
                </div>

                <div className="wizard-sidebar-footer">
                    <a href="#">Terms And Conditions</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Accessibility</a>
                    <a href="#">Contact Us</a>
                </div>
            </aside>

            <main className="wizard-main">
                <button className="go-back-link" onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}>
                    ← Go Back
                </button>

                <div className="wizard-content-scroll">
                    {renderStepContent()}
                </div>

                <div className="wizard-actions">
                    {currentStep < steps.length - 1 && (
                        <button className="continue-btn" onClick={() => setCurrentStep(currentStep + 1)}>
                            Next: {steps[currentStep + 1].label} →
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GuidedEditor;
