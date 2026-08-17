import React, { useState } from 'react';
import { LuMessageSquare, LuLoader, LuCheck } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/cvValidation';
import { apiFetch } from '../utils/api';
import './EmptyState.css';
import './Feedback.css';

function FeedbackStatusView({ title, message }) {
  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <div className="feedback-success-icon">
          <LuCheck size={32} />
        </div>
        <h1 className="welcome-title">{title}</h1>
        <p className="welcome-subtitle">{message}</p>
      </div>
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!trimmedMessage) {
      setError('Please enter your feedback message.');
      return;
    }

    setStatus('loading');

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: subject.trim() || undefined,
          message: trimmedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send feedback.');
      }

      setStatus('success');
      setSuccessMessage(data.message || 'Thank you! Your feedback has been sent.');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Failed to send feedback. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <FeedbackStatusView
        title="Feedback sent"
        message={successMessage}
      />
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-content">
        <div className="welcome-badge">FEEDBACK</div>
        <h1 className="welcome-title">We'd love to hear from you</h1>
        <p className="welcome-subtitle">
          Have a suggestion, found a bug, or just want to say hello? Your feedback helps us improve.
        </p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-field">
            <label htmlFor="feedback-name">Your name <span className="feedback-required">*</span></label>
            <input
              id="feedback-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              required
              disabled={status === 'loading'}
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-email">Your email <span className="feedback-required">*</span></label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={254}
              required
              disabled={status === 'loading'}
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-subject">Subject</label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              maxLength={200}
              disabled={status === 'loading'}
            />
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-message">Message <span className="feedback-required">*</span></label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={6}
              maxLength={5000}
              required
              disabled={status === 'loading'}
            />
          </div>

          {error && <p className="feedback-error">{error}</p>}

          <div className="feedback-form-actions">
            <button type="submit" className="btn-primary-large" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <LuLoader size={18} className="feedback-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <LuMessageSquare size={18} />
                  Submit feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
