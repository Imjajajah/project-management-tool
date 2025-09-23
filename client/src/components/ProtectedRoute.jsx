import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ component: Component }) => {
    const { user } = useAuth();

    if (!user) {
        // User not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the component
    return <Component />;
};

export default ProtectedRoute;