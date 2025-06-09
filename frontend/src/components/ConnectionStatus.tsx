import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  apiUrl: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ apiUrl }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Check connection status
  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try to fetch the base API URL instead of a health endpoint that might not exist
      const response = await fetch(`${apiUrl}`, {
        method: 'HEAD',
        signal: controller.signal,
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      setIsOnline(response.ok);
      setIsVisible(!response.ok);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsOnline(false);
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Check connection on mount and when online/offline events fire
  useEffect(() => {
    // Don't check immediately on mount to avoid showing errors during initial load
    const initialCheckTimeout = setTimeout(() => {
      checkConnection();
    }, 10000); // Wait 10 seconds before first check
    
    // Set up event listeners for online/offline status
    const handleOnline = () => {
      checkConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check connection periodically but less frequently
    const intervalId = setInterval(checkConnection, 120000); // Check every 2 minutes
    
    // Auto-hide the notification after 30 seconds if it's shown
    let hideTimeoutId: NodeJS.Timeout;
    if (isVisible) {
      hideTimeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 30000);
    }
    
    return () => {
      clearTimeout(initialCheckTimeout);
      clearTimeout(hideTimeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [apiUrl, isVisible]);

  // Update failed attempts counter
  useEffect(() => {
    if (!isOnline) {
      setFailedAttempts(prev => prev + 1);
    } else {
      setFailedAttempts(0);
    }
  }, [isOnline]);
  
  // Don't show if dismissed or not enough failed attempts
  if (!isVisible || failedAttempts < 2) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fadeIn">
      <div className={`rounded-lg shadow-lg p-4 ${isOnline ? 'bg-yellow-50' : 'bg-red-50'} border ${isOnline ? 'border-yellow-200' : 'border-red-200'}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${isOnline ? 'text-yellow-400' : 'text-red-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${isOnline ? 'text-yellow-800' : 'text-red-800'}`}>
              {isOnline ? 'Limited Connectivity' : 'Connection Issue'}
            </h3>
            <div className={`mt-1 text-xs ${isOnline ? 'text-yellow-700' : 'text-red-700'}`}>
              <p>
                {isOnline 
                  ? 'Some features may be limited due to server connectivity issues.' 
                  : 'Unable to connect to the server. You\'re viewing sample content.'}
              </p>
            </div>
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={() => checkConnection()}
                className={`mr-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md ${
                  isOnline 
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {isChecking ? 'Checking...' : 'Retry'}
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;