import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <i className="bi bi-house-door-fill me-1"></i>
                    <b className="ms-1">Project Management Tool</b>
                </Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        {user ? (
                            <>
                                <li className="nav-item me-3">
                                    <span className="nav-link text-white">Welcome, {user.username} </span>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-danger" onClick={logout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light me-2" to="/Login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-primary" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
