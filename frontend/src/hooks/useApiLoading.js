import { useState } from 'react';

export const useApiLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithLoading = async (apiCall, options = {}) => {
    const {
      showGlobalLoader = true,
      successMessage,
      errorMessage = 'An error occurred'
    } = options;

    try {
      if (showGlobalLoader) {
        setIsLoading(true);
      }
      setError(null);

      const result = await apiCall();

      if (successMessage) {
        // You could show a success toast here
        console.log(successMessage);
      }

      return result;
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || errorMessage);

      // You could show an error toast here
      throw err;
    } finally {
      if (showGlobalLoader) {
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    error,
    executeWithLoading,
    setIsLoading,
    setError
  };
};