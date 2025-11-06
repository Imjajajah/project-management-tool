import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword){
            Swal.fire('Error!', 'Password do not match', 'error');
            return;
        }

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
            } else {
                const errorData = await response.json();
                Swal.fire(
                    'Error!', errorData.message || 'Registration failed', 'error'
                );
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70ch' }}>
            <div className="card shadow-lg p-4" style={{ minWidth: '400px' }}>
                <h2 className="card-title text-center mb-4">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="usernameInput" className="form-label d-block text-start">Username</label>
                        <input type="text" id="usernameInput" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required></input>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label d-block text-start">Email address</label>
                        <input type="email" id="emailInput" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label d-block text-start">Password</label>
                        <input type="password" id="passwordInput" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPasswordInput" className="form-label d-block text-start">Confirm password</label>
                        <input type="password" id="confirmPasswordInput" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Register</button>
                </form>
                <div className="text-center mt-3">
                    <Link to="/login">Already have an account? Log in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;