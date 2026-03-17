import React, { createContext, useContext, useState, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // 1. Initialize State from LocalStorage (Persist login on refresh)
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        return savedToken && savedUser ? JSON.parse(savedUser) : null;
    });

    // 2. Login Function: Called when Google Sign-In is successful
    const login = async (googleCredential) => {
        try {
            // A. Send the Google Token to OUR Backend
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleCredential })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }


            // B. Get the Session Token & User Info from Backend
            const data = await res.json();

            // C. Save to LocalStorage (so you stay logged in)
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Save user details

            // D. Update App State
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Auth Failed:", err);
            return false;
        }
    };

    // 2b. Email/Password Login
    const loginWithEmail = async (email, password) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Email Login Failed:", err);
            throw err;
        }
    };

    // 2c. Email/Password Register
    const registerWithEmail = async (email, password, name) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return true;
        } catch (err) {
            console.error("Registration Failed:", err);
            throw err;
        }
    };

    // 2d. Guest Login (Local Only)
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

    // 3. Logout Function
    const logout = () => {
        googleLogout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // 4. Helper function to get consistent user ID (works for both Google and email/password users)
    const getUserId = useCallback(() => {
        if (!user) return null;
        // Use googleId if available, otherwise fallback to _id (for backward compatibility)
        return user.googleId || user._id || null;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithEmail, registerWithEmail, loginAsGuest, getUserId }}>
            {children}
        </AuthContext.Provider>
    );
};
