import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { LuMail, LuLock, LuGlobe, LuShieldCheck, LuSparkles, LuEye, LuEyeOff } from "react-icons/lu";
import './Login.css';

function Login() {
    const { login, loginWithEmail, registerWithEmail, loginAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [forgotPasswordStatus, setForgotPasswordStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [error, setError] = useState('');
    const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
    const [isWebView, setIsWebView] = useState(false);

    React.useEffect(() => {
        // Simple check for common in-app browsers that Google blocks
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isAppBrowser = (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1) || (ua.indexOf('Instagram') > -1) || (ua.indexOf('WhatsApp') > -1);
        setIsWebView(isAppBrowser);
        
        const checkStatus = (retries = 10) => {
            fetch(`${import.meta.env.VITE_API_URL}/api/test`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setServerStatus('online');
                    } else {
                        setServerStatus('waking-up');
                        if (retries > 0) setTimeout(() => checkStatus(retries - 1), 3000);
                        else setServerStatus('offline');
                    }
                })
                .catch(() => {
                    setServerStatus('waking-up');
                    if (retries > 0) setTimeout(() => checkStatus(retries - 1), 3000);
                    else setServerStatus('offline');
                });
        };
        checkStatus();
    }, []);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotPasswordStatus('loading');
        setError('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setForgotPasswordStatus('success');
                setForgotPasswordMessage(data.message);
            } else {
                setForgotPasswordStatus('error');
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            setForgotPasswordStatus('error');
            setError('Server error. Please try again later.');
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setAuthLoading(true);
        if (serverStatus === 'offline') {
            setError('Server is not responding. Please wait or refresh the page.');
            setAuthLoading(false);
            return;
        }
        try {
            if (isRegistering) {
                await registerWithEmail(email, password, email.split('@')[0]);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setAuthLoading(false);
        }
    };

    if (isForgotPassword) {
        return (
            <div className="login-page">
                <div className="cv-paper" style={{ maxWidth: '500px' }}>
                    <header style={{ borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', textAlign: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>FORGOT PASSWORD</h1>
                        <p style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recover your access</p>
                    </header>

                    {forgotPasswordStatus === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <span style={{ fontSize: '40px' }}>✅</span>
                            <h3 style={{ color: '#065f46', marginBottom: '10px' }}>Request Received</h3>
                            <p style={{ color: '#065f46', fontSize: '14px', lineHeight: '1.6' }}>{forgotPasswordMessage}</p>
                            <button onClick={() => { setIsForgotPassword(false); setForgotPasswordStatus('idle'); }} style={{ marginTop: '30px', background: '#1e293b', color: 'white', padding: '12px 25px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', margin: 0 }}>
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {error && (
                                <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                                    <strong>⚠️ Error:</strong> {error}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Registered Email</label>
                                <div style={{ position: 'relative' }}>
                                    <LuMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="email"
                                        placeholder="e.g. user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={forgotPasswordStatus === 'loading'} style={{
                                background: '#1e293b', color: 'white', padding: '14px', borderRadius: '6px',
                                fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                opacity: forgotPasswordStatus === 'loading' ? 0.7 : 1
                            }}>
                                {forgotPasswordStatus === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
                            </button>

                            <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                                Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="cv-paper">
                <header style={{ borderBottom: '2px solid #1e293b', paddingBottom: '30px', marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '42px', fontWeight: '800', letterSpacing: '-1px', color: '#0f172a' }}>CV BUILDER</h1>
                    <div style={{ fontSize: '18px', color: '#64748b', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '2px' }}>Authentication Portal</div>
                    <div className="mobile-hide" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LuGlobe size={14} /> cv-builder.app</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LuShieldCheck size={14} /> Secure Access</span>
                    </div>
                </header>

                <div className="login-auth-grid">
                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b', textTransform: 'uppercase' }}>User Authentication</h2>

                            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {error && (
                                    <div style={{ color: '#ef4444', fontSize: '13px', background: '#fef2f2', padding: '12px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                                        <strong>⚠️ Auth Error:</strong><br/>{error}
                                    </div>
                                )}

                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <LuMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="email"
                                            placeholder="e.g. user@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Account Password</label>
                                        <button type="button" onClick={() => setIsForgotPassword(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>Forgot Password?</button>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <LuLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                            {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={authLoading} style={{ background: '#1e293b', color: 'white', padding: '14px', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px', marginTop: '10px', opacity: authLoading ? 0.7 : 1 }}>
                                    {authLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In to Dashboard')}
                                </button>

                                <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                                    {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0', color: '#94a3b8' }}>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }}></div>
                                <span style={{ padding: '0 15px', fontSize: '12px' }}>OR USE GOOGLE</span>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin onSuccess={res => login(res.credential)} onError={() => alert('Login Failed')} theme="filled_black" shape="rectangular" width="100%" />
                            </div>
                        </section>
                    </div>

                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', color: '#1e293b', textTransform: 'uppercase' }}>Platform Tools</h2>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '15px' }}><div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Guided CV Wizard</div><p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Step-by-step guidance to build professional resumes quickly.</p></li>
                                <li style={{ marginBottom: '15px' }}><div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Multiple Templates</div><p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Choose from American, European, and Gulf styles.</p></li>
                            </ul>
                        </section>
                    </div>
                </div>

                <footer style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    © 2026 CV Builder Application. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
}

export default Login;
