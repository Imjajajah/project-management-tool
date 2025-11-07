import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const passwordRequirements = [
    { regex: /.{8,}/, message: 'Minimum 8 characters' },
    { regex: /[A-Z]/, message: 'At least one uppercase letter' },
    { regex: /[a-z]/, message: 'At least one lowercase letter' },
    { regex: /[0-9]/, message: 'At least one number' },
    { regex: /[^A-Za-z0-9]/, message: 'At least one special character' },
];

const validatePassword = (password) => {
    for (const req of passwordRequirements) {
        if (!req.regex.test(password)) {
            return { valid: false, message: `Password must contain: ${req.message}.` };
        }
    }
    return { valid: true };
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    
    // 💡 NEW STATE: Controls when to show the validation list
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 💡 Ensure validation UI is shown if the user attempts to submit
        setShowPasswordValidation(true); 

        if (password !== confirmPassword){
            Swal.fire('Error!', 'Passwords do not match.', 'error');
            return;
        }

        const validationResult = validatePassword(password);
        if (!validationResult.valid) {
            // Swal.fire is triggered if validation fails
            Swal.fire('Error!', validationResult.message, 'error');
            return;
        }
        
        // 1. Set loading to true immediately
        setIsLoading(true);

        try {
            const response = await fetch(`${serverUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                Swal.fire( 
                    'Success!',
                    'Registration successful. You can now log in.',
                    'success'
                );

                navigate('/login');
            } else {
                const errorData = await response.json();
                Swal.fire(
                    'Error!', errorData.message || 'Registration failed', 'error'
                );
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
        } finally {
            // 2. Set loading back to false regardless of success or failure
            setIsLoading(false); 
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70ch' }}>
            <div className="card shadow-lg p-4" style={{ minWidth: '400px' }}>
                <h2 className="card-title text-center mb-4">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="usernameInput" className="form-label d-block text-start">Username</label>
                        <input type="text" id="usernameInput" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading}></input>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label d-block text-start">Email address</label>
                        <input type="email" id="emailInput" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}></input>
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label d-block text-start">Password</label>
                        <input 
                            type="password" 
                            id="passwordInput" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            // 💡 Trigger display when input is focused or loses focus after typing
                            onFocus={() => setShowPasswordValidation(true)}
                            onBlur={() => setShowPasswordValidation(password.length > 0)}
                            required 
                            disabled={isLoading}
                        />
                        {/* 💡 CONDITIONAL RENDERING based on showPasswordValidation state */}
                        {showPasswordValidation && (
                            <div className="mt-2 p-2 rounded-2 bg-light border text-start small">
                                <p className="fw-bold mb-1">Password Requirements:</p>
                                <ul className="list-unstyled mb-0 ms-2">
                                    {passwordRequirements.map((req, index) => (
                                        <li key={index} className={password.match(req.regex) ? 'text-success' : 'text-danger'}>
                                            <i className={`bi ${password.match(req.regex) ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                            {req.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmPasswordInput" className="form-label d-block text-start">Confirm password</label>
                        <input type="password" id="confirmPasswordInput" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading}/>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Registering...
                            </>
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/login">Already have an account? Log in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;