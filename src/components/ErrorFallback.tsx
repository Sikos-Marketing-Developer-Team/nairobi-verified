import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Enhanced error handling for deployment issues
  const isDeploymentError = 
    error.message.includes('Loading chunk') ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('Loading CSS chunk') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.name === 'ChunkLoadError';

  const handleRefresh = () => {
    if (isDeploymentError) {
      // For deployment errors, do a full page refresh
      window.location.reload();
    } else {
      // For other errors, try the reset function
      resetErrorBoundary();
    }
  };

  return (
    <div role="alert" style={{ 
      padding: '20px', 
      backgroundColor: '#fee2e2', 
      border: '1px solid #dc2626', 
      borderRadius: '8px',
      margin: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '10px', textAlign: 'center' }}>
          {isDeploymentError ? 'Loading Error' : 'Something went wrong'}
        </h2>
        
        {isDeploymentError ? (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#6b7280', marginBottom: '10px' }}>
              The application failed to load properly. This might be due to a recent deployment.
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Please refresh the page to get the latest version.
            </p>
          </div>
        ) : (
          <>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '14px', 
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
              marginBottom: '10px'
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
          </>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={handleRefresh}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {isDeploymentError ? 'Refresh Page' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
