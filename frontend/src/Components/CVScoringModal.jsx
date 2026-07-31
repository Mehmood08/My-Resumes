import React, { useState, useEffect } from 'react';
import './CVScoringModal.css';
import { LuX, LuCheck, LuInfo, LuChevronRight } from "react-icons/lu";
import { useAuth } from '../context/AuthContext';

export default function CVScoringModal({ isOpen, onClose, markdown }) {
    const { getUserId } = useAuth();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [scoreData, setScoreData] = useState(null);

    useEffect(() => {
        if (isOpen && status === 'idle') {
            handleScoreCV();
        }
    }, [isOpen]);

    const handleScoreCV = async () => {
        setStatus('loading');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resumes/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown, userId: getUserId() })
            });

            if (!response.ok) throw new Error('Failed to score CV');

            const data = await response.json();
            setScoreData(data);
            setStatus('success');
        } catch (error) {
            console.error("Error scoring CV:", error);
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    const getColorClass = (score) => {
        if (score >= 75) return 'green';
        if (score >= 40) return 'yellow';
        return 'red';
    };

    return (
        <div className="scoring-modal-overlay fadeIn">
            <div className="scoring-modal">
                <button className="scoring-close-btn" onClick={() => { setStatus('idle'); onClose(); }}>
                    <LuX size={24} />
                </button>

                {status === 'loading' && (
                    <div className="scoring-loading">
                        <div className="scanner-container">
                            <div className="scanner-beam"></div>
                            <LuCheck size={64} className="pulse-icon" />
                        </div>
                        <h3>Analyzing your CV...</h3>
                        <p>Our AI is reviewing your experience, skills, and structure.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="scoring-error">
                        <LuInfo size={48} className="error-icon" />
                        <h3>Oops! Something went wrong.</h3>
                        <p>We couldn't score your CV right now. Please try again later.</p>
                        <button className="retry-btn" onClick={handleScoreCV}>
                            Retry
                        </button>
                    </div>
                )}

                {status === 'success' && scoreData && (
                    <div className="scoring-success slideUp">
                        <div className="score-header">
                            <div className={`circular-score ${getColorClass(scoreData.totalScore)}`}>
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path className="circle"
                                        strokeDasharray={`${scoreData.totalScore}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="percentage">{scoreData.totalScore}%</div>
                            </div>
                            <div className="score-text">
                                <h2>{scoreData.totalScore >= 75 ? 'Strong CV! 🌟' : scoreData.totalScore >= 40 ? 'Needs Work 🚧' : 'Poor CV ⚠️'}</h2>
                                <p>Based on our AI analysis against industry standards.</p>
                            </div>
                        </div>

                        <div className="score-body">
                            <div className="breakdown-section">
                                <h3>📊 Section Breakdown</h3>
                                <div className="breakdown-grid">
                                    <div className="breakdown-item">
                                        <span>Contact Info</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(scoreData.breakdown.contact / 10) * 100}%` }}></div></div>
                                        <span className="b-score">{scoreData.breakdown.contact}/10</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Summary</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(scoreData.breakdown.summary / 15) * 100}%` }}></div></div>
                                        <span className="b-score">{scoreData.breakdown.summary}/15</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Experience</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(scoreData.breakdown.experience / 30) * 100}%` }}></div></div>
                                        <span className="b-score">{scoreData.breakdown.experience}/30</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Skills</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(scoreData.breakdown.skills / 25) * 100}%` }}></div></div>
                                        <span className="b-score">{scoreData.breakdown.skills}/25</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Education</span>
                                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(scoreData.breakdown.education / 20) * 100}%` }}></div></div>
                                        <span className="b-score">{scoreData.breakdown.education}/20</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tips-section">
                                <h3>💡 Top Improvement Tips</h3>
                                <ul className="tips-list">
                                    {scoreData.tips.map((tip, idx) => (
                                        <li key={idx}>
                                            <LuChevronRight className="tip-bullet" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <div className="score-footer">
                            <button className="improve-btn" onClick={() => { setStatus('idle'); onClose(); }}>
                                I'll Improve It
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
