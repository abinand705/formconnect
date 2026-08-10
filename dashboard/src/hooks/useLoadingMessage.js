import { useState, useEffect } from 'react';

export function useLoadingMessage(isLoading) {
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  useEffect(() => {
    let timeoutId;
    if (isLoading) {
      setLoadingMessage('Loading...');
      timeoutId = setTimeout(() => {
        setLoadingMessage('Waking up the server — this can take up to a minute on first load...');
      }, 4000);
    } else {
      setLoadingMessage('Loading...');
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return loadingMessage;
}
