import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import ProjectPage from './pages/ProjectPage';
import Register from './components/Register';
import Layout from './components/layout/Layout';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
    const { user, loading } = useAuth(); // Destructure loading from useAuth

    // Show a loading spinner while the authentication state is being checked
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    return ( 
        <Router>
            <Layout>
                <Routes>
                    {/* Protected routes that require a logged-in user */}
                    <Route 
                        path="/" 
                        element={user ? <HomePage/> : <Navigate to="/login" replace/>}
                    />
                    <Route 
                        path="/projects" 
                        element={user ? <ProjectPage/> : <Navigate to="/login" replace/>}
                    />
                    
                    {/* Public routes */}
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/> } />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;