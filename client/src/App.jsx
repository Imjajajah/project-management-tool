import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import ProjectPage from './pages/ProjectPage';
import Register from './components/Register';
import Layout from './components/layout/Layout';
import KanbanPage from './pages/KanbanPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
    const { user, loading } = useAuth();

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
                    {/* Protected routes */}
                    <Route 
                        path="/" 
                        element={user ? <HomePage/> : <Navigate to="/login" replace/>}
                    />
                    <Route 
                        path="/projects" 
                        element={user ? <ProjectPage/> : <Navigate to="/login" replace/>}
                    />
                    {/* The kanban route now accepts a project ID */}
                    <Route path="/kanban/:projectId" element={<ProtectedRoute component={KanbanPage} />} />
                    <Route 
                        path="/kanban" 
                        element={<ProtectedRoute component={KanbanPage} />} 
                    />
                    
                    {/* Public routes */}
                    <Route path="/login" element={<Login/>} />
                    <Route path="/register" element={<Register/> } />

                    {/* This route is essential for handling the Google OAuth redirect */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;