import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  // Landing page has its own nav + footer built-in
  const isLanding = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isLanding && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isLanding && <Footer />}
    </div>
  );
};

export default Layout;