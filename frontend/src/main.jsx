import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Root() {
  // null = fetching, '' = backend down/not set, string = ready
  const [googleClientId, setGoogleClientId] = useState(null);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/config/status`)
      .then(res => res.json())
      .then(data => {
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        } else {
          setFetchError('GOOGLE_CLIENT_ID is not set in the backend .env file.');
          setGoogleClientId('');
        }
      })
      .catch(() => {
        setFetchError('Cannot reach the backend server. Please ensure it is running.');
        setGoogleClientId('');
      });
  }, []);

  // Wait until the fetch resolves — prevents GoogleOAuthProvider mounting twice
  if (googleClientId === null) {
    return null;
  }

  // Backend is reachable but GOOGLE_CLIENT_ID is missing — show a clear error
  if (!googleClientId) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', background: '#0f0f13',
        color: '#f87171', fontFamily: 'Inter, sans-serif', gap: '12px',
        padding: '24px', textAlign: 'center'
      }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <h2 style={{ margin: 0, fontSize: 18, color: '#fca5a5' }}>Configuration Missing</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', maxWidth: 420 }}>
          {fetchError}
        </p>
        <code style={{
          background: 'rgba(255,255,255,0.06)', padding: '8px 16px',
          borderRadius: 8, fontSize: 13, color: '#a5b4fc'
        }}>
          GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
        </code>
      </div>
    );
  }

  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<Root />);