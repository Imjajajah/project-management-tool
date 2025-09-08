import { useState } from 'react';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const serverUrl = import.meta.env.VITE_SERVER_URL;

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
                Swal.fire('Success!', 'Logged in successfully!', 'success');
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
                </form>
            </div>
        </div>
    );
};

export default Login;