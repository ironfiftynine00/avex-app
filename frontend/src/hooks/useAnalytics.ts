import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AnalyticsOverview {
  overview: {
    totalExams: number;
    passedExams: number;
    averageScore: number;
    overallProgress: number;
    totalStudyTime: number;
    questionsAnswered: number;
    correctAnswers: number;
    battleWins: number;
    battleLosses: number;
  };
  categoryStats: Array<{
    categoryId: number;
    attempts: number;
    bestScore: string;
    averageScore: string;
    categoryProgress: string;
    timeSpent: number;
    questionsAnswered: number;
    correctAnswers: number;
  }>;
  subtopicProgress: Array<{
    subtopicId: number;
    hasViewedReview: boolean;
    practiceQuestionsCompleted: number;
    quizCompleted: boolean;
    includedInMockExamCompletion: boolean;
    bestScore: string;
    progressPercentage: string;
  }>;
}

export function useAnalytics() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
    staleTime: 0, // Always fetch fresh data to show real user activity
    gcTime: 0, // Don't cache to prevent showing inflated data
  });
}

export function useTrackActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      activityType: 'review' | 'practice' | 'quiz' | 'mock_exam' | 'battle';
      subtopicIds?: number[];
      categoryId?: number;
      score?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
      timeSpent?: number;
      isPassed?: boolean;
      isWin?: boolean;
      rank?: number;
      questionResults?: Array<{
        questionId: number;
        isCorrect: boolean;
        userAnswer?: string;
        correctAnswer?: string;
      }>;
    }) => {
      const response = await fetch('/api/analytics/track-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track activity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate analytics data to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overview'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/category-stats'] });
      // Also invalidate progress and exam data for dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      // Invalidate user data to refresh badges and streak info
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
      // Invalidate battle history for dashboard battle stats
      queryClient.invalidateQueries({ queryKey: ['/api/battle/history'] });
    },
  });
}

export function useSubtopicProgress(subtopicId: number) {
  return useQuery({
    queryKey: ['/api/analytics/progress', subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/progress/${subtopicId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      return response.json();
    },
    enabled: !!subtopicId,
  });
}

export function useCategoryStats(categoryId: number) {
  return useQuery({
    queryKey: ['/api/analytics/category-stats', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/category-stats/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!categoryId,
  });
}

export function useCheckBadges() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/analytics/check-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check badges');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user data to refresh badges
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}