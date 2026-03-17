import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { LuMail, LuLock, LuGlobe, LuShieldCheck, LuSparkles } from "react-icons/lu";
import './Login.css';

function Login() {
    const { login, loginWithEmail, registerWithEmail, loginAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
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

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        // Block login ONLY if definitively offline
        if (serverStatus === 'offline') {
            setError('Server is not responding. Please wait or refresh the page.');
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
        }
    };

    return (
        <div className="login-page">
            {/* The "CV Paper" */}
            <div className="cv-paper">

                {/* CV Header */}
                <header style={{
                    borderBottom: '2px solid #1e293b',
                    paddingBottom: '30px',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '42px',
                        fontWeight: '800',
                        letterSpacing: '-1px',
                        color: '#0f172a'
                    }}>CV BUILDER</h1>
                    <div style={{
                        fontSize: '18px',
                        color: '#64748b',
                        marginTop: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>Authentication Portal & Resume Manager</div>

                    <div className="mobile-hide" style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px',
                        fontSize: '13px',
                        color: '#475569'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <LuGlobe size={14} /> cv-builder.app
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <LuShieldCheck size={14} /> Secure Access
                        </span>
                    </div>
                </header>

                <div className="login-auth-grid">
                    {/* Main Content Area (Left) */}
                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                borderBottom: '1px solid #e2e8f0',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                                color: '#1e293b',
                                textTransform: 'uppercase'
                            }}>User Authentication</h2>

                            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {isWebView && (
                                    <div style={{ 
                                        color: '#854d0e', 
                                        fontSize: '13px', 
                                        background: '#fefce8', 
                                        padding: '12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid #fef08a',
                                        marginBottom: '10px'
                                    }}>
                                        ⚠️ <strong>Note:</strong> In-app browsers (like Facebook/Instagram/WhatsApp) might not support Google Sign-in. Please open this link in <strong>Chrome</strong> or <strong>Safari</strong> if login fails.
                                    </div>
                                )}
                                {serverStatus === 'waking-up' && (

                                    <div style={{ 
                                        color: '#0369a1', 
                                        fontSize: '13px', 
                                        background: '#f0f9ff', 
                                        padding: '12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid #bae6fd',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div className="spinner-small" style={{ width: '15px', height: '15px', border: '2px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        Connecting to Server... (Waking up)
                                    </div>
                                )}
                                {serverStatus === 'offline' && (
                                    <div style={{ 
                                        color: '#b91c1c', 
                                        fontSize: '13px', 
                                        background: '#fee2e2', 
                                        padding: '12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid #fecaca',
                                        fontWeight: '600'
                                    }}>
                                        ⚠️ SERVER UNREACHABLE: We are having trouble connecting to the backend. Please try again in a minute.
                                    </div>
                                )}
                                {error && (
                                    <div style={{ 
                                        color: '#ef4444', 
                                        fontSize: '13px', 
                                        background: '#fef2f2', 
                                        padding: '12px', 
                                        borderRadius: '6px', 
                                        border: '1px solid #fee2e2',
                                        lineHeight: '1.4'
                                    }}>
                                        <strong>⚠️ Auth Error:</strong><br/>
                                        {error}
                                    </div>
                                )}

                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <LuMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="email"
                                            placeholder="e.g. user@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                                fontSize: '14px', outline: 'none'
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                        Account Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <LuLock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            style={{
                                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                                fontSize: '14px', outline: 'none'
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" style={{
                                    background: '#1e293b', color: 'white', padding: '14px', borderRadius: '6px',
                                    fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px',
                                    marginTop: '10px'
                                }}>
                                    {isRegistering ? 'Create Account' : 'Sign In to Dashboard'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    style={{
                                        background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
                                        cursor: 'pointer', textDecoration: 'underline'
                                    }}
                                >
                                    {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0', color: '#94a3b8' }}>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }}></div>
                                <span style={{ padding: '0 15px', fontSize: '12px' }}>OR USE GOOGLE</span>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }}></div>
                            </div>

                            <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center' }}>
                                <GoogleLogin
                                    onSuccess={credentialResponse => {
                                        login(credentialResponse.credential);
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                        alert('Google Login Failed');
                                    }}
                                    theme="filled_black"
                                    shape="rectangular"
                                    width="100%"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={loginAsGuest}
                                style={{
                                    display: 'block', margin: '20px auto 0',
                                    background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px',
                                    padding: '10px 20px', fontSize: '12px', fontWeight: '600', color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                Continue as Guest (Skip Login)
                            </button>
                        </section>
                    </div>

                    {/* Sidebar Area (Right) */}
                    <div>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                borderBottom: '1px solid #e2e8f0',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                                color: '#1e293b',
                                textTransform: 'uppercase'
                            }}>Platform Tools</h2>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Guided CV Wizard</div>
                                    <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Step-by-step guidance to build professional resumes quickly.</p>
                                </li>
                                <li style={{ marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Multiple Templates</div>
                                    <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Choose from American, European, and Gulf styles.</p>
                                </li>
                                <li style={{ marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>Optimized Formatting</div>
                                    <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#64748b' }}>Enhanced formatting suggestions for better results.</p>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 style={{
                                fontSize: '18px',
                                borderBottom: '1px solid #e2e8f0',
                                paddingBottom: '10px',
                                marginBottom: '20px',
                                color: '#1e293b',
                                textTransform: 'uppercase'
                            }}>Privacy Policy</h2>
                            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                                Your data is protected with industry-standard encryption. We never share your personal information or CV contents with third parties without your consent.
                            </p>
                        </section>
                    </div>
                </div>

                {/* CV Footer */}
                <footer style={{
                    marginTop: 'auto',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#94a3b8'
                }}>
                    © 2026 CV Builder Application. All Rights Reserved. Professional Tool for Career Growth.
                </footer>
            </div>
        </div>
    );
}

export default Login;
