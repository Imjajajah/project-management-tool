import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    // This useEffect hook listens for messages from the new window
    // that handles the Google authentication.
    useEffect(() => {
        const handleMessage = (event) => {
            // Ensure the message is from a trusted source (your own app)
            // and is the correct type.
            if (event.origin === window.location.origin && event.data.type === 'AUTH_SUCCESS') {
                const { token } = event.data;
                if (token) {
                    // Use your existing login logic from AuthContext
                    login(null, token); 
                    
                    Swal.fire({
                        title: 'Success!',
                        text: 'Logged in successfully!',
                        icon: 'success',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false 
                    }).then(() => {
                        // After successful login, navigate the user to the home page
                        navigate('/');
                    });
                }
            }
        };

        // Add the event listener when the component mounts
        window.addEventListener('message', handleMessage);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${serverUrl}/api/users/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });

            if (response.ok){
                const data = await response.json();
                login(data.user, data.token);
                Swal.fire({
                    title: 'Success!',
                    text: 'Logged in successfully!',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false 
                }).then(() => {
                   
                    navigate('/');
                });
            } else {
                const errorData = await response.json();
                Swal.fire('Error!', errorData.message || 'Login failed.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            Swal.fire('Error!', 'An error occured. Please try again.', 'error');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="card shadow-lg p-4" style={{ minWidth: '400px' }}>
                <h2 className="card-title text-center mb-4">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label d-block text-start">Email address</label>
                        <input type="email" id="emailInput" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label d-block text-start">Password</label>
                        <input type="password" id="passwordInput" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Log In</button>
                    
                    {/* The button below initiates the Google authentication in a new tab */}
                    <button
                        type="button"
                        onClick={() => window.open(`${serverUrl}/api/auth/google`, '_blank', 'noopener,noreferrer')}
                        className="btn btn-danger w-100 mt-3"
                    >
                        Sign in with Google
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;