import React, { useState, useEffect } from 'react';
import { useDataRefresh } from '../hooks/useDataRefresh';

const RefreshNotification = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const { checkForUpdates } = useDataRefresh();

  // Check for updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, 30000); // Check every 30 seconds

    // Initial check
    checkForUpdates();

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Listen for data refresh events
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check for updates one more time before page unload
      checkForUpdates();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [checkForUpdates]);

  // Show refresh notification
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'dataLastUpdated') {
        setIsRefreshing(true);
        setLastRefreshTime(new Date());

        // Hide notification after 3 seconds
        setTimeout(() => {
          setIsRefreshing(false);
        }, 3000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isRefreshing) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <span>Data updated! Refreshing tables...</span>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default RefreshNotification;