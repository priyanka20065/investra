import { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));

    // Global Socket for Auth Events (like forced logout)
    useEffect(() => {
        if (!token) return;

        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';
        const socket = io(socketUrl, {
            auth: { token }
        });

        socket.on('forced_logout', (data) => {
            alert(data.message || 'Your session has been terminated by another device.');
            logout();
        });

        socket.on('connect_error', (err) => {
            if (err.message === 'Authentication error') {
                console.warn('Socket authentication failed. Logging out.');
                logout();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const login = (userData, token, sessId) => {
        setUser(userData);
        setToken(token);
        setSessionId(sessId);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('sessionId', sessId);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setSessionId(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
    };

    return (
        <AuthContext.Provider value={{ user, token, sessionId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
