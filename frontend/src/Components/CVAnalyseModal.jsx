import React, { useState, useEffect } from 'react';
import './CVAnalyseModal.css';
import { LuX, LuSparkles, LuCheck, LuInfo } from 'react-icons/lu';
import { getAuthHeaders } from '../utils/api';
import { buildSectionDraft } from '../utils/parseSectionContent';

function SectionEditor({ section, draft, onDraftChange, onSave, onReplaceSuggested, saved }) {
    const [activeTab, setActiveTab] = useState('suggested');
    const isCurrentDirty = draft.current.trim() !== draft.savedCurrent.trim();

    const updateDraft = (patch) => onDraftChange(section.id, patch);

    return (
        <div className="analyse-section-card">
            <div className="analyse-section-head">
                <h3>{section.title || section.id}</h3>
                {saved && !isCurrentDirty && (
                    <span className="analyse-applied-tag">
                        <LuCheck size={14} /> Saved
                    </span>
                )}
            </div>

            <div className="analyse-tabs">
                <button
                    type="button"
                    className={`analyse-tab ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    Current
                </button>
                <button
                    type="button"
                    className={`analyse-tab ${activeTab === 'suggested' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suggested')}
                >
                    Suggested
                </button>
            </div>

            {activeTab === 'suggested' && section.improvements?.length > 0 && (
                <ul className="analyse-section-tips">
                    {section.improvements.map((tip, idx) => (
                        <li key={idx} className={`analyse-tip-colour-${idx % 4}`}>{tip}</li>
                    ))}
                </ul>
            )}

            {activeTab === 'current' ? (
                <div className="analyse-tab-panel">
                    <textarea
                        className="analyse-section-textarea"
                        value={draft.current}
                        onChange={(e) => updateDraft({ current: e.target.value })}
                        rows={6}
                        spellCheck
                    />
                    <button
                        type="button"
                        className="analyse-save-btn"
                        onClick={() => onSave(section.id)}
                        disabled={!isCurrentDirty || !draft.current.trim()}
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="analyse-tab-panel">
                    <textarea
                        className="analyse-section-textarea"
                        value={draft.suggested}
                        onChange={(e) => updateDraft({ suggested: e.target.value })}
                        rows={6}
                        spellCheck
                    />
                    <button
                        type="button"
                        className="analyse-replace-btn"
                        onClick={() => onReplaceSuggested(section.id)}
                        disabled={!draft.suggested.trim()}
                    >
                        Replace with Suggested
                    </button>
                </div>
            )}
        </div>
    );
}

export default function CVAnalyseModal({ isOpen, onClose, markdown, onApplySection }) {
    const [jobDescription, setJobDescription] = useState('');
    const [status, setStatus] = useState('input');
    const [analysis, setAnalysis] = useState(null);
    const [sectionDrafts, setSectionDrafts] = useState({});
    const [savedIds, setSavedIds] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStatus('input');
            setAnalysis(null);
            setSectionDrafts({});
            setSavedIds({});
            setErrorMessage('');
        }
    }, [isOpen]);

    const handleAnalyse = async () => {
        if (!jobDescription.trim()) {
            setErrorMessage('Please paste a job description first.');
            return;
        }
        if (!markdown?.trim()) {
            setErrorMessage('Your CV is empty. Add content before analysing.');
            return;
        }

        setErrorMessage('');
        setStatus('loading');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resumes/analyse`, {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ markdown, jobDescription: jobDescription.trim() }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to analyse CV');

            const drafts = {};
            for (const section of data.sections || []) {
                drafts[section.id] = buildSectionDraft(section, markdown);
            }

            setSectionDrafts(drafts);
            setSavedIds({});
            setAnalysis(data);
            setStatus('success');
        } catch (error) {
            console.error('Analyse error:', error);
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const handleDraftChange = (sectionId, patch) => {
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionId]: { ...prev[sectionId], ...patch },
        }));
        if (patch.current !== undefined) {
            setSavedIds((prev) => ({ ...prev, [sectionId]: false }));
        }
    };

    const handleSave = (sectionId) => {
        const draft = sectionDrafts[sectionId];
        const content = draft?.current?.trim();
        if (!content || content === draft.savedCurrent.trim()) return;

        onApplySection?.(sectionId, content);
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionId]: { ...prev[sectionId], savedCurrent: content },
        }));
        setSavedIds((prev) => ({ ...prev, [sectionId]: true }));
    };

    const handleReplaceSuggested = (sectionId) => {
        const draft = sectionDrafts[sectionId];
        const content = draft?.suggested?.trim();
        if (!content) return;

        onApplySection?.(sectionId, content);
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                current: content,
                savedCurrent: content,
            },
        }));
        setSavedIds((prev) => ({ ...prev, [sectionId]: true }));
    };

    const handleClose = () => {
        setStatus('input');
        setAnalysis(null);
        setSectionDrafts({});
        setSavedIds({});
        onClose();
    };

    if (!isOpen) return null;

    const getScoreClass = (score) => {
        if (score >= 75) return 'green';
        if (score >= 40) return 'yellow';
        return 'red';
    };

    return (
        <div className="analyse-modal-overlay fadeIn">
            <div className="analyse-modal">
                <button type="button" className="analyse-close-btn" onClick={handleClose} aria-label="Close">
                    <LuX size={24} />
                </button>

                {status === 'input' && (
                    <div className="analyse-input-view">
                        <div className="analyse-modal-header">
                            <LuSparkles size={28} className="analyse-header-icon" />
                            <div>
                                <h2>Analyse CV against Job</h2>
                                <p>Paste the job description and get tailored improvements for each section.</p>
                            </div>
                        </div>
                        <label className="analyse-jd-label" htmlFor="analyse-jd">Job Description</label>
                        <textarea
                            id="analyse-jd"
                            className="analyse-jd-input"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here — requirements, responsibilities, and skills..."
                            rows={10}
                        />
                        {errorMessage && <p className="analyse-inline-error">{errorMessage}</p>}
                        <button type="button" className="analyse-run-btn" onClick={handleAnalyse}>
                            <LuSparkles size={18} /> Analyse CV
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="analyse-loading">
                        <div className="scanner-container">
                            <div className="scanner-beam" />
                            <LuSparkles size={64} className="pulse-icon" />
                        </div>
                        <h3>Analysing your CV...</h3>
                        <p>Matching your experience and skills against the job description.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="analyse-error">
                        <LuInfo size={48} className="error-icon" />
                        <h3>Analysis failed</h3>
                        <p>{errorMessage}</p>
                        <button type="button" className="analyse-retry-btn" onClick={() => setStatus('input')}>
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'success' && analysis && (
                    <div className="analyse-results slideUp">
                        <div className="analyse-score-header">
                            <div className={`analyse-score-badge ${getScoreClass(analysis.matchScore)}`}>
                                {analysis.matchScore}%
                            </div>
                            <div>
                                <h2>Job Match Analysis</h2>
                                {analysis.summary && <p>{analysis.summary}</p>}
                            </div>
                        </div>

                        <div className="analyse-sections">
                            {analysis.sections.map((section) => (
                                <SectionEditor
                                    key={section.id}
                                    section={section}
                                    draft={sectionDrafts[section.id] || { current: '', suggested: '', savedCurrent: '' }}
                                    onDraftChange={handleDraftChange}
                                    onSave={handleSave}
                                    onReplaceSuggested={handleReplaceSuggested}
                                    saved={savedIds[section.id]}
                                />
                            ))}
                        </div>

                        <div className="analyse-footer-note">
                            Save applies your Current edits to the editor. Replace with Suggested overwrites and saves in one step.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
