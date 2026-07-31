import React, { useState } from 'react';
import { LuX, LuUserPlus, LuMail, LuLoader } from 'react-icons/lu';
import normalizeEmail from '../utils/normalizeEmail';
import './InviteModal.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function InviteModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleClose = () => {
        setEmail('');
        setStatus('idle');
        setMessage('');
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setStatus('loading');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/invites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: normalizeEmail(email) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send invitation.');

            setStatus('success');
            setMessage(data.message);
            setEmail('');
        } catch (err) {
            setStatus('error');
            setError(err.message || 'Failed to send invitation.');
        }
    };

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
                        <h2>Invite User</h2>
                        <p>Send an email invitation so they can register and use your app settings. Send again to the same email to resend.</p>
                    </div>
                </div>

                {status === 'success' ? (
                    <div className="invite-modal-success">
                        <p>{message}</p>
                        <button type="button" className="invite-modal-submit" onClick={handleClose}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="invite-modal-form">
                        <label htmlFor="invite-email">Email address</label>
                        <div className="invite-modal-input-wrap">
                            <LuMail size={16} />
                            <input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="invite-modal-error">{error}</p>}

                        <button type="submit" className="invite-modal-submit" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <><LuLoader size={16} className="invite-spinner" /> Sending...</>
                            ) : (
                                <><LuUserPlus size={16} /> Send Invitation</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
