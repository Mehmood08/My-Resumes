import React, { useState } from 'react';
import { LuX, LuUserPlus, LuMail, LuLoader } from 'react-icons/lu';
import normalizeEmail, { parseEmailList } from '../utils/normalizeEmail';
import './InviteModal.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const MAX_BULK_INVITES = 25;

export default function InviteModal({ isOpen, onClose }) {
    const [emailsInput, setEmailsInput] = useState('');
    const [status, setStatus] = useState('idle');
    const [summaryMessage, setSummaryMessage] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const parsedEmails = parseEmailList(emailsInput);
    const emailCount = parsedEmails.length;

    const handleClose = () => {
        setEmailsInput('');
        setStatus('idle');
        setSummaryMessage('');
        setResults([]);
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSummaryMessage('');
        setResults([]);

        if (!emailCount) {
            setError('Enter at least one valid email address.');
            return;
        }

        if (emailCount > MAX_BULK_INVITES) {
            setError(`You can invite up to ${MAX_BULK_INVITES} emails at a time.`);
            return;
        }

        setStatus('loading');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/invites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ emails: parsedEmails }),
            });
            const data = await res.json();

            if (!res.ok && !data.results) {
                throw new Error(data.message || 'Failed to send invitations.');
            }

            if (data.results) {
                setResults(data.results);
                setSummaryMessage(data.message || 'Invitations processed.');
                setStatus(data.failed ? 'partial' : 'success');
                if (!data.sent) {
                    setError(data.message || 'No invitations were sent.');
                }
                return;
            }

            setStatus('success');
            setSummaryMessage(data.message || 'Invitation sent.');
            setResults([{
                email: parsedEmails[0],
                success: true,
                message: data.message,
            }]);
            setEmailsInput('');
        } catch (err) {
            setStatus('error');
            setError(err.message || 'Failed to send invitations.');
        }
    };

    const isLoading = status === 'loading';
    const showResults = status === 'success' || status === 'partial';

    return (
        <div className="invite-modal-overlay" onClick={handleClose}>
            <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="invite-modal-close" onClick={handleClose} aria-label="Close">
                    <LuX size={20} />
                </button>

                <div className="invite-modal-header">
                    <div className="invite-modal-icon">
                        <LuUserPlus size={22} />
                    </div>
                    <div>
                        <h2>Invite Users</h2>
                        <p>Send email invitations so others can register with your shared app configuration.</p>
                    </div>
                </div>

                {showResults ? (
                    <div className="invite-modal-success">
                        <p>{summaryMessage}</p>
                        {results.length > 0 && (
                            <ul className="invite-modal-results">
                                {results.map((result) => (
                                    <li
                                        key={result.email}
                                        className={result.success ? 'invite-result-success' : 'invite-result-error'}
                                    >
                                        <strong>{result.email}</strong>
                                        <span>{result.message}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button type="button" className="invite-modal-submit" onClick={handleClose}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="invite-modal-form">
                        <label htmlFor="invite-emails">Email addresses</label>
                        <div className="invite-modal-textarea-wrap">
                            <LuMail size={16} className="invite-modal-textarea-icon" />
                            <textarea
                                id="invite-emails"
                                placeholder={'colleague@example.com\nfriend@example.com, teammate@example.com'}
                                value={emailsInput}
                                onChange={(e) => setEmailsInput(e.target.value)}
                                rows={5}
                                required
                            />
                        </div>
                        <p className="invite-modal-hint">
                            Separate emails with commas, semicolons, or new lines. Up to {MAX_BULK_INVITES} at a time.
                            {emailCount > 0 && ` (${emailCount} detected)`}
                        </p>

                        {error && <p className="invite-modal-error">{error}</p>}

                        <button type="submit" className="invite-modal-submit" disabled={isLoading}>
                            {isLoading ? (
                                <><LuLoader size={16} className="invite-spinner" /> Sending...</>
                            ) : (
                                <><LuUserPlus size={16} /> {emailCount > 1 ? `Send ${emailCount} Invitations` : 'Send Invitation'}</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
