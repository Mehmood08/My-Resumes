import React, { createContext, useContext, useState, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import normalizeEmail from '../utils/normalizeEmail';

const AuthContext = createContext();
const AUTH_TIMEOUT_MS = 15000;

export const useAuth = () => useContext(AuthContext);

async function authFetch(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = {};
        }

        if (!res.ok) {
            const message = data.message
                || (res.status === 503
                    ? 'Database is unavailable. Please try again in a moment.'
                    : 'Authentication failed');
            throw new Error(message);
        }

        return data;
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. The server or database may be unavailable.');
        }
        if (err.message === 'Failed to fetch') {
            throw new Error('Cannot reach the server. Check your connection and try again.');
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        return savedToken && savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (googleCredential, inviteToken = null) => {
        try {
            const data = await authFetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: googleCredential,
                    inviteToken: inviteToken || undefined,
                }),
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Auth Failed:", err);
            throw err;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const data = await authFetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalizeEmail(email), password }),
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Email Login Failed:", err);
            throw err;
        }
    };

    const registerWithEmail = async (email, password, name, confirmPassword, inviteToken = null) => {
        try {
            const normalizedEmail = normalizeEmail(email);
            const data = await authFetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: normalizedEmail,
                    password,
                    confirmPassword,
                    name,
                    inviteToken: inviteToken || undefined,
                }),
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Registration Failed:", err);
            throw err;
        }
    };

    const loginAsGuest = () => {
        const guestUser = {
            _id: 'guest_user_id',
            googleId: 'guest_user_id',
            name: 'Guest User',
            email: 'guest@example.com',
            picture: null,
            isGuest: true
        };
        localStorage.setItem('user', JSON.stringify(guestUser));
        localStorage.setItem('token', 'guest-token');
        setUser(guestUser);
    };

    const logout = () => {
        googleLogout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const getUserId = useCallback(() => {
        if (!user) return null;
        return user.googleId || user._id || null;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithEmail, registerWithEmail, loginAsGuest, getUserId }}>
            {children}
        </AuthContext.Provider>
    );
};
