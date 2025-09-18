import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface StudyActivityData {
  mode: 'review' | 'practice' | 'quiz';
  duration?: number;
  questionsAnswered?: number;
  completed?: boolean;
  scrolledToEnd?: boolean;
}

export function useStudyActivityTracker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const trackReviewActivity = useMutation({
    mutationFn: async (data: { duration: number; scrolledToEnd?: boolean }) => {
      const response = await fetch('/api/study-activity/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to track review activity');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.streakUpdated) {
        console.log('Review activity tracked - streak updated!');
        queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Great job! 📚",
          description: "Your study streak has been updated!",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to track review activity:', error);
    }
  });

  const trackPracticeActivity = useMutation({
    mutationFn: async (data: { questionsAnswered: number }) => {
      const response = await fetch('/api/study-activity/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to track practice activity');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.streakUpdated) {
        console.log('Practice activity tracked - streak updated!');
        queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Awesome practice! 🎯",
          description: "Your study streak has been updated!",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to track practice activity:', error);
    }
  });

  const trackQuizActivity = useMutation({
    mutationFn: async (data: { completed: boolean }) => {
      const response = await fetch('/api/study-activity/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to track quiz activity');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.streakUpdated) {
        console.log('Quiz activity tracked - streak updated!');
        queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Quiz completed! 🏆",
          description: "Your study streak has been updated!",
          duration: 3000,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to track quiz activity:', error);
    }
  });

  return {
    trackReviewActivity: trackReviewActivity.mutate,
    trackPracticeActivity: trackPracticeActivity.mutate,
    trackQuizActivity: trackQuizActivity.mutate,
    isTracking: trackReviewActivity.isPending || trackPracticeActivity.isPending || trackQuizActivity.isPending
  };
}