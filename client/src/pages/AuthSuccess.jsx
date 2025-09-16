import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');

        if (token) {
            // Use window.opener to send the token back to the original window
            if (window.opener) {
                window.opener.postMessage({ type: 'AUTH_SUCCESS', token }, window.location.origin);
            }
            // Then, close the new tab
            window.close();
        } else {
            // If no token, and it's a new tab, close it. Otherwise, navigate back.
            if (window.opener) {
                window.close();
            } else {
                navigate('/login');
            }
        }
    }, [location]);

    return <div>Logging in...</div>
};

export default AuthSuccess;

