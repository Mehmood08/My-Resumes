import React, { useState, useEffect, useRef } from 'react';
import GuidedHelper from './GuidedHelper';
import { LuPlus, LuInfo, LuLightbulb, LuTrash2, LuChevronLeft, LuCheck, LuBold, LuItalic, LuHeading, LuList, LuListOrdered } from "react-icons/lu";

const GuidedEditor = ({ markdown, onChange, onSave, onStartWizard }) => {
    const [currentStep, setCurrentStep] = useState(markdown ? 0 : -1);
    const [showHelper, setShowHelper] = useState(false);
    const isInternalChange = useRef(false);
    const textAreaRef = useRef(null);
    const [toolbarState, setToolbarState] = useState({ visible: false, top: 0, left: 0, selectionStart: 0, selectionEnd: 0 });
    const [showMarkdownTip, setShowMarkdownTip] = useState(false);

    // Only reset to step 0 if we are currently at the welcome screen (-1) and markdown is provided.
    // This prevents jumping back to step 0 on every keystroke.
    useEffect(() => {
        if (markdown && currentStep === -1) {
            setCurrentStep(0);
            setWelcomeStep(0);
        } else if (!markdown && currentStep !== -1) {
            setCurrentStep(-1);
            setWelcomeStep(0);
        }
    }, [markdown]);

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
        { id: 'summary', label: 'Summary', emoji: '📝', tip: "Keep it brief (3-4 sentences). Focus on your biggest achievements." },
        { id: 'experience', label: 'Experience', emoji: '💼', helper: 'experience', tip: "Use action verbs (e.g., 'Led', 'Developed'). Quantify results where possible." },
        { id: 'projects', label: 'Projects', emoji: '🚀', helper: 'projects', tip: "Highlight the tech stack and the problem you solved." },
        { id: 'education', label: 'Education', emoji: '🎓', helper: 'education', tip: "List your most recent degree first." },
        { id: 'skills', label: 'Skills', emoji: '⚡', helper: 'skills', tip: "Mix hard skills (e.g., Python) and soft skills (e.g., Leadership)." },
        { id: 'languages', label: 'Languages', emoji: '🌐', helper: 'languages' },
        { id: 'certifications', label: 'Certifications', emoji: '🏆', helper: 'certifications' }
    ];

    // Parse Markdown into state — but SKIP if this change came from the user typing
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false; // reset flag
            return; // don't re-parse — user is actively editing
        }
        if (!markdown) return;
        const lines = markdown.split('\n');
        const parsedSections = [];
        let currentSec = null;
        let isParsingHeader = true;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed && isParsingHeader) return;

            if (line.startsWith('# ') && isParsingHeader) {
                const titleLine = line.replace('# ', ''); // Do not trim to preserve trailing spaces
                const [namePart, professionPart] = titleLine.split('|').map(s => s.trimStart()); // only trim start

                if (namePart) {
                    const nameWords = namePart.split(' ');
                    setPersonalInfo(prev => ({
                        ...prev,
                        firstName: nameWords[0] || '',
                        lastName: nameWords.slice(1).join(' ') || '',
                        profession: professionPart !== undefined ? professionPart : '' // Don't fall back to '' if it's just spaces
                    }));
                }
            } else if (isParsingHeader && line.includes('|') && (line.includes('@') || line.match(/\d/) || line.includes('http') || line.includes('www'))) {
                // Header contact line or links line
                const parts = line.split('|').map(s => s.trimStart()); // only trim start

                // Check if this is a links line (contains http or www)
                if (parts.length >= 2 && (parts[0].includes('http') || parts[0].includes('www'))) {
                    setPersonalInfo(prev => ({
                        ...prev,
                        link1: parts[0] || '',
                        link2: parts[1] || ''
                    }));
                } else if (parts.length >= 1) {
                    // Contact info line
                    const locParts = parts[0].split(',').map(s => s.trim());
                    setPersonalInfo(prev => ({
                        ...prev,
                        city: locParts[0] || '',
                        province: locParts[1] || '',
                        zip: locParts[2] || '',
                        email: parts[1] || '',
                        phone: parts[2] || ''
                    }));
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

        // Final cleanup
        const finalSections = parsedSections.map(s => ({
            ...s,
            content: s.content.join('\n').trim()
        }));
        setSections(finalSections);
    }, [markdown]);

    // --- Floating Toolbar Handlers ---
    const handleTextareaSelect = (e) => {
        const el = e.target;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        
        if (start !== end) {
            // Text is selected! Show toolbar above the selection.
            const rect = el.getBoundingClientRect();
            // We'll position it relatively stable above the textarea
            setToolbarState({
                visible: true,
                top: rect.top - 60, // Above the textarea
                left: rect.left + (rect.width / 2) - 120, // Centered
                selectionStart: start,
                selectionEnd: end
            });
            // Auto-hide the introductory tooltip if user figured it out!
            if (showMarkdownTip) {
                setShowMarkdownTip(false);
                localStorage.setItem('hasSeenMarkdownTip', 'true');
            }
        } else {
            setToolbarState(prev => ({ ...prev, visible: false }));
        }
    };

    const handleTextareaFocus = () => {
        // Show tooltip for first-time users focusing on summary/experience step
        if (currentStep > 0 && !localStorage.getItem('hasSeenMarkdownTip')) {
            setShowMarkdownTip(true);
            setTimeout(() => {
                setShowMarkdownTip(false);
                localStorage.setItem('hasSeenMarkdownTip', 'true');
            }, 6000); // hide after 6 seconds
        }
    };

    const handleTextareaMouseDown = () => {
        // Hide toolbar when user clicks to type or clear selection
        if (toolbarState.visible) {
            setToolbarState(prev => ({ ...prev, visible: false }));
        }
    };

    const applyFormat = (formatType) => {
        if (!textAreaRef.current || currentStep < 0) return;
        
        const el = textAreaRef.current;
        const start = toolbarState.selectionStart;
        const end = toolbarState.selectionEnd;
        
        const step = steps[currentStep];
        const suggestedTitle = step.label.toUpperCase();
        const sectionIndex = sections.findIndex(s => {
            const title = s.title.toUpperCase();
            const id = step.id.toUpperCase();
            return title.includes(id) || (id === 'SUMMARY' && title.includes('PROFESSIONAL'));
        });
        
        const activeSection = sectionIndex !== -1 ? sections[sectionIndex] : null;
        const currentVal = activeSection ? activeSection.content : '';
        
        const selectedText = currentVal.substring(start, end);
        let newText = "";
        
        if (formatType === 'bold') newText = `**${selectedText}**`;
        else if (formatType === 'italic') newText = `*${selectedText}*`;
        else if (formatType === 'heading') newText = `### ${selectedText}`;
        else if (formatType === 'list') {
           newText = selectedText.split('\n').filter(line => line.trim() !== '').map(line => `- ${line}`).join('\n');
        }
        else if (formatType === 'orderedList') {
           newText = selectedText.split('\n').filter(line => line.trim() !== '').map((line, idx) => `${idx + 1}. ${line}`).join('\n');
        }

        const finalVal = currentVal.substring(0, start) + newText + currentVal.substring(end);
        
        // Update state
        if (sectionIndex !== -1) {
            handleSectionChange(sectionIndex, finalVal);
        } else {
            const updated = [...sections, { title: activeSection ? activeSection.title : suggestedTitle, content: finalVal }];
            setSections(updated);
            updateMarkdown(personalInfo, updated);
        }
        
        setToolbarState(prev => ({ ...prev, visible: false }));
        
        // Restore focus and cursor position after React re-render
        setTimeout(() => {
            el.focus();
            const newPos = start + newText.length;
            el.setSelectionRange(newPos, newPos);
        }, 10);
    };

    const updateMarkdown = (newPersonalInfo, newSections) => {
        let md = `# ${newPersonalInfo.firstName} ${newPersonalInfo.lastName} | ${newPersonalInfo.profession}\n`;
        md += `${newPersonalInfo.city}, ${newPersonalInfo.province}, ${newPersonalInfo.zip} | ${newPersonalInfo.email} | ${newPersonalInfo.phone}\n`;

        if (newPersonalInfo.link1 || newPersonalInfo.link2) {
            md += `${newPersonalInfo.link1 || ''} | ${newPersonalInfo.link2 || ''}\n`;
        }
        md += '\n';

        newSections.forEach(sec => {
            md += `## ${sec.title}\n${sec.content}\n\n`;
        });

        // Mark this as an internal change so the parser useEffect won't overwrite user's input
        isInternalChange.current = true;
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

    const handleHelperSave = (content) => {
        const step = steps[currentStep];
        const matchTitle = step.id === 'summary' ? 'PROFESSIONAL SUMMARY' :
            step.id === 'experience' ? 'EXPERIENCE' :
                step.id === 'projects' ? 'PROJECTS' :
                    step.id === 'education' ? 'EDUCATION' :
                        step.id === 'skills' ? 'SKILLS' :
                            step.id === 'languages' ? 'LANGUAGES' :
                                step.id === 'certifications' ? 'CERTIFICATIONS' : step.label.toUpperCase();

        const sectionIndex = sections.findIndex(s => {
            const title = s.title.toUpperCase();
            const id = step.id.toUpperCase();
            return title.includes(id) || (id === 'SUMMARY' && title.includes('PROFESSIONAL'));
        });

        let newContent = "";
        let updatedSections = [...sections];

        if (sectionIndex !== -1) {
            // Append to existing
            const existing = sections[sectionIndex].content;
            newContent = existing ? `${existing}\n\n${content}` : content;
            updatedSections[sectionIndex].content = newContent;
        } else {
            // Create new
            updatedSections.push({ title: matchTitle, content: content });
        }

        setSections(updatedSections);
        updateMarkdown(personalInfo, updatedSections);
        setShowHelper(false);
    };

    // --- Renderers ---

    const [welcomeStep, setWelcomeStep] = useState(0); // 0: Hero, 1: Experience Selection
    const [experienceLevel, setExperienceLevel] = useState(null);

    const renderWelcome = () => {
        if (welcomeStep === 0) {
            return (
                <div className="welcome-step fadeIn">
                    <div className="welcome-hero">
                        <h1>How do you want to start?</h1>
                        <p>We'll guide you through the process of creating a professional CV.</p>

                        <div className="welcome-options">
                            <div className="welcome-card" onClick={onStartWizard}>
                                <div className="card-icon">🚀</div>
                                <h3>Create a New CV</h3>
                                <p>Start building your professional resume immediately.</p>
                            </div>

                            <div className="welcome-card secondary">
                                <div className="card-icon">📂</div>
                                <h3>I already have a CV</h3>
                                <p>Upload your existing CV to edit and improve it.</p>
                                <span className="coming-soon">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (welcomeStep === 1) {
            return (
                <div className="welcome-step fadeIn">
                    <div className="welcome-hero">
                        <h1>What is your experience level?</h1>
                        <p>This helps us recommend the right sections for you.</p>

                        <div className="experience-options">
                            <button className="exp-card" onClick={() => { setExperienceLevel('entry'); setCurrentStep(0); }}>
                                <span className="exp-icon">🎓</span>
                                <div className="exp-info">
                                    <h3>No Experience / Student</h3>
                                    <p>I'm looking for my first job or internship.</p>
                                </div>
                            </button>

                            <button className="exp-card" onClick={() => { setExperienceLevel('junior'); setCurrentStep(0); }}>
                                <span className="exp-icon">💼</span>
                                <div className="exp-info">
                                    <h3>Entry-Level</h3>
                                    <p>I have 0-3 years of work experience.</p>
                                </div>
                            </button>

                            <button className="exp-card" onClick={() => { setExperienceLevel('senior'); setCurrentStep(0); }}>
                                <span className="exp-icon">👔</span>
                                <div className="exp-info">
                                    <h3>Experienced</h3>
                                    <p>I have 3+ years of work experience.</p>
                                </div>
                            </button>
                        </div>

                        <button className="back-link-center" onClick={() => setWelcomeStep(0)}>Back</button>
                    </div>
                </div>
            );
        }
    };

    const renderStepContent = () => {
        if (currentStep === -1) return renderWelcome();

        const step = steps[currentStep];

        if (step.id === 'heading') {
            return (
                <div className="wizard-form fadeIn">
                    <div className="wizard-header">
                        <h2>Let's start with your header</h2>
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
                                placeholder="e.g. KPK"
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
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                value={personalInfo.link1}
                                onChange={(e) => handleInfoChange('link1', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Portfolio URL</label>
                            <input
                                type="url"
                                value={personalInfo.link2}
                                onChange={(e) => handleInfoChange('link2', e.target.value)}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // Generic section
        const sectionIndex = sections.findIndex(s => {
            const title = s.title.toUpperCase();
            const id = step.id.toUpperCase();
            // Match if title contains id (e.g. "SOFTDEV SUMMARY" matches "SUMMARY")
            // OR if it's one of our hardcoded variants
            return title.includes(id) || (id === 'SUMMARY' && title.includes('PROFESSIONAL'));
        });

        const activeSection = sectionIndex !== -1 ? sections[sectionIndex] : null;

        // Dynamic suggested title
        const suggestedTitle = step.label.toUpperCase();

        return (
            <div className="wizard-form fadeIn">
                <div className="wizard-header">
                    <div className="header-row">
                        <div className="section-title-edit">
                            <label className="field-label-small">Section Heading</label>
                            <input
                                type="text"
                                className="section-title-input"
                                value={activeSection ? activeSection.title : suggestedTitle}
                                onChange={(e) => {
                                    if (sectionIndex !== -1) {
                                        const updated = [...sections];
                                        updated[sectionIndex].title = e.target.value;
                                        setSections(updated);
                                        updateMarkdown(personalInfo, updated);
                                    } else {
                                        const updated = [...sections, { title: e.target.value, content: '' }];
                                        setSections(updated);
                                        updateMarkdown(personalInfo, updated);
                                    }
                                }}
                                placeholder={suggestedTitle}
                            />
                        </div>
                        {step.helper && (
                            <button className="add-item-btn" onClick={() => setShowHelper(true)}>
                                <LuPlus /> Add {step.label.slice(0, -1)}
                            </button>
                        )}
                    </div>
                </div>

                {step.tip && (
                    <div className="wizard-tip">
                        <LuLightbulb className="tip-icon" />
                        <p>{step.tip}</p>
                    </div>
                )}

                <div className="form-group full-width" style={{ position: 'relative' }}>
                    <label>Section Content</label>
                    <textarea
                        ref={textAreaRef}
                        className="wizard-textarea"
                        value={activeSection ? activeSection.content : ''}
                        onChange={(e) => {
                            if (sectionIndex !== -1) {
                                handleSectionChange(sectionIndex, e.target.value);
                            } else {
                                const currentTitle = activeSection ? activeSection.title : suggestedTitle;
                                const updated = [...sections, { title: currentTitle, content: e.target.value }];
                                setSections(updated);
                                updateMarkdown(personalInfo, updated);
                            }
                        }}
                        onFocus={handleTextareaFocus}
                        onMouseUp={handleTextareaSelect}
                        onKeyUp={handleTextareaSelect}
                        onMouseDown={handleTextareaMouseDown}
                        placeholder={`Enter details here... \n\nTips:\n- Use **bold** for emphasis\n- Use - for bullet points`}
                    />
                    
                    {/* Onboarding Tooltip */}
                    {showMarkdownTip && (
                        <div className="markdown-onboarding-tip fadeIn">
                            <LuLightbulb className="tip-icon-small" />
                            <span><strong>Tip:</strong> Select text to easily make it bold, italic, or a list!</span>
                        </div>
                    )}
                </div>

                {showHelper && (
                    <GuidedHelper
                        type={step.helper}
                        onSave={handleHelperSave}
                        onClose={() => setShowHelper(false)}
                    />
                )}
            </div>
        );
    };

    const completionPercent = currentStep === -1 ? 0 : Math.round(((currentStep + 1) / steps.length) * 100);

    return (
        <div className="wizard-container">
            <aside className="wizard-sidebar">
                <div className="wizard-steps-list">
                    <div
                        className={`wizard-step-item ${currentStep === -1 ? 'active' : 'completed'}`}
                        onClick={() => setCurrentStep(-1)}
                    >
                        <div className="step-number">🏠</div>
                        <span className="step-label">Welcome</span>
                    </div>

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
            </aside>

            <main className="wizard-main">
                {/* Floating Markdown Toolbar */}
                {toolbarState.visible && (
                    <div 
                        className="floating-toolbar" 
                        style={{ 
                            position: 'fixed', 
                            top: toolbarState.top, 
                            left: toolbarState.left,
                            zIndex: 1000
                        }}
                    >
                        <button onClick={() => applyFormat('bold')} title="Bold"><LuBold size={18} /></button>
                        <button onClick={() => applyFormat('italic')} title="Italic"><LuItalic size={18} /></button>
                        <span className="toolbar-divider" />
                        <button onClick={() => applyFormat('heading')} title="Heading"><LuHeading size={18} /> H3</button>
                        <span className="toolbar-divider" />
                        <button onClick={() => applyFormat('list')} title="Bullet List"><LuList size={18} /> Dots</button>
                        <button onClick={() => applyFormat('orderedList')} title="Numbered List"><LuListOrdered size={18} /> 123</button>
                    </div>
                )}

                {/* Mobile-only context banner */}
                {currentStep !== -1 && (
                    <div className="mobile-step-banner mobile-only">
                        <span className="mb-step-indicator">STEP {currentStep + 1} OF {steps.length}</span>
                        <h4 className="mb-step-title">{steps[currentStep].label}</h4>
                    </div>
                )}

                <div className="wizard-content-scroll">
                    {renderStepContent()}
                </div>

                {currentStep !== -1 && (
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
                        {currentStep === steps.length - 1 && (
                            <button className="continue-btn" onClick={() => { onSave(); alert("Resume Saved Successfully! ✨"); }}>
                                Finish ✨
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GuidedEditor;


