import React from 'react';
import { Link } from 'react-router-dom';

const NavLinks = () => {
    
    // FUNCTION TO GET THE LATEST URL
    const getKanbanUrl = () => {
        const lastProjectId = localStorage.getItem('lastKanbanProjectId');
        return lastProjectId ? `/kanban/${lastProjectId}` : '/kanban';
    };

    return ( 
        // Navbar Setup: Still permanently horizontal, uses a light theme.
        <nav className="navbar navbar-light bg-light shadow-sm sticky-top py-0">
            <div className="container-fluid">
                
                {/* Brand/Title Removed Here */}

                {/* Links: Uses 'mx-auto' to center the links in the absence of a brand */}
                <ul className="navbar-nav d-flex flex-row mx-auto">
                    
                    <li className="nav-item">
                        <Link 
                            className="nav-link text-dark py-2 ps-3 pe-3" 
                            aria-current="page" 
                            to="/"
                        >
                            <i className="bi bi-house-door-fill me-1"></i> Home
                        </Link>
                    </li>
                    
                    <li className="nav-item">
                        <Link 
                            className="nav-link text-dark py-2 ps-3 pe-3" 
                            to="/projects"
                        >
                            <i className="bi bi-folder-fill me-1"></i> Projects
                        </Link>
                    </li>
                    
                    <li className="nav-item">
                        <Link 
                            className="nav-link text-dark py-2 ps-3 pe-3" 
                            to={getKanbanUrl()}
                        >
                            <i className="bi bi-list-task me-1"></i> Kanban
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavLinks;