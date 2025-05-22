import React, { ReactNode, useEffect } from 'react';
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
  // Add smooth scrolling behavior
  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add a scroll-to-top button functionality
    const handleScroll = () => {
      const scrollButton = document.getElementById('scroll-to-top');
      if (scrollButton) {
        if (window.scrollY > 500) {
          scrollButton.classList.remove('hidden');
          scrollButton.classList.add('flex');
        } else {
          scrollButton.classList.add('hidden');
          scrollButton.classList.remove('flex');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.documentElement.style.scrollBehavior = '';
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      {/* Scroll to top button */}
      <button 
        id="scroll-to-top"
        onClick={scrollToTop}
        className="hidden fixed bottom-6 right-6 z-50 items-center justify-center w-12 h-12 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 focus:outline-none"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default MainLayout;