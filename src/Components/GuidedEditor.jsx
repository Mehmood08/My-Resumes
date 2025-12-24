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
        email: '',
        link1: '',
        link2: ''
    });

    const [sections, setSections] = useState([]);

    const steps = [
        { id: 'heading', label: 'Heading', emoji: '👤' },
        { id: 'summary', label: 'Summary', emoji: '📝' },
        { id: 'experience', label: 'Experience', emoji: '💼' },
        { id: 'projects', label: 'Projects', emoji: '🚀' },
        { id: 'education', label: 'Education', emoji: '🎓' },
        { id: 'skills', label: 'Skills', emoji: '⚡' },
        { id: 'languages', label: 'Languages', emoji: '🌐' },
        { id: 'certifications', label: 'Certifications', emoji: '🏆' }
    ];

    // Parse Markdown into state
    useEffect(() => {
        if (!markdown) return;
        const lines = markdown.split('\n');
        const parsedSections = [];
        let currentSec = null;
        let isParsingHeader = true;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed && isParsingHeader) return;

            if (line.startsWith('# ') && isParsingHeader) {
                const titleLine = line.replace('# ', '').trim();
                const [namePart, professionPart] = titleLine.split('|').map(s => s.trim());
                if (namePart) {
                    const nameWords = namePart.split(' ');
                    setPersonalInfo(prev => ({
                        ...prev,
                        firstName: nameWords[0] || '',
                        lastName: nameWords.slice(1).join(' ') || '',
                        profession: professionPart || ''
                    }));
                }
            } else if (isParsingHeader && line.includes('|') && (line.includes('@') || line.match(/\d/) || line.includes('http') || line.includes('www'))) {
                // Header contact line or links line
                const parts = line.split('|').map(s => s.trim());

                // Check if this is a links line (contains http or www)
                if (parts.length >= 2 && (parts[0].includes('http') || parts[0].includes('www'))) {
                    setPersonalInfo(prev => ({
                        ...prev,
                        link1: parts[0] || '',
                        link2: parts[1] || ''
                    }));
                    // Don't set isParsingHeader = false here, in case there are more header lines
                } else if (parts.length >= 1) {
                    // Contact info line: "City, Province, Zip | Email | Phone"
                    const locParts = parts[0].split(',').map(s => s.trim());
                    setPersonalInfo(prev => ({
                        ...prev,
                        city: locParts[0] || '',
                        province: locParts[1] || '',
                        zip: locParts[2] || '',
                        email: parts[1] || '',
                        phone: parts[2] || ''
                    }));
                    // Don't set isParsingHeader = false here, continue parsing for links
                }
            } else if (line.startsWith('## ')) {
                isParsingHeader = false;
                if (currentSec) parsedSections.push(currentSec);
                const title = line.replace('## ', '').trim();
                currentSec = { title, content: [] };
            } else if (currentSec) {
                currentSec.content.push(line);
            }
        });
        if (currentSec) parsedSections.push(currentSec);

        // Final cleanup for sections: join lines and trim
        const finalSections = parsedSections.map(s => ({
            ...s,
            content: s.content.join('\n').trim()
        }));
        setSections(finalSections);
    }, [markdown]);

    const updateMarkdown = (newPersonalInfo, newSections) => {
        let md = `# ${newPersonalInfo.firstName} ${newPersonalInfo.lastName} | ${newPersonalInfo.profession}\n`;
        md += `${newPersonalInfo.city}, ${newPersonalInfo.province}, ${newPersonalInfo.zip} | ${newPersonalInfo.email} | ${newPersonalInfo.phone}\n`;

        // Add social links if they exist
        if (newPersonalInfo.link1 || newPersonalInfo.link2) {
            md += `${newPersonalInfo.link1 || ''} | ${newPersonalInfo.link2 || ''}\n`;
        }
        md += '\n';

        newSections.forEach(sec => {
            md += `## ${sec.title}\n${sec.content}\n\n`;
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
        updated[index].content = value;
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
                                placeholder="e.g Mehmood"
                            />
                        </div>
                        <div className="form-group">
                            <label>Surname</label>
                            <input
                                type="text"
                                value={personalInfo.lastName}
                                onChange={(e) => handleInfoChange('lastName', e.target.value)}
                                placeholder="e.g. Shah"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Profession</label>
                            <input
                                type="text"
                                value={personalInfo.profession}
                                onChange={(e) => handleInfoChange('profession', e.target.value)}
                                placeholder="e.g. Software Engineering"
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
                                placeholder="e.g. 23200"
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
                            <label>Email </label>
                            <input
                                type="email"
                                value={personalInfo.email}
                                onChange={(e) => handleInfoChange('email', e.target.value)}
                                placeholder="e.g example@gmail.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn URL (Optional)</label>
                            <input
                                type="url"
                                value={personalInfo.link1}
                                onChange={(e) => handleInfoChange('link1', e.target.value)}
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                        </div>
                        <div className="form-group">
                            <label>GitHub/Portfolio URL (Optional)</label>
                            <input
                                type="url"
                                value={personalInfo.link2}
                                onChange={(e) => handleInfoChange('link2', e.target.value)}
                                placeholder="https://github.com/yourusername"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // Generic section step (Summary, Experience, etc.)
        const matchTitle = step.id === 'summary' ? 'PROFESSIONAL SUMMARY' :
            step.id === 'experience' ? 'EXPERIENCE' :
                step.id === 'projects' ? 'PROJECTS' :
                    step.id === 'education' ? 'EDUCATION' :
                        step.id === 'skills' ? 'SKILLS' :
                            step.id === 'languages' ? 'LANGUAGES' :
                                step.id === 'certifications' ? 'CERTIFICATIONS' : step.label.toUpperCase();

        const sectionIndex = sections.findIndex(s => s.title.toUpperCase().includes(step.id.toUpperCase()));
        const activeSection = sectionIndex !== -1 ? sections[sectionIndex] : null;

        return (
            <div className="wizard-form">
                <div className="wizard-header">
                    <h2>{step.label}</h2>
                    <p>Tell us about your {step.label.toLowerCase()}.</p>
                </div>
                <textarea
                    className="wizard-textarea"
                    value={activeSection ? activeSection.content : ''}
                    onChange={(e) => {
                        if (sectionIndex !== -1) {
                            handleSectionChange(sectionIndex, e.target.value);
                        } else {
                            // Create new section if it doesn't exist
                            const updated = [...sections, { title: matchTitle, content: e.target.value }];
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
                <div className="wizard-content-scroll">
                    {renderStepContent()}
                </div>

                <div className="wizard-actions">
                    <button
                        className={`go-back-link-footer ${currentStep === 0 ? 'hidden' : ''}`}
                        onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                    >
                        ← Go Back
                    </button>

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
