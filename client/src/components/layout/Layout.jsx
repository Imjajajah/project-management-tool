import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';


const Layout = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar/>
            <main className="container-fluid my-4 flex-grow-1 pt-4">
                { children }
            </main>
            <Footer />
        </div>
    );
};

export default Layout;