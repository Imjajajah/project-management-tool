///Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/pages/AuthCallback.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

const AuthCallback = () => {
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');

        if (token) {
            // Check if there is a window that opened this one.
            if (window.opener) {
                // Use postMessage to securely send the token to the original page.
                window.opener.postMessage({ type: 'AUTH_SUCCESS', token }, window.location.origin);
                // Close the pop-up window after sending the message.
                window.close();
            } else {
                // If this page was opened directly (not in a pop-up), we can't post a message.
                // We'll show a warning and let the user know.
                Swal.fire({
                    title: 'Authentication Complete!',
                    text: 'Please close this window to return to your application.',
                    icon: 'success',
                    showConfirmButton: true,
                });
            }
        } else {
            if (window.opener) {
                Swal.fire({
                    title: 'Authentication Failed!',
                    text: 'Please try logging in again.',
                    icon: 'error',
                    showConfirmButton: true,
                }).then(() => {
                    window.close();
                });
            } else {
                Swal.fire({
                    title: 'Authentication Failed!',
                    text: 'An error occurred during authentication. Please try again.',
                    icon: 'error',
                    showConfirmButton: true,
                });
            }
        }
    }, [location]);

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