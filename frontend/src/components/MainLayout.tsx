'use client';

import React, { ReactNode, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import dynamic from 'next/dynamic';
import CookieConsent from './CookieConsent';
import { Toaster } from 'react-hot-toast';
import ConnectionStatus from './ConnectionStatus';

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

  const handleCookieAccept = () => {
    // Handle cookie acceptance
    console.log('Cookies accepted');
  };

  const handleCookieReject = () => {
    // Handle cookie rejection
    console.log('Cookies rejected');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && (
        <ErrorBoundary fallback={
          <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-50">
            <div className="flex justify-between items-center">
              <a href="/" className="text-xl font-bold text-orange-600">Nairobi Verified</a>
              <a href="/auth/login" className="bg-orange-600 text-white px-4 py-2 rounded-md">Sign In</a>
            </div>
          </div>
        }>
          <Navbar />
        </ErrorBoundary>
      )}
      
      <main className={`flex-grow ${showNavbar ? 'pt-[130px] md:pt-[140px] var(--navbar-height, 140px)' : ''} ${className}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {showFooter && (
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      )}
      
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

      <CookieConsent
        onAccept={handleCookieAccept}
        onReject={handleCookieReject}
      />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          error: {
            duration: 5000,
            style: {
              background: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
            },
          },
        }}
      />
      {/* Only show connection status in production */}
      {process.env.NODE_ENV === 'production' && (
        <ConnectionStatus apiUrl={process.env.NEXT_PUBLIC_API_URL || 'https://nairobi-verified-backend.onrender.com/api'} />
      )}
    </div>
  );
};

export default MainLayout;