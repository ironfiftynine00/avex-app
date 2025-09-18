import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface DailyProgress {
  userId: number;
  date: string;
  quizCompleted: boolean;
  reviewTimeCompleted: boolean;
  practiceCompleted: boolean;
  isCompleted: boolean;
  quizCompletedAt?: string | null;
  reviewCompletedAt?: string | null;
  practiceCompletedAt?: string | null;
  completedAt?: string | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
}

export function useDailyProgress() {
  const queryClient = useQueryClient();

  // Get today's daily progress
  const { data: todayProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/daily-progress/today"],
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure UI stays updated
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Get current streak data
  const { data: streakData, isLoading: isLoadingStreak } = useQuery({
    queryKey: ["/api/daily-progress/streak"],
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds to ensure UI stays updated
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Mutation to update quiz progress
  const updateQuizProgress = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/daily-progress/quiz", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
    },
  });

  // Mutation to update review progress (when user spends 3+ minutes in review mode)
  const updateReviewProgress = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/daily-progress/review", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
    },
  });

  // Mutation to update practice progress
  const updatePracticeProgress = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/daily-progress/practice", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-progress/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
    },
  });

  // Calculate progress percentage (0-100)
  const getProgressPercentage = (): number => {
    if (!todayProgress) return 0;
    
    let completed = 0;
    if ((todayProgress as any)?.quizCompleted) completed++;
    if ((todayProgress as any)?.reviewTimeCompleted) completed++;
    if ((todayProgress as any)?.practiceCompleted) completed++;
    
    return Math.round((completed / 3) * 100);
  };

  // Get requirements status
  const getRequirements = () => {
    return {
      quiz: {
        completed: (todayProgress as any)?.quizCompleted || false,
        label: "Complete 1 quiz",
        description: "Answer questions in any subtopic quiz mode",
      },
      review: {
        completed: (todayProgress as any)?.reviewTimeCompleted || false,
        label: "Study for 3 minutes",
        description: "Spend time reviewing materials in review mode",
      },
      practice: {
        completed: (todayProgress as any)?.practiceCompleted || false,
        label: "Complete 1 practice subtopic",
        description: "Answer all questions in any practice subtopic",
      },
    };
  };

  return {
    todayProgress: todayProgress as DailyProgress | undefined,
    streakData: streakData as StreakData | undefined,
    isLoading: isLoadingProgress || isLoadingStreak,
    updateQuizProgress,
    updateReviewProgress,
    updatePracticeProgress,
    getProgressPercentage,
    getRequirements,
    isAllCompleted: (todayProgress as any)?.isCompleted || false,
  };
}

// Review time tracker hook for tracking 3-minute requirement
export function useReviewTimeTracker() {
  const { updateReviewProgress } = useDailyProgress();
  
  const startReviewSession = () => {
    // Track 3 minutes of review time
    const startTime = Date.now();
    const requiredTime = 3 * 60 * 1000; // 3 minutes in milliseconds
    
    const checkProgress = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= requiredTime) {
        updateReviewProgress.mutate();
        return true; // Stop tracking
      }
      return false; // Continue tracking
    };
    
    // Check every 30 seconds
    const interval = setInterval(() => {
      if (checkProgress()) {
        clearInterval(interval);
      }
    }, 30000);
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  };
  
  return { startReviewSession };
}