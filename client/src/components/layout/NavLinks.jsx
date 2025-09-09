import React from 'react';
import { Link } from 'react-router-dom';

const NavLinks = () => {
    return ( 
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top py-0">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link className="nav-link text-primary me-3 py-2" to="/">
                            <i className="bi bi-house-door-fill me-1"></i> Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-primary me-3 py-2" to="/projects">
                            <i className="bi bi-folder-fill me-1"></i> Projects
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-primary py-2" to="/kanban">
                            <i className="bi bi-list-task me-1"></i> Kanban
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavLinks;