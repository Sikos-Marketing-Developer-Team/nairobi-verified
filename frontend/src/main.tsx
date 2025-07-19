// Polyfill for older browsers/deployment environments
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// Force rebuild to fix createContext error - v3 URGENT FIX
console.log('🚀 Nairobi Verified - Build v3.0');
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.tsx'
import ErrorFallback from './components/ErrorFallback.tsx'
import './index.css'

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
