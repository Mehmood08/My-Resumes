import React, { useState } from 'react';
import { LuEye, LuEyeOff, LuSave, LuSettings, LuKey, LuBot, LuMail, LuLoader } from 'react-icons/lu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FIELD_META = [
    {
        section: 'JWT Authentication',
        icon: <LuKey size={15} />,

        fields: [
            {
                key: 'JWT_SECRET',
                label: 'JWT Secret Key',
                type: 'password',
                placeholder: 'A long random secret string (32+ chars)...',
                required: true,
                hint: 'Used to sign user session tokens. Use any long, random string.'
            },
        ]
    },
    {
        section: 'AI (Gemini API)',
        icon: <LuBot size={15} />,

        fields: [
            {
                key: 'GEMINI_API_KEY',
                label: 'Google Gemini API Key',
                type: 'password',
                placeholder: 'AIza...',
                required: true,
                hint: 'From Google AI Studio → Get API Key. Required for AI CV scoring and generation.'
            },
        ]
    },
    {
        section: 'Email (Resend)',
        icon: <LuMail size={15} />,

        fields: [
            {
                key: 'RESEND_API_KEY',
                label: 'Resend API Key',
                type: 'password',
                placeholder: 're_xxxxxxxxxxxxxxxxxxxx',
                required: false,
                hint: (
                    <>
                        Get your free API key at{' '}
                        <a href="https://resend.com" target="_blank" rel="noreferrer"
                            style={{ color: '#818cf8', textDecoration: 'underline' }}>
                            resend.com
                        </a>
                        . Required for password reset emails. No SMTP password needed.
                    </>
                )
            },
            {
                key: 'EMAIL_FROM',
                label: 'From Email Address',
                type: 'email',
                placeholder: 'CV Builder <noreply@yourdomain.com>',
                required: false,
                hint: 'The "From" address for sent emails. Must be a verified domain in Resend. Leave blank to use Resend\'s sandbox address (for testing).'
            },
        ]
    }
];

const SystemSetupModal = ({ onConfigured, existingConfig = null, isEditMode = false, onClose, allowClose = true }) => {
    const [form, setForm] = useState(() => ({
        JWT_SECRET:     existingConfig?.JWT_SECRET     || '',
        GEMINI_API_KEY: existingConfig?.GEMINI_API_KEY || '',
        RESEND_API_KEY: existingConfig?.RESEND_API_KEY || '',
        EMAIL_FROM:     existingConfig?.EMAIL_FROM     || '',
    }));

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError('');
        setSuccess('');
    };

    const toggleShowPassword = (key) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.JWT_SECRET?.trim()) {
            setError('JWT Secret Key is required.');
            return;
        }
        if (!form.GEMINI_API_KEY?.trim()) {
            setError('Gemini API Key is required.');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to save configuration.');
            } else {
                setSuccess('✅ System settings saved successfully!');
                if (onConfigured) {
                    setTimeout(() => onConfigured(data.config), 800);
                }
            }
        } catch (err) {
            setError('Network error. Please ensure the backend server is running.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="setup-modal-overlay">
            <div className="setup-modal">
                {/* Header */}
                <div className="setup-modal-header">
                    <div className="setup-modal-title-group">
                        <div className="setup-modal-icon"><LuSettings size={22} /></div>
                        <div>
                            <h1 className="setup-modal-title">
                                {allowClose ? 'System Settings' : '👋 Welcome! Set Up Your App'}
                            </h1>
                            <p className="setup-modal-subtitle">
                                {allowClose
                                    ? 'Update your API keys. Stored securely in MongoDB.'
                                    : 'Before you start, please configure the required API keys below. You can update these later via the ⚙️ gear icon.'
                                }
                                <br />
                                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                    Google OAuth Client ID is managed via the backend <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>.env</code> file.
                                </span>
                            </p>
                        </div>
                    </div>
                    {allowClose && onClose && (
                        <button className="setup-modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="setup-form">
                    {FIELD_META.map((section) => (
                        <div key={section.section} className="setup-section">
                            <div className="setup-section-header">
                                <span className="setup-section-icon">{section.icon}</span>
                                <h2 className="setup-section-title">{section.section}</h2>
                            </div>

                            <div className="setup-fields-grid">
                                {section.fields.map(field => (
                                    <div
                                        key={field.key}
                                        className={`setup-field ${field.type === 'number' ? 'setup-field-narrow' : ''}`}
                                    >
                                        <label className="setup-label" htmlFor={`setup-${field.key}`}>
                                            {field.label}
                                            {field.required && <span className="setup-required">*</span>}
                                        </label>
                                        <div className="setup-input-wrapper">
                                            <input
                                                id={`setup-${field.key}`}
                                                type={field.type === 'password' ? (showPasswords[field.key] ? 'text' : 'password') : field.type}
                                                className="setup-input"
                                                placeholder={field.placeholder}
                                                value={form[field.key] || ''}
                                                onChange={e => handleChange(field.key, e.target.value)}
                                                autoComplete={field.type === 'password' ? 'new-password' : 'off'}
                                            />
                                            {field.type === 'password' && (
                                                <button
                                                    type="button"
                                                    className="setup-eye-btn"
                                                    onClick={() => toggleShowPassword(field.key)}
                                                    aria-label={showPasswords[field.key] ? 'Hide' : 'Show'}
                                                >
                                                    {showPasswords[field.key] ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                                                </button>
                                            )}
                                        </div>
                                        {field.hint && <p className="setup-hint">{field.hint}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Feedback */}
                    {error   && <div className="setup-alert setup-alert-error">⚠️ {error}</div>}
                    {success && <div className="setup-alert setup-alert-success">{success}</div>}

                    {/* Actions */}
                    <div className="setup-actions">
                        {allowClose && onClose && (
                            <button type="button" className="setup-cancel-btn" onClick={onClose}>Cancel</button>
                        )}
                        <button type="submit" className="setup-save-btn" disabled={saving}>
                            {saving
                                ? <><LuLoader size={15} className="setup-spinner-icon" /> Saving...</>
                                : <><LuSave size={15} /> Save Settings</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SystemSetupModal;
