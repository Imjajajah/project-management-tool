import React from 'react';
import Header from './Header';
import NavLinks from './NavLinks';
import Footer from './Footer';
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isPublicPage = location.pathname === '/Login' || location.pathname === '/register';
    const shouldShowNavLinks = user && !isPublicPage;

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="sticky-top">
                <Header/>
                {shouldShowNavLinks && <NavLinks />}
            </div>
            <main className="container-fluid my-4 flex-grow-1 d-flex flex-column h-100 px-3 px-md-5">
                { children }
            </main>
            <Footer />
        </div>
    );
};

export default Layout;