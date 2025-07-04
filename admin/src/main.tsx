import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App'
import ErrorFallback from './components/ErrorFallback'
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
        console.error('Admin Application Error:', error);
        console.error('Error Info:', errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
