import React, { useState, useEffect } from 'react';
import { LuLock, LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import './Login.css';

function ResetPassword({ token, onBackToLogin }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setStatus('loading');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message);
                // Redirect to login after 3 seconds
                setTimeout(onBackToLogin, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Server error. Please try again later.');
        }
    };

    return (
        <div className="login-page">
            <div className="cv-paper" style={{ maxWidth: '500px' }}>
                <header style={{ borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>RESET PASSWORD</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Secure your account</p>
                </header>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <span style={{ fontSize: '40px' }}>✅</span>
                        <h3 style={{ color: '#065f46', marginBottom: '10px' }}>Password Reset Successful!</h3>
                        <p style={{ color: '#065f46', fontSize: '14px' }}>{message}</p>
                        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '20px' }}>Redirecting you to login...</p>
                        <button onClick={onBackToLogin} style={{ marginTop: '20px', background: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                            Go to Login Now
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {status === 'error' && (
                            <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>⚠️</span>
                                {message}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <LuLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                    required
                                    minLength="6"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <LuLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={status === 'loading'} style={{
                            background: '#1e293b', color: 'white', padding: '14px', borderRadius: '6px',
                            fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            opacity: status === 'loading' ? 0.7 : 1
                        }}>
                            {status === 'loading' ? <><div className="spinner-small" style={{ width: '15px', height: '15px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> Resetting...</> : 'Update Password'}
                        </button>

                        <button type="button" onClick={onBackToLogin} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                            Back to Login
                        </button>
                    </form>
                )}

                <footer style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                    © 2026 CV Builder Application. Secure Password Reset Portal.
                </footer>
            </div>
        </div>
    );
}

export default ResetPassword;
