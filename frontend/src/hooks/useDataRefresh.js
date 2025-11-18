import React, { createContext, useContext, useCallback, useRef } from 'react';

// Context for managing data refresh across components
const DataRefreshContext = createContext();

// Provider component
export const DataRefreshProvider = ({ children }) => {
  const refreshCallbacks = useRef({});

  // Register a component's refresh function
  const registerRefresh = useCallback((componentName, refreshFunction) => {
    refreshCallbacks.current[componentName] = refreshFunction;
    console.log(`📋 Registered refresh for ${componentName}`);

    // Return cleanup function
    return () => {
      delete refreshCallbacks.current[componentName];
      console.log(`🧹 Unregistered refresh for ${componentName}`);
    };
  }, []);

  // Trigger refresh for specific components
  const refreshComponents = useCallback((componentNames = []) => {
    console.log(`🔄 Triggering refresh for components:`, componentNames);

    componentNames.forEach(componentName => {
      const refreshFn = refreshCallbacks.current[componentName];
      if (refreshFn) {
        console.log(`✅ Refreshing ${componentName}`);
        refreshFn();
      } else {
        console.log(`⚠️ No refresh function found for ${componentName}`);
      }
    });
  }, []);

  // Refresh all registered components
  const refreshAll = useCallback(() => {
    console.log(`🔄 Triggering refresh for ALL components`);
    Object.entries(refreshCallbacks.current).forEach(([name, refreshFn]) => {
      console.log(`✅ Refreshing ${name}`);
      refreshFn();
    });
  }, []);

  // Check if profile was recently updated and trigger refresh
  const checkForUpdates = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/professor/data-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Data status:', data);

        // Check if data was recently scraped (within last 5 minutes)
        if (data.last_scraped) {
          const lastScraped = new Date(data.last_scraped);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

          if (lastScraped > fiveMinutesAgo) {
            console.log('🆕 Recent data update detected, refreshing components...');
            refreshAll();
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
    }
  }, [refreshAll]);

  const contextValue = {
    registerRefresh,
    refreshComponents,
    refreshAll,
    checkForUpdates
  };

  return (
    <DataRefreshContext.Provider value={contextValue}>
      {children}
    </DataRefreshContext.Provider>
  );
};

// Hook to use the refresh context
export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

// Hook for components to register their refresh function
export const useComponentRefresh = (componentName, refreshFunction) => {
  const { registerRefresh } = useDataRefresh();

  React.useEffect(() => {
    const unregister = registerRefresh(componentName, refreshFunction);
    return unregister;
  }, [componentName, refreshFunction, registerRefresh]);
};

// Hook to trigger refresh after successful operations
export const useRefreshTrigger = () => {
  const { refreshComponents, refreshAll } = useDataRefresh();

  const triggerRefresh = useCallback((response) => {
    if (response && response.refreshRequired) {
      console.log('🔄 API response indicates refresh needed:', response.refreshPages);
      refreshComponents(response.refreshPages);
    }
  }, [refreshComponents]);

  const triggerRefreshAfterSuccess = useCallback((pages = []) => {
    console.log('✅ Operation successful, triggering refresh for:', pages);
    if (pages.length > 0) {
      refreshComponents(pages);
    } else {
      refreshAll();
    }
  }, [refreshComponents, refreshAll]);

  return { triggerRefresh, triggerRefreshAfterSuccess };
};