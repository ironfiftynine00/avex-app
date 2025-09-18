import { createContext, ReactNode, useContext, useEffect, useRef, useCallback } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData, RegisterData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isInactiveRef = useRef<boolean>(false);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  // Session refresh mutation
  const sessionRefreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/session/refresh");
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(`Unauthorized: ${res.status}`);
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    },
    onError: (error: Error) => {
      // If session refresh fails with 401, the session has expired
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        handleSessionExpired();
      }
    },
  });

  // Handle session expiry
  const handleSessionExpired = useCallback(() => {
    if (isInactiveRef.current) return; // Prevent multiple calls
    isInactiveRef.current = true;
    
    // Broadcast logout event to other tabs
    localStorage.setItem('logout-event', Date.now().toString());
    localStorage.removeItem('logout-event');
    
    // Clear query data and force logout
    queryClient.setQueryData(["/api/user"], null);
    queryClient.clear();
    
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity. Please log in again.",
      variant: "destructive",
    });
    
    // Clear all timeouts
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    
    // Clear only auth-related storage (preserve user preferences)
    const keysToKeep = ['theme', 'language', 'preferences'];
    const localStorageData: Record<string, string> = {};
    keysToKeep.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) localStorageData[key] = value;
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore preserved keys
    Object.entries(localStorageData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, [toast]);

  // Show warning before session expires
  const showSessionWarning = useCallback(() => {
    toast({
      title: "Session Expiring Soon",
      description: "Your session will expire in 2 minutes due to inactivity. Move your mouse or click to stay logged in.",
      variant: "destructive",
    });
  }, [toast]);

  // Track user activity and refresh session
  const trackActivity = useCallback(() => {
    if (!user || isInactiveRef.current) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only refresh if it's been more than 30 seconds since last activity
    if (timeSinceLastActivity > 30000) {
      lastActivityRef.current = now;
      sessionRefreshMutation.mutate();
    }
    
    // Clear existing timeouts
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Set warning timeout for 13 minutes (2 minutes before 15-minute expiry)
    warningTimeoutRef.current = setTimeout(showSessionWarning, 13 * 60 * 1000);
    
    // Set logout timeout for 15 minutes
    activityTimeoutRef.current = setTimeout(handleSessionExpired, 15 * 60 * 1000);
  }, [user, sessionRefreshMutation, showSessionWarning, handleSessionExpired]);

  // Setup activity listeners
  useEffect(() => {
    if (!user) {
      // Clear timeouts when user is not logged in
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      isInactiveRef.current = false;
      return;
    }

    // Reset activity tracking when user logs in
    lastActivityRef.current = Date.now();
    isInactiveRef.current = false;
    
    // Track initial activity
    trackActivity();
    
    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Listen for logout events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout-event') {
        handleSessionExpired();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, trackActivity, handleSessionExpired]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: "Welcome back to AVEX!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Welcome to AVEX!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Trigger logout event for other tabs/windows to end their sessions
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');
      
      // Immediately set user to null to trigger UI update
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear all cached data
      queryClient.clear();
      
      // Clear only auth-related storage (preserve user preferences)
      const keysToKeep = ['theme', 'language', 'preferences'];
      const localStorageData: Record<string, string> = {};
      keysToKeep.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) localStorageData[key] = value;
      });
      
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore preserved keys
      Object.entries(localStorageData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
      
      // Force complete page reload to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      // Still try to clear cache even if logout request fails
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      toast({
        title: "Logout failed",
        description: "Session cleared locally",
        variant: "destructive",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}