import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

const MainLayout = ({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  className = ''
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;