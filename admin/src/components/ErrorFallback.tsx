interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isDeploymentError = 
    error.message.includes('Loading chunk') ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('Loading CSS chunk') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError') ||
    error.name === 'ChunkLoadError';

  const handleRefresh = () => {
    if (isDeploymentError) {
      window.location.reload();
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {isDeploymentError ? 'Loading Error' : 'Something went wrong'}
        </h2>
        
        {isDeploymentError ? (
          <div className="text-center text-gray-600 mb-6">
            <p className="mb-2">
              The admin dashboard failed to load properly. This might be due to a recent deployment.
            </p>
            <p className="text-sm">
              Please refresh the page to get the latest version.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              An error occurred while loading the admin dashboard.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          </div>
        )}
        
        <div className="flex justify-center">
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {isDeploymentError ? 'Refresh Page' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
