import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  apiUrl: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ apiUrl }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check connection status
  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsOnline(response.ok);
      setIsVisible(!response.ok);
    } catch (error) {
      setIsOnline(false);
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Check connection on mount and when online/offline events fire
  useEffect(() => {
    checkConnection();
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', () => {
      checkConnection();
    });
    
    window.addEventListener('offline', () => {
      setIsOnline(false);
      setIsVisible(true);
    });
    
    // Check connection periodically
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(intervalId);
    };
  }, [apiUrl]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg shadow-lg p-4 ${isOnline ? 'bg-yellow-50' : 'bg-red-50'}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${isOnline ? 'text-yellow-400' : 'text-red-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${isOnline ? 'text-yellow-800' : 'text-red-800'}`}>
              {isOnline ? 'Limited Connectivity' : 'Connection Issue'}
            </h3>
            <div className={`mt-1 text-sm ${isOnline ? 'text-yellow-700' : 'text-red-700'}`}>
              <p>
                {isOnline 
                  ? 'Some features may be limited due to server connectivity issues.' 
                  : 'Unable to connect to the server. You\'re viewing cached content.'}
              </p>
            </div>
            <div className="mt-2 flex">
              <button
                type="button"
                onClick={() => checkConnection()}
                className={`mr-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
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
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
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