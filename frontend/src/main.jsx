import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Root() {
  // null = fetching, '' = not ready, string = ready
  const [googleClientId, setGoogleClientId] = useState(null);
  const [startupError, setStartupError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/config/status`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('backend_unavailable');
        }
        const data = await res.json();
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
          setStartupError(null);
        } else {
          setGoogleClientId('');
          setStartupError({
            type: 'config',
            title: 'Configuration Missing',
            message: 'GOOGLE_CLIENT_ID is not set in the backend .env file.',
          });
        }
      })
      .catch(() => {
        setGoogleClientId('');
        setStartupError({
          type: 'backend',
          title: 'Backend Unavailable',
          message: 'Cannot reach the backend server. Please ensure it is running.',
        });
      });
  }, []);

  if (googleClientId === null) {
    return null;
  }

  if (!googleClientId && startupError) {
    const isBackendDown = startupError.type === 'backend';

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0f0f13',
        color: '#f87171', fontFamily: 'Inter, sans-serif', gap: '12px',
        padding: '24px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 32 }}>{isBackendDown ? '🔌' : '⚠️'}</div>
        <h2 style={{ margin: 0, fontSize: 18, color: '#fca5a5' }}>{startupError.title}</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', maxWidth: 420 }}>
          {startupError.message}
        </p>
        {isBackendDown ? (
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280', maxWidth: 420 }}>
            Start the backend server, then refresh this page.
            <br />
            Expected API URL: <code style={{ color: '#a5b4fc' }}>{API_URL}</code>
          </p>
        ) : (
          <code style={{
            background: 'rgba(255,255,255,0.06)', padding: '8px 16px',
            borderRadius: 8, fontSize: 13, color: '#a5b4fc'
          }}>
            GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
          </code>
        )}
      </div>
    );
  }

  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <App />
          <Analytics />
        </AuthProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
