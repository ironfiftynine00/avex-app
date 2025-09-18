import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuestionResult {
  questionId: number;
  isCorrect: boolean;
}

interface TrackActivityData {
  activityType: string;
  subtopicIds?: number[];
  categoryId?: number;
  score?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  timeSpent?: number;
  isPassed?: boolean;
  isWin?: boolean;
  rank?: number;
  questionResults?: QuestionResult[];
}

export function useStudyTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TrackActivityData) => {
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
      // Invalidate all relevant analytics caches
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overall-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/badges'] });
    },
  });
}

// Additional tracking hooks for different study modes with proper interfaces

export function useReviewTracking(onProgressMilestone?: () => void) {
  const tracking = useStudyTracking();
  let hasScrolledToEnd = false;
  
  return {
    startTracking: () => console.log("Review tracking started"),
    markScrolledToEnd: () => {
      console.log("Scrolled to end");
      if (!hasScrolledToEnd && onProgressMilestone) {
        hasScrolledToEnd = true;
        onProgressMilestone();
      }
    },
    finishTracking: () => tracking.mutate({
      activityType: 'review',
      timeSpent: 300 // Default 5 minutes
    })
  };
}

export function usePracticeTracking(onProgressMilestone?: () => void) {
  const tracking = useStudyTracking();
  let questionCount = 0;
  let correctQuestions: { questionId: number; isCorrect: boolean }[] = [];
  
  return {
    incrementQuestions: (questionId?: number, isCorrect?: boolean) => {
      questionCount += 1;
      if (questionId && typeof isCorrect === 'boolean') {
        correctQuestions.push({ questionId, isCorrect });
      }
      
      // Check for milestone achievements
      if (onProgressMilestone && (questionCount === 5 || questionCount === 10 || questionCount === 25 || questionCount === 50)) {
        onProgressMilestone();
      }
    },
    finishTracking: () => tracking.mutate({
      activityType: 'practice',
      questionsAnswered: questionCount,
      correctAnswers: correctQuestions.filter(q => q.isCorrect).length,
      questionResults: correctQuestions
    }),
    questionsAnswered: questionCount
  };
}

export function useQuizTracking(categoryId?: number, subtopicIds?: number[], onProgressMilestone?: () => void) {
  const tracking = useStudyTracking();
  
  return {
    completeQuiz: (results: { score: number; percentage: number; questionsAnswered: number; correctAnswers: number; questionResults?: any[] }) => {
      tracking.mutate({
        activityType: 'quiz',
        categoryId,
        subtopicIds,
        score: results.score,
        questionsAnswered: results.questionsAnswered,
        correctAnswers: results.correctAnswers,
        questionResults: results.questionResults,
        isPassed: results.percentage >= 70
      });
      
      // Trigger progress dialog on quiz completion if score is good
      if (onProgressMilestone && results.percentage >= 70) {
        onProgressMilestone();
      }
    }
  };
}