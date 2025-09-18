///Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/components/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // This effect handles both initial auth check and updates from a postMessage
    useEffect(() => {
        const handleAuth = async (token) => {
            if (token) {
                try {
                    const profileResponse = await fetch(`${serverUrl}/api/auth/profile`, {
                        headers: { 'x-auth-token': token }
                    });
                    if (profileResponse.ok) {
                        const userData = await profileResponse.json();
                        setToken(token);
                        setUser(userData);
                    } else {
                        removeToken();
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    removeToken();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        // Check for an existing token on app load
        const initialToken = getToken();
        if (initialToken) {
            handleAuth(initialToken);
        } else {
            setLoading(false);
        }

        // Listen for messages from the new Google login tab
        const handleMessage = async (event) => {
            const trustedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
            if (trustedOrigins.includes(event.origin) && event.data.type === 'AUTH_SUCCESS') {
                const { token } = event.data;
                await handleAuth(token);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => window.removeEventListener('message', handleMessage);
    }, [serverUrl]);
    

    const login = (userData, token) => {
        setToken(token);
        setUser(userData);
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    const value = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};