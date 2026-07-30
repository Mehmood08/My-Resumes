import React from 'react';
import { LuSparkles, LuPenTool, LuFileText, LuPanelLeft } from 'react-icons/lu';
import './EmptyState.css';

const EmptyState = ({ hasResumes, onSelectMode }) => {
    if (hasResumes) {
        return (
            <div className="empty-state-container">
                <div className="empty-state-content">
                    <div className="welcome-badge">CV BUILDER</div>
                    <h1 className="welcome-title">Select a resume to continue</h1>
                    <p className="welcome-subtitle">
                        Pick a saved CV from the sidebar on the left, or start a new one using the options below.
                    </p>

                    <div className="empty-state-hint">
                        <LuPanelLeft size={18} />
                        <span>Your resumes are listed in the left menu</span>
                    </div>

                    <div className="empty-state-actions">
                        <button className="btn-primary-large" onClick={() => onSelectMode('ai')}>
                            <LuSparkles /> Build with AI
                        </button>
                        <button className="btn-secondary-large" onClick={() => onSelectMode('manual')}>
                            <LuPenTool /> Manual Setup
                        </button>
                    </div>

                    <div className="trust-badges">
                        <span className="badge-item"><LuFileText size={14} /> Select existing</span>
                        <span className="badge-item">✅ Or create new</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="empty-state-container">
            <div className="empty-state-content">
                <div className="welcome-badge">WELCOME TO CV BUILDER</div>
                <h1 className="welcome-title">Let's create your first professional CV</h1>
                <p className="welcome-subtitle">Select a method to get started. You can either build with AI tailoring or set it up manually.</p>

                <div className="empty-state-actions">
                    <button className="btn-primary-large" onClick={() => onSelectMode('ai')}>
                        <LuSparkles /> Build with AI
                    </button>
                    <button className="btn-secondary-large" onClick={() => onSelectMode('manual')}>
                        <LuPenTool /> Manual Setup
                    </button>
                </div>

                <div className="trust-badges">
                    <span className="badge-item">✅ AI Powered</span>
                    <span className="badge-item">✅ Professional Layouts</span>
                    <span className="badge-item">✅ ATS Friendly</span>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
