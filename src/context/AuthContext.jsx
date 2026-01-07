import React, { createContext, useContext, useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

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
            const res = await fetch('http://localhost:3001/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleCredential })
            });

            if (!res.ok) throw new Error('Login failed');

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

    // 3. Logout Function
    const logout = () => {
        googleLogout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
