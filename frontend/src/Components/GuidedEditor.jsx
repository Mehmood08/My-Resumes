import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import GuidedHelper from './GuidedHelper';
import ImageCropperModal from './ImageCropperModal';
import { LuPlus, LuInfo, LuLightbulb, LuTrash2, LuChevronLeft, LuCheck, LuBold, LuItalic, LuHeading, LuList, LuListOrdered } from "react-icons/lu";
import { validateHeadingFields, hasValidationErrors } from '../utils/cvValidation';

const GuidedEditor = forwardRef(({ markdown, onChange, onSave, onStartWizard, needsVerification, onVerificationDismissed, onMetaUpdate, onVerifyStateChange }, ref) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showHelper, setShowHelper] = useState(false);
    const isInternalChange = useRef(false);
    const textAreaRef = useRef(null);
    const [toolbarState, setToolbarState] = useState({ visible: false, top: 0, left: 0, selectionStart: 0, selectionEnd: 0 });
    const [showMarkdownTip, setShowMarkdownTip] = useState(false);
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [verifiedSections, setVerifiedSections] = useState({});
    const [cropperData, setCropperData] = useState(null);
    const isVerificationInitialized = useRef(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showValidationToast, setShowValidationToast] = useState(false);

    // Show verification popup when AI CV is loaded
    useEffect(() => {
        if (needsVerification) {
            // Only initialize once when the AI flow starts
            if (!isVerificationInitialized.current && markdown && currentStep !== -1) {
                setShowVerificationPopup(true); // Safely trigger side-effect outside of updater
                const initial = {};
                steps.forEach(s => { initial[s.id] = false; });
                setVerifiedSections(initial);
                isVerificationInitialized.current = true;
            }
        } else {
            // Reset the flag when we leave verification mode
            isVerificationInitialized.current = false;
        }
    }, [needsVerification, markdown, currentStep]);

    // Only reset to step 0 if we are currently at the welcome screen (-1) and markdown is provided.
    // This prevents jumping back to step 0 on every keystroke.
    // Automatically set step to 0 if markdown exists
    useEffect(() => {
        if (markdown && currentStep === -1) {
            setCurrentStep(0);
        }
    }, [markdown]);

    const [personalInfo, setPersonalInfo] = useState({
        photo: '',
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
    const personalInfoRef = useRef(personalInfo);
    const sectionsRef = useRef(sections);

    useEffect(() => { personalInfoRef.current = personalInfo; }, [personalInfo]);
    useEffect(() => { sectionsRef.current = sections; }, [sections]);

    const buildMarkdown = (newPersonalInfo, newSections) => {
        let md = '';
        if (newPersonalInfo.photo) {
            md += `![Profile](${newPersonalInfo.photo})\n`;
        }
        md += `# ${newPersonalInfo.firstName} ${newPersonalInfo.lastName} | ${newPersonalInfo.profession}\n`;
        md += `${newPersonalInfo.city}, ${newPersonalInfo.province}, ${newPersonalInfo.zip} | ${newPersonalInfo.email} | ${newPersonalInfo.phone}\n`;

        if (newPersonalInfo.link1 || newPersonalInfo.link2) {
            md += `${newPersonalInfo.link1 || ''} | ${newPersonalInfo.link2 || ''}\n`;
        }
        md += '\n';

        newSections.forEach(sec => {
            md += `## ${sec.title}\n${sec.content}\n\n`;
        });

        return md.trim();
    };

    // Sync metadata with parent for auto-titling
    useEffect(() => {
        if (onMetaUpdate) {
            onMetaUpdate({
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                profession: personalInfo.profession
            });
        }
    }, [personalInfo.firstName, personalInfo.lastName, personalInfo.profession]);

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

    const currentStepRef = useRef(currentStep);
    useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

    useEffect(() => {
        if (!hasValidationErrors(fieldErrors)) {
            setShowValidationToast(false);
        }
    }, [fieldErrors]);

    useEffect(() => {
        if (!showValidationToast) return;
        const timer = setTimeout(() => setShowValidationToast(false), 4000);
        return () => clearTimeout(timer);
    }, [showValidationToast]);

    useImperativeHandle(ref, () => ({
        getMarkdown: () => buildMarkdown(personalInfoRef.current, sectionsRef.current),
        validate: () => {
            const errors = validateHeadingFields(personalInfoRef.current);
            setFieldErrors(errors);
            if (hasValidationErrors(errors)) {
                setCurrentStep(0);
                setShowValidationToast(true);
                return false;
            }
            setShowValidationToast(false);
            return true;
        },
        verifyCurrentSection: () => {
            const step = currentStepRef.current;
            const stepId = steps[step]?.id;
            if (!stepId) return;
            setVerifiedSections(prev => ({ ...prev, [stepId]: true }));
            if (step < steps.length - 1) {
                setTimeout(() => setCurrentStep(step + 1), 300);
            }
        },
        applySectionSuggestion: (sectionId, content) => {
            if (!sectionId || !content?.trim()) return false;

            const matchTitle = sectionId === 'summary' ? 'PROFESSIONAL SUMMARY' :
                sectionId === 'experience' ? 'EXPERIENCE' :
                    sectionId === 'projects' ? 'PROJECTS' :
                        sectionId === 'education' ? 'EDUCATION' :
                            sectionId === 'skills' ? 'SKILLS' :
                                sectionId === 'languages' ? 'LANGUAGES' :
                                    sectionId === 'certifications' ? 'CERTIFICATIONS' :
                                        sectionId.toUpperCase();

            const sectionIndex = sectionsRef.current.findIndex(s => {
                const title = s.title.toUpperCase();
                const id = sectionId.toUpperCase();
                return title.includes(id) || (id === 'SUMMARY' && title.includes('PROFESSIONAL'));
            });

            const updatedSections = [...sectionsRef.current];
            if (sectionIndex !== -1) {
                updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], content: content.trim() };
            } else {
                updatedSections.push({ title: matchTitle, content: content.trim() });
            }

            setSections(updatedSections);
            updateMarkdown(personalInfoRef.current, updatedSections);
            return true;
        },
    }));

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

            if (line.startsWith('![Profile](') && isParsingHeader) {
                const url = line.substring(11, line.length - 1);
                setPersonalInfo(prev => ({ ...prev, photo: url }));
            } else if (line.startsWith('# ') && isParsingHeader) {
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

    const stripMarkdown = (text) => {
        // Remove bold, italic, heading, and list markers
        let cleaned = text.trim();
        
        // Remove bold/italic (stars and underscores)
        cleaned = cleaned.replace(/^(\*\*|\*|__|_)/, '').replace(/(\*\*|\*|__|_)$/, '');
        // Remove horizontal lines if any
        cleaned = cleaned.replace(/^---$/, '');
        // Remove list markers (handle both bullet and numbered)
        cleaned = cleaned.replace(/^([\-\*]|\d+\.)\s+/, '');
        // Remove headings
        cleaned = cleaned.replace(/^#+\s+/, '');
        
        return cleaned;
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

        // Check if current selection ALREADY has exactly this format (Toggle Check)
        const isBold = selectedText.startsWith('**') && selectedText.endsWith('**');
        const isItalic = (selectedText.startsWith('*') && selectedText.endsWith('*')) && !isBold;
        const isHeading = selectedText.startsWith('### ');
        const isList = selectedText.split('\n').every(line => line.trim().startsWith('- '));
        const isOrderedList = selectedText.split('\n').every(line => /^\d+\.\s+/.test(line.trim()));

        // Logic: If same format, REMOVE IT. If different format, STRIP & APPLY.
        if (formatType === 'bold') {
            if (isBold) newText = selectedText.slice(2, -2);
            else newText = `**${stripMarkdown(selectedText)}**`;
        } 
        else if (formatType === 'italic') {
            if (isItalic) newText = selectedText.slice(1, -1);
            else newText = `*${stripMarkdown(selectedText)}*`;
        }
        else if (formatType === 'heading') {
            if (isHeading) newText = selectedText.replace(/^###\s+/, '');
            else newText = `### ${stripMarkdown(selectedText)}`;
        }
        else if (formatType === 'list') {
            if (isList) {
                newText = selectedText.split('\n').map(l => l.replace(/^[-*]\s+/, '')).join('\n');
            } else {
                newText = selectedText.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => `- ${stripMarkdown(line)}`)
                    .join('\n');
            }
        }
        else if (formatType === 'orderedList') {
            if (isOrderedList) {
                newText = selectedText.split('\n').map(l => l.replace(/^\d+\.\s+/, '')).join('\n');
            } else {
                newText = selectedText.split('\n')
                    .filter(line => line.trim() !== '')
                    .map((line, idx) => `${idx + 1}. ${stripMarkdown(line)}`)
                    .join('\n');
            }
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
        const md = buildMarkdown(newPersonalInfo, newSections);
        isInternalChange.current = true;
        onChange(md);
    };

    const handleInfoChange = (field, value) => {
        const updated = { ...personalInfo, [field]: value };
        setPersonalInfo(updated);
        updateMarkdown(updated, sections);
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            // Open the advanced Image Cropper Modal instead of direct injection
            setCropperData(event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = null; // allow uploading same file again
    };

    const handleCropDone = (croppedDataUrl) => {
        // Compress the cropped image to save DB space
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 250; // standard CV profile picture width
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
            handleInfoChange('photo', compressedUrl);
            setCropperData(null);
        };
        img.src = croppedDataUrl;
    };

    const handleCropCancel = () => {
        setCropperData(null);
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
        const step = steps[currentStep];

        if (step.id === 'heading') {
            return (
                <div className="wizard-form fadeIn">
                    <div className="photo-upload-container">
                        <label className="photo-upload-label">Profile Photo (Optional)</label>
                        <div className="photo-upload-box">
                            {personalInfo.photo ? (
                                <div className="photo-preview-wrapper">
                                    <img src={personalInfo.photo} alt="Profile" className="photo-preview" />
                                    <button type="button" className="remove-photo-btn" onClick={() => handleInfoChange('photo', '')}>Remove</button>
                                </div>
                            ) : (
                                <label className="photo-upload-btn">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                                    <LuPlus size={20} /> Upload Photo
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name <span className="required-mark">*</span></label>
                            <input
                                type="text"
                                className={fieldErrors.firstName ? 'input-error' : ''}
                                value={personalInfo.firstName}
                                onChange={(e) => handleInfoChange('firstName', e.target.value)}
                                placeholder="e.g Mehmood"
                            />
                            {fieldErrors.firstName && <span className="field-error-msg">{fieldErrors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Surname <span className="required-mark">*</span></label>
                            <input
                                type="text"
                                className={fieldErrors.lastName ? 'input-error' : ''}
                                value={personalInfo.lastName}
                                onChange={(e) => handleInfoChange('lastName', e.target.value)}
                                placeholder="e.g. Shah"
                            />
                            {fieldErrors.lastName && <span className="field-error-msg">{fieldErrors.lastName}</span>}
                        </div>
                        <div className="form-group full-width">
                            <label>Profession <span className="required-mark">*</span></label>
                            <input
                                type="text"
                                className={fieldErrors.profession ? 'input-error' : ''}
                                value={personalInfo.profession}
                                onChange={(e) => handleInfoChange('profession', e.target.value)}
                                placeholder="e.g. Software Engineering"
                            />
                            {fieldErrors.profession && <span className="field-error-msg">{fieldErrors.profession}</span>}
                        </div>
                        <div className="form-group">
                            <label>City <span className="required-mark">*</span></label>
                            <input
                                type="text"
                                className={fieldErrors.city ? 'input-error' : ''}
                                value={personalInfo.city}
                                onChange={(e) => handleInfoChange('city', e.target.value)}
                                placeholder="e.g. Peshawar"
                            />
                            {fieldErrors.city && <span className="field-error-msg">{fieldErrors.city}</span>}
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
                            <label>Phone <span className="required-mark">*</span></label>
                            <input
                                type="tel"
                                className={fieldErrors.phone ? 'input-error' : ''}
                                value={personalInfo.phone}
                                onChange={(e) => handleInfoChange('phone', e.target.value)}
                                placeholder="e.g. 0345 1234567"
                            />
                            {fieldErrors.phone && <span className="field-error-msg">{fieldErrors.phone}</span>}
                        </div>
                        <div className="form-group full-width">
                            <label>Email <span className="required-mark">*</span></label>
                            <input
                                type="email"
                                className={fieldErrors.email ? 'input-error' : ''}
                                value={personalInfo.email}
                                onChange={(e) => handleInfoChange('email', e.target.value)}
                                placeholder="e.g example@gmail.com"
                            />
                            {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                className={fieldErrors.link1 ? 'input-error' : ''}
                                value={personalInfo.link1}
                                onChange={(e) => handleInfoChange('link1', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                            {fieldErrors.link1 && <span className="field-error-msg">{fieldErrors.link1}</span>}
                        </div>
                        <div className="form-group">
                            <label>Portfolio URL</label>
                            <input
                                type="url"
                                className={fieldErrors.link2 ? 'input-error' : ''}
                                value={personalInfo.link2}
                                onChange={(e) => handleInfoChange('link2', e.target.value)}
                                placeholder="https://github.com/..."
                            />
                            {fieldErrors.link2 && <span className="field-error-msg">{fieldErrors.link2}</span>}
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
                    </div>
                </div>

                {step.tip && (
                    <div className="wizard-tip">
                        <LuLightbulb className="tip-icon" />
                        <p>{step.tip}</p>
                    </div>
                )}

                <div className="form-group full-width" style={{ position: 'relative' }}>
                    <div className="section-content-header">
                        <label>Section Content</label>
                        {step.helper && (
                            <button type="button" className="add-item-btn add-item-btn-inline" onClick={() => setShowHelper(true)}>
                                <LuPlus size={14} /> Add {step.label.slice(0, -1)}
                            </button>
                        )}
                    </div>
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

    const findSectionForStep = (stepId) => {
        return sections.find(s => {
            const title = s.title.toUpperCase();
            const id = stepId.toUpperCase();
            return title.includes(id) || (id === 'SUMMARY' && title.includes('PROFESSIONAL'));
        });
    };

    const headingFields = ['firstName', 'lastName', 'profession', 'email', 'phone', 'city'];

    const getStepFillRatio = (stepId) => {
        if (stepId === 'heading') {
            const filled = headingFields.filter(f => personalInfo[f]?.trim()).length;
            return filled / headingFields.length;
        }
        const section = findSectionForStep(stepId);
        return section?.content?.trim() ? 1 : 0;
    };

    const isStepComplete = (stepId) => getStepFillRatio(stepId) === 1;

    const completionPercent = Math.round(
        (steps.reduce((sum, s) => sum + getStepFillRatio(s.id), 0) / steps.length) * 100
    );

    const allVerified = needsVerification && Object.keys(verifiedSections).length > 0 && Object.values(verifiedSections).every(v => v);
    const verifiedCount = Object.values(verifiedSections).filter(v => v).length;
    const totalSections = steps.length;

    // Auto-unlock main save button when all sections are verified
    useEffect(() => {
        if (allVerified && onVerificationDismissed) {
            onVerificationDismissed();
        }
    }, [allVerified, onVerificationDismissed]);

    useEffect(() => {
        if (!onVerifyStateChange) return;
        onVerifyStateChange({
            active: needsVerification && currentStep >= 0,
            verified: !!verifiedSections[steps[currentStep]?.id],
        });
    }, [needsVerification, currentStep, verifiedSections, onVerifyStateChange, steps]);

    return (
        <div className="wizard-container">
            {showValidationToast && (
                <div className="app-toast app-toast-error" role="alert">
                    Please fill in all required fields marked with * before saving.
                </div>
            )}

            {/* AI Verification Popup */}
            {showVerificationPopup && (
                <div className="verification-popup-overlay">
                    <div className="verification-popup-card animate-pop">
                        <div className="vp-icon">🎉</div>
                        <h2 className="vp-title">Your AI CV is Ready!</h2>
                        <p className="vp-desc">
                            Please <strong>review each section</strong> carefully. Edit anything that needs updating, then click <strong>Verify ✓</strong> to confirm it's accurate before moving to the next section.
                        </p>
                        <div className="vp-steps">
                            <div className="vp-step"><span>1️⃣</span> Review each section</div>
                            <div className="vp-step"><span>2️⃣</span> Edit if needed</div>
                            <div className="vp-step"><span>3️⃣</span> Click <strong>Verify ✓</strong> to confirm</div>
                        </div>
                        <button
                            className="vp-start-btn"
                            onClick={() => {
                                setShowVerificationPopup(false);
                                // Don't reset needsVerification here — Save stays locked until all verified
                                setCurrentStep(0);
                            }}
                        >
                            Let's Start! 🚀
                        </button>
                    </div>
                </div>
            )}
            <aside className="wizard-sidebar">
                <div className="wizard-sidebar-header">CV Sections</div>
                <div className="wizard-steps-list">

                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`wizard-step-item ${idx === currentStep ? 'active' : ''} ${isStepComplete(step.id) ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(idx)}
                        >
                            <div className="step-number">
                                {verifiedSections[step.id] ? (
                                    <span className="verified-badge">✓</span>
                                ) : (idx + 1)}
                            </div>
                            <span className="step-label">{step.label}</span>
                            {verifiedSections[step.id] && (
                                <span className="verified-label-sidebar">Verified</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="completeness-tracker">
                    <div className="completeness-label">
                        {needsVerification ? `VERIFIED: ${verifiedCount}/${totalSections}` : 'RESUME COMPLETENESS:'}
                    </div>
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: needsVerification ? `${(verifiedCount / totalSections) * 100}%` : `${completionPercent}%` }}
                        ></div>
                    </div>
                    <div className="percent-text">
                        {needsVerification ? `${Math.round((verifiedCount / totalSections) * 100)}%` : `${completionPercent}%`}
                    </div>
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
            </main>

            {/* Professional Image Cropper Modal */}
            {cropperData && (
                <ImageCropperModal 
                    imageSrc={cropperData} 
                    onCropDone={handleCropDone} 
                    onCropCancel={handleCropCancel} 
                />
            )}
        </div>
    );
});

GuidedEditor.displayName = 'GuidedEditor';

export default GuidedEditor;


