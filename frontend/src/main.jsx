import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const FALLBACK_CLIENT_ID = "1042081648232-0jteg1ui82qc1k1ckid5i08lsmtb3oa6.apps.googleusercontent.com";

function Root() {
  // null = still loading, string = ready
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/config/status`)
      .then(res => res.json())
      .then(data => {
        // Use whatever comes from the server, fall back to hardcoded if empty
        setGoogleClientId(data.googleClientId || FALLBACK_CLIENT_ID);
      })
      .catch(() => {
        // Backend unreachable — use the hardcoded fallback
        setGoogleClientId(FALLBACK_CLIENT_ID);
      });
  }, []);

  // Don't render anything until we have a stable client ID.
  // This prevents GoogleOAuthProvider from being created twice
  // (once with empty string, then again with the real ID), which
  // would break the Google Sign-In callback.
  if (!googleClientId) {
    return null; // or a tiny splash screen if desired
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