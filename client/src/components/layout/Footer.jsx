import React from 'react';

const Footer = () => {
    return ( 
        <footer className="bg-dark text-white py-2 mt-5 fixed-bottom">
            <div className="container d-flex justify-content-center align-items-center">
                <p className="mb-0 small">&copy; {new Date().getFullYear()} Project Management Tool</p>
            </div>
        </footer>
    );
};

export default Footer;