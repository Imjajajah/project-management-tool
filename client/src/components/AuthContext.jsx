import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/api';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const serverUrl = import.meta.env.VITE_SERVER_URL;

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
                    Swal.fire({
                        title: 'Success!',
                        text: 'Logged in successfully!',
                        icon: 'success',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false 
                    });
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

    useEffect(() => {
        const initialToken = getToken();
        if (initialToken) {
            handleAuth(initialToken);
        } else {
            setLoading(false);
        }

        const handleMessage = async (event) => {
            if (event.origin === window.location.origin && event.data.type === 'AUTH_SUCCESS') {
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

export default AuthContext;