import { useState, useEffect, useRef } from 'react';

// Manages the worker's UI state machine for the Job Matches dashboard.
 
export function useWorkerStatus(countdownRemaining) {
  const [uiState, setUiState] = useState('offline');
  const matchTimerRef = useRef(null);
  // Auto-expire incoming match if worker doesn't respond in time
  useEffect(() => {
    if (uiState === 'incoming' && countdownRemaining === 0) {
      setUiState('waiting');
    }
  }, [countdownRemaining, uiState]);

  // When online and waiting, simulate a match arriving after a short delay.
  useEffect(() => {
    if (uiState === 'waiting') {
      matchTimerRef.current = setTimeout(() => {
        setUiState('incoming');
      }, 3000);
    }
    return () => {
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    };
  }, [uiState]);

  return {
    uiState,
    goOnline:    () => setUiState('waiting'),
    goOffline:   () => { clearTimeout(matchTimerRef.current); setUiState('offline'); },
    acceptJob:   () => setUiState('active'),
    declineJob:  () => setUiState('waiting'),
    completeJob: () => setUiState('waiting'),
  };
}