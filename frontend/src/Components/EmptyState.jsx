import React from 'react';
import { LuPlus, LuSparkles, LuPenTool } from 'react-icons/lu';
import './EmptyState.css';

const EmptyState = ({ onSelectMode }) => {
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
