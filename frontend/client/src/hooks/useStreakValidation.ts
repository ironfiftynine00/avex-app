import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useStreakValidation() {
  const queryClient = useQueryClient();

  const validateStreak = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/study-sessions/validate-streak');
    },
    onSuccess: () => {
      // Refresh streak data after validation
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
    }
  });

  // Auto-validate streak when component mounts or when the date changes
  useEffect(() => {
    const checkAndValidateStreak = () => {
      validateStreak.mutate();
    };

    // Run validation immediately
    checkAndValidateStreak();

    // Set up interval to check every hour for date changes
    const intervalId = setInterval(checkAndValidateStreak, 60 * 60 * 1000); // 1 hour

    // Check at midnight every day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const midnightTimeout = setTimeout(() => {
      checkAndValidateStreak();
      // Set up daily midnight validation
      const dailyInterval = setInterval(checkAndValidateStreak, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => {
      clearInterval(intervalId);
      clearTimeout(midnightTimeout);
    };
  }, []);

  return {
    validateStreak: validateStreak.mutate,
    isValidating: validateStreak.isPending
  };
}