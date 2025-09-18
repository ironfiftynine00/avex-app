import { useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface SessionTracker {
  sessionId: string | null;
  startSession: (activityType?: string) => Promise<void>;
  updateActivity: (activityType: string) => Promise<void>;
  endSession: () => Promise<void>;
}

export function useSessionTracking(): SessionTracker {
  const sessionIdRef = useRef<string | null>(null);
  const isTrackingRef = useRef(false);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get device info
  const getDeviceInfo = () => {
    return `${navigator.userAgent} - ${window.screen.width}x${window.screen.height}`;
  };

  const startSession = async (activityType: string = 'general') => {
    if (isTrackingRef.current) return;

    try {
      const sessionId = generateSessionId();
      const deviceInfo = getDeviceInfo();

      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          activityType,
          deviceInfo
        })
      });
      if (!response.ok) throw new Error('Failed to start session');

      sessionIdRef.current = sessionId;
      isTrackingRef.current = true;

      // Update activity every 30 seconds
      activityTimeoutRef.current = setInterval(() => {
        updateActivity(activityType);
      }, 30000);

    } catch (error) {
      console.error('Failed to start session tracking:', error);
    }
  };

  const updateActivity = async (activityType: string) => {
    if (!sessionIdRef.current || !isTrackingRef.current) return;

    try {
      const response = await fetch(`/api/sessions/${sessionIdRef.current}/activity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          activityType,
          pageViews: 1
        })
      });
      if (!response.ok) throw new Error('Failed to update session');
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  };

  const endSession = async () => {
    if (!sessionIdRef.current || !isTrackingRef.current) return;

    try {
      const response = await fetch(`/api/sessions/${sessionIdRef.current}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to end session');

      // Clean up
      if (activityTimeoutRef.current) {
        clearInterval(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }

      sessionIdRef.current = null;
      isTrackingRef.current = false;

    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // Auto-start session on mount and cleanup on unmount
  useEffect(() => {
    startSession();

    // End session on page unload
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // Use sendBeacon for reliable session ending on page unload
        navigator.sendBeacon(
          `/api/sessions/${sessionIdRef.current}/end`,
          JSON.stringify({})
        );
      }
    };

    // Listen for logout events from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout-event') {
        endSession();
      }
    };

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - pause activity tracking
        if (activityTimeoutRef.current) {
          clearInterval(activityTimeoutRef.current);
          activityTimeoutRef.current = null;
        }
      } else {
        // Page visible - resume activity tracking
        if (sessionIdRef.current && isTrackingRef.current) {
          activityTimeoutRef.current = setInterval(() => {
            updateActivity('general');
          }, 30000);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      endSession();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      
      if (activityTimeoutRef.current) {
        clearInterval(activityTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessionId: sessionIdRef.current,
    startSession,
    updateActivity,
    endSession
  };
}