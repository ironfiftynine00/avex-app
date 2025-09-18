import { useQuery } from "@tanstack/react-query";

export interface OverallProgressData {
  overallProgress: number;
  totalQuestions: number;
  completedQuestions: number;
  practiceCompleted: number;
  quizCompleted: number;
  examCompleted: number;
}

export function useOverallProgress() {
  return useQuery<OverallProgressData>({
    queryKey: ['/api/analytics/overall-progress'],
    staleTime: 30000, // Cache for 30 seconds
  });
}