import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Swal from 'sweetalert2';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    
    useEffect(() => {
        const handleGoogleLogin = async () => {
            const query = new URLSearchParams(location.search);
            const token = query.get('token');

            if (token) {
                try {
                    const profileResponse = await fetch(`${serverUrl}/api/auth/profile`, {
                        headers: { 'x-auth-token': token }
                    });
                    
                    if (profileResponse.ok) {
                        const userData = await profileResponse.json();
                        login(userData, token);
                        
                        Swal.fire({
                            title: 'Success!',
                            text: 'Logged in successfully!',
                            icon: 'success',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false 
                        }).then(() => {
                            // After successful login and UI notification, redirect
                            navigate('/', { replace: true });
                        });
                    } else {
                        throw new Error('Failed to fetch user profile.');
                    }
                } catch (error) {
                    console.error("Error during Google login:", error);
                    Swal.fire('Error!', 'An error occurred during Google login. Please try again.', 'error');
                    navigate('/login', { replace: true });
                }
            } else {
                // If no token, redirect to the login page
                navigate('/login', { replace: true });
            }
        };

        handleGoogleLogin();
    }, [location.search, navigate, login, serverUrl]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div> 
            <p className="ms-3">Logging in...</p>
        </div>
    );
};

export default AuthCallback;