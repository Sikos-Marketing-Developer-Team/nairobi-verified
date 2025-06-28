import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" style={{ 
      padding: '20px', 
      backgroundColor: '#fee2e2', 
      border: '1px solid #dc2626', 
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Something went wrong:</h2>
      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        fontSize: '14px', 
        backgroundColor: '#fff',
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto'
      }}>
        {error.message}
      </pre>
      <details style={{ marginTop: '10px' }}>
        <summary style={{ cursor: 'pointer', color: '#dc2626' }}>Error Stack</summary>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          fontSize: '12px', 
          backgroundColor: '#f9f9f9',
          padding: '10px',
          borderRadius: '4px',
          marginTop: '5px',
          overflow: 'auto'
        }}>
          {error.stack}
        </pre>
      </details>
      <button 
        onClick={resetErrorBoundary}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}

export default ErrorFallback;
