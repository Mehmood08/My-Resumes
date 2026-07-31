import React, { useState, useEffect } from 'react';
import './CVAnalyseModal.css';
import { LuX, LuSparkles, LuCheck, LuInfo, LuChevronRight } from 'react-icons/lu';

export default function CVAnalyseModal({ isOpen, onClose, markdown, onApplySection }) {
    const [jobDescription, setJobDescription] = useState('');
    const [status, setStatus] = useState('input'); // input, loading, success, error
    const [analysis, setAnalysis] = useState(null);
    const [appliedIds, setAppliedIds] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStatus('input');
            setAnalysis(null);
            setAppliedIds({});
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown, jobDescription: jobDescription.trim() }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to analyse CV');

            setAnalysis(data);
            setStatus('success');
        } catch (error) {
            console.error('Analyse error:', error);
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const handleApply = (section) => {
        if (!section?.suggestedContent?.trim()) return;
        onApplySection?.(section.id, section.suggestedContent.trim());
        setAppliedIds(prev => ({ ...prev, [section.id]: true }));
    };

    const handleClose = () => {
        setStatus('input');
        setAnalysis(null);
        setAppliedIds({});
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
                                <div key={section.id} className="analyse-section-card">
                                    <div className="analyse-section-head">
                                        <h3>{section.title || section.id}</h3>
                                        {appliedIds[section.id] && (
                                            <span className="analyse-applied-tag">
                                                <LuCheck size={14} /> Applied
                                            </span>
                                        )}
                                    </div>

                                    {section.improvements?.length > 0 && (
                                        <ul className="analyse-improvements">
                                            {section.improvements.map((tip, idx) => (
                                                <li key={idx}>
                                                    <LuChevronRight size={14} />
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.suggestedContent && (
                                        <div className="analyse-suggestion-preview">
                                            <span className="analyse-suggestion-label">Suggested rewrite</span>
                                            <pre>{section.suggestedContent}</pre>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className={`analyse-apply-btn ${appliedIds[section.id] ? 'applied' : ''}`}
                                        onClick={() => handleApply(section)}
                                        disabled={!section.suggestedContent?.trim() || appliedIds[section.id]}
                                    >
                                        {appliedIds[section.id] ? (
                                            <><LuCheck size={16} /> Applied to editor</>
                                        ) : (
                                            'Apply to section'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="analyse-footer-note">
                            Applied changes update your editor but are not saved until you click Save.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
