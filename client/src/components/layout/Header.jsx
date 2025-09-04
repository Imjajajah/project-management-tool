import React from 'react';
import { Link  } from 'react-router-dom';

const Header = () => {
    return (
        <header className ="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <i className="bi bi-house-door-fill me-1"></i>
                    <b className="ms-1">Project Management Tool</b>
                    
                </Link>
            </div>
        </header>
    );
};

export default Header;