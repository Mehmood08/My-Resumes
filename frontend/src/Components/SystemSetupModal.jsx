import React, { useState, useEffect, useCallback } from 'react';
import { LuEye, LuEyeOff, LuSave, LuSettings, LuBot, LuMail, LuLoader } from 'react-icons/lu';
import { MASKED_SENTINEL, isMaskedValue } from '../utils/normalizeEmail';
import { getAuthHeaders, apiFetch } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';

const toFormValue = (config, key) => {
    if (!config) {
        return key === 'GEMINI_MODEL' ? DEFAULT_GEMINI_MODEL : '';
    }
    if (key === 'GEMINI_MODEL') {
        return config.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    }
    return isMaskedValue(config[key]) ? '' : (config[key] || '');
};

const isFieldConfigured = (config, key) => (
    isMaskedValue(config?.[key]) || config?.maskedFields?.includes(key)
);

const FIELD_META = [
    {
        section: 'AI (Gemini API)',
        icon: <LuBot size={15} />,
        fields: [
            {
                key: 'GEMINI_API_KEY',
                label: 'Google Gemini API Key',
                type: 'password',
                placeholder: 'AIza...',
                hint: 'From Google AI Studio. Enter a new key to replace the configured value.',
            },
        ],
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
                hint: (
                    <>
                        Get your free API key at{' '}
                        <a href="https://resend.com" target="_blank" rel="noreferrer"
                            style={{ color: '#818cf8', textDecoration: 'underline' }}>
                            resend.com
                        </a>
                        . Enter a new key to replace the configured value.
                    </>
                ),
            },
            {
                key: 'EMAIL_FROM',
                label: 'From Email Address',
                type: 'email',
                placeholder: 'CV Builder <noreply@yourdomain.com>',
                hint: 'Required when you provide your own Resend API key. Must be a verified domain in Resend.',
            },
        ],
    },
];

const SystemSetupModal = ({ onConfigured, existingConfig = null, onClose, allowClose = true }) => {
    const [form, setForm] = useState(() => ({
        GEMINI_API_KEY: toFormValue(existingConfig, 'GEMINI_API_KEY'),
        GEMINI_MODEL: toFormValue(existingConfig, 'GEMINI_MODEL'),
        RESEND_API_KEY: toFormValue(existingConfig, 'RESEND_API_KEY'),
        EMAIL_FROM: toFormValue(existingConfig, 'EMAIL_FROM'),
    }));

    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    useEffect(() => {
        if (!existingConfig) return;
        setForm({
            GEMINI_API_KEY: toFormValue(existingConfig, 'GEMINI_API_KEY'),
            GEMINI_MODEL: toFormValue(existingConfig, 'GEMINI_MODEL'),
            RESEND_API_KEY: toFormValue(existingConfig, 'RESEND_API_KEY'),
            EMAIL_FROM: toFormValue(existingConfig, 'EMAIL_FROM'),
        });
    }, [existingConfig]);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError('');
        setSuccess('');
    };

    const toggleShowPassword = (key) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchAvailableModels = useCallback(async (apiKey) => {
        setModelsLoading(true);
        setModelsError('');

        try {
            const body = {};
            if (apiKey?.trim() && !isMaskedValue(apiKey)) {
                body.apiKey = apiKey.trim();
            }

            const res = await apiFetch(`${API_URL}/api/config/models`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                setAvailableModels([]);
                setModelsError(data.message || 'Could not load models. Check your API key.');
                return;
            }

            setAvailableModels(data.models || []);
            setForm(prev => {
                if (data.models?.length && !data.models.some(m => m.id === prev.GEMINI_MODEL)) {
                    const preferred = data.models.find(m => m.id === DEFAULT_GEMINI_MODEL) || data.models[0];
                    return { ...prev, GEMINI_MODEL: preferred.id };
                }
                return prev;
            });
        } catch {
            setAvailableModels([]);
            setModelsError('Could not load models. Ensure the backend is running.');
        } finally {
            setModelsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const hasTypedGeminiKey = form.GEMINI_API_KEY?.trim();
            const hasConfiguredGeminiKey = isFieldConfigured(existingConfig, 'GEMINI_API_KEY');

            if (hasTypedGeminiKey) {
                fetchAvailableModels(form.GEMINI_API_KEY);
            } else if (hasConfiguredGeminiKey) {
                fetchAvailableModels(null);
            } else {
                setAvailableModels([]);
                setModelsError('');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [form.GEMINI_API_KEY, existingConfig?.GEMINI_API_KEY, fetchAvailableModels]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const hasNewResendKey = form.RESEND_API_KEY?.trim() && !isMaskedValue(form.RESEND_API_KEY);
        const hasNewFromEmail = form.EMAIL_FROM?.trim() && !isMaskedValue(form.EMAIL_FROM);

        if (hasNewResendKey && !hasNewFromEmail) {
            setError('From Email Address is required when providing your own Resend API key.');
            return;
        }

        const hasChanges = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'RESEND_API_KEY', 'EMAIL_FROM'].some((key) => {
            if (key === 'GEMINI_MODEL') {
                return form.GEMINI_MODEL && form.GEMINI_MODEL !== (existingConfig?.GEMINI_MODEL || DEFAULT_GEMINI_MODEL);
            }
            const nextValue = form[key]?.trim();
            if (!nextValue) return false;
            return !isMaskedValue(nextValue);
        });

        if (!hasChanges) {
            setError('Change at least one setting before saving.');
            return;
        }

        setSaving(true);
        try {
            const res = await apiFetch(`${API_URL}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    GEMINI_MODEL: form.GEMINI_MODEL,
                    GEMINI_API_KEY: form.GEMINI_API_KEY?.trim()
                        || (isFieldConfigured(existingConfig, 'GEMINI_API_KEY') ? MASKED_SENTINEL : ''),
                    RESEND_API_KEY: form.RESEND_API_KEY?.trim()
                        || (isFieldConfigured(existingConfig, 'RESEND_API_KEY') ? MASKED_SENTINEL : ''),
                    EMAIL_FROM: form.EMAIL_FROM?.trim()
                        || (isFieldConfigured(existingConfig, 'EMAIL_FROM') ? MASKED_SENTINEL : ''),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to save configuration.');
            } else {
                setSuccess('Settings saved successfully.');
                if (onConfigured) {
                    setTimeout(() => onConfigured(data.config), 800);
                }
            }
        } catch {
            setError('Network error. Please ensure the backend server is running.');
        } finally {
            setSaving(false);
        }
    };

    const geminiKeyIsConfigured = Boolean(
        form.GEMINI_API_KEY?.trim()
        || isFieldConfigured(existingConfig, 'GEMINI_API_KEY')
    );

    return (
        <div className="setup-modal-overlay">
            <div className="setup-modal">
                <div className="setup-modal-header">
                    <div className="setup-modal-title-group">
                        <div className="setup-modal-icon"><LuSettings size={22} /></div>
                        <div>
                            <h1 className="setup-modal-title">Settings</h1>
                            <p className="setup-modal-subtitle">
                                Existing API keys and email settings are hidden. Enter new values only to replace what is already configured.
                                {existingConfig?.copiedFromUserId && (
                                    <>
                                        <br />
                                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                            Initial values were copied from your inviter. Replace any field to use your own.
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    {allowClose && onClose && (
                        <button className="setup-modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {FIELD_META.map((section) => (
                        <div key={section.section} className="setup-section">
                            <div className="setup-section-header">
                                <span className="setup-section-icon">{section.icon}</span>
                                <h2 className="setup-section-title">{section.section}</h2>
                            </div>

                            <div className="setup-fields-grid">
                                {section.fields.map(field => {
                                    const isConfigured = isFieldConfigured(existingConfig, field.key);
                                    const displayValue = form[field.key] || '';
                                    const displayPlaceholder = isConfigured && !displayValue
                                        ? '•••••••••••• (configured — enter new value to replace)'
                                        : field.placeholder;

                                    return (
                                        <div key={field.key} className="setup-field">
                                            <label className="setup-label" htmlFor={`setup-${field.key}`}>
                                                {field.label}
                                            </label>
                                            <div className="setup-input-wrapper">
                                                <input
                                                    id={`setup-${field.key}`}
                                                    type={field.type === 'password' ? (showPasswords[field.key] ? 'text' : 'password') : field.type}
                                                    className="setup-input"
                                                    placeholder={displayPlaceholder}
                                                    value={displayValue}
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
                                    );
                                })}

                                {section.section === 'AI (Gemini API)' && (
                                    <div className="setup-field">
                                        <label className="setup-label" htmlFor="setup-GEMINI_MODEL">
                                            Gemini Model
                                        </label>
                                        <div className="setup-input-wrapper">
                                            <select
                                                id="setup-GEMINI_MODEL"
                                                className="setup-input setup-select"
                                                value={form.GEMINI_MODEL || DEFAULT_GEMINI_MODEL}
                                                onChange={e => handleChange('GEMINI_MODEL', e.target.value)}
                                                disabled={modelsLoading || !geminiKeyIsConfigured}
                                            >
                                                {modelsLoading && (
                                                    <option value={form.GEMINI_MODEL || DEFAULT_GEMINI_MODEL}>
                                                        Loading models...
                                                    </option>
                                                )}
                                                {!modelsLoading && availableModels.length === 0 && (
                                                    <option value={form.GEMINI_MODEL || DEFAULT_GEMINI_MODEL}>
                                                        {form.GEMINI_MODEL || DEFAULT_GEMINI_MODEL}
                                                    </option>
                                                )}
                                                {!modelsLoading && availableModels.map(model => (
                                                    <option key={model.id} value={model.id}>
                                                        {model.displayName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {modelsError && <p className="setup-hint setup-hint-error">{modelsError}</p>}
                                        {!modelsError && (
                                            <p className="setup-hint">
                                                Choose a model after entering a valid Gemini API key.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {error && <div className="setup-alert setup-alert-error">⚠️ {error}</div>}
                    {success && <div className="setup-alert setup-alert-success">{success}</div>}

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
