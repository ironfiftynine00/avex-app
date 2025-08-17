import { useEffect } from 'react';
import { useTrackActivity, useCheckBadges, useAnalytics } from '@/hooks/useAnalytics';
import { useToast } from '@/hooks/use-toast';

interface ProgressTrackerProps {
  activityType: 'review' | 'practice' | 'quiz' | 'mock_exam';
  subtopicIds?: number[];
  categoryId?: number;
  score?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  timeSpent?: number;
  isPassed?: boolean;
  onComplete?: () => void;
  onProgressMilestone?: () => void; // Callback to trigger progress dialog
}

export function ProgressTracker({
  activityType,
  subtopicIds,
  categoryId,
  score,
  questionsAnswered,
  correctAnswers,
  timeSpent,
  isPassed,
  onComplete,
  onProgressMilestone
}: ProgressTrackerProps) {
  const { mutate: trackActivity } = useTrackActivity();
  const { mutate: checkBadges } = useCheckBadges();
  const { data: analyticsData, refetch: refetchAnalytics } = useAnalytics();
  const { toast } = useToast();

  // Function to check if progress milestone is reached
  const checkProgressMilestones = async (previousProgress?: number) => {
    // Refetch analytics data to get latest progress
    const { data: updatedAnalytics } = await refetchAnalytics();
    
    if (updatedAnalytics?.overview && previousProgress !== undefined) {
      const currentProgress = updatedAnalytics.overview.overallProgress;
      
      // Define milestone thresholds for automatic progress dialog trigger
      const milestones = [10, 25, 50, 75, 90, 100]; // Progress percentages
      
      // Check if a milestone was crossed
      const previousMilestone = milestones.find(m => previousProgress < m && currentProgress >= m);
      
      if (previousMilestone && onProgressMilestone) {
        // Show milestone achievement toast
        toast({
          title: `🎯 Milestone Achieved!`,
          description: `You've reached ${previousMilestone}% overall progress!`,
          duration: 6000,
        });
        
        // Trigger progress dialog after a short delay to allow toast to show
        setTimeout(() => {
          onProgressMilestone();
        }, 2000);
      }
      
      // Also trigger on significant achievements
      const significantAchievements = [
        { condition: isPassed && activityType === 'quiz' && score && score >= 90, message: "Perfect Quiz Score!" },
        { condition: questionsAnswered && questionsAnswered >= 20, message: "Study Session Champion!" },
        { condition: isPassed && activityType === 'mock_exam', message: "Mock Exam Passed!" }
      ];
      
      const achievement = significantAchievements.find(a => a.condition);
      if (achievement && onProgressMilestone) {
        toast({
          title: `🏆 ${achievement.message}`,
          description: "Check your updated progress!",
          duration: 4000,
        });
        
        setTimeout(() => {
          onProgressMilestone();
        }, 3000);
      }
    }
  };

  useEffect(() => {
    // Track the activity when component mounts or when key props change
    if (questionsAnswered && questionsAnswered > 0) {
      // Store previous progress before tracking activity
      const previousProgress = analyticsData?.overview?.overallProgress;
      
      trackActivity({
        activityType,
        subtopicIds,
        categoryId,
        score,
        questionsAnswered,
        correctAnswers,
        timeSpent,
        isPassed
      }, {
        onSuccess: () => {
          // Check for new badges after tracking activity
          checkBadges(undefined, {
            onSuccess: (data: any) => {
              if (data.newBadges && data.newBadges.length > 0) {
                toast({
                  title: "New Badge Earned! 🎉",
                  description: `You earned: ${data.newBadges.join(', ')}`,
                  duration: 5000,
                });
              }
            }
          });
          
          // Check for progress milestones after a delay to allow data refresh
          setTimeout(() => {
            checkProgressMilestones(previousProgress);
          }, 1000);
          
          if (onComplete) {
            onComplete();
          }
        },
        onError: (error) => {
          console.error("Failed to track activity:", error);
        }
      });
    }
  }, [activityType, categoryId, score, questionsAnswered, correctAnswers, timeSpent, isPassed]);

  // This component doesn't render anything visible
  return null;
}

// Enhanced helper hook with automatic progress dialog triggering
export function useProgressTracking(onProgressMilestone?: () => void) {
  const { mutate: trackActivity } = useTrackActivity();
  const { mutate: checkBadges } = useCheckBadges();
  const { data: analyticsData, refetch: refetchAnalytics } = useAnalytics();
  const { toast } = useToast();

  const trackStudyActivity = (data: {
    activityType: 'review' | 'practice' | 'quiz' | 'mock_exam';
    subtopicIds?: number[];
    categoryId?: number;
    score?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
    timeSpent?: number;
    isPassed?: boolean;
  }) => {
    // Store previous progress before tracking
    const previousProgress = analyticsData?.overview?.overallProgress;

    trackActivity(data, {
      onSuccess: () => {
        // Check for badges after successful tracking
        checkBadges(undefined, {
          onSuccess: (badgeData: any) => {
            if (badgeData.newBadges && badgeData.newBadges.length > 0) {
              toast({
                title: "New Badge Earned! 🎉",
                description: `You earned: ${badgeData.newBadges.join(', ')}`,
                duration: 5000,
              });
            }
          }
        });

        // Check for progress milestones if callback provided
        if (onProgressMilestone && data.questionsAnswered && data.questionsAnswered > 0) {
          setTimeout(async () => {
            const { data: updatedAnalytics } = await refetchAnalytics();
            
            if (updatedAnalytics?.overview && previousProgress !== undefined) {
              const currentProgress = updatedAnalytics.overview.overallProgress;
              const milestones = [10, 25, 50, 75, 90, 100];
              
              // Check milestone crossing
              const milestoneCrossed = milestones.find(m => previousProgress < m && currentProgress >= m);
              
              if (milestoneCrossed) {
                toast({
                  title: `🎯 Milestone Achieved!`,
                  description: `You've reached ${milestoneCrossed}% overall progress!`,
                  duration: 6000,
                });
                
                setTimeout(() => {
                  onProgressMilestone();
                }, 2000);
              }

              // Check for significant achievements
              const achievements = [
                { condition: data.isPassed && data.activityType === 'quiz' && data.score && data.score >= 90, message: "Perfect Quiz Score!" },
                { condition: data.questionsAnswered && data.questionsAnswered >= 20, message: "Study Session Champion!" },
                { condition: data.isPassed && data.activityType === 'mock_exam', message: "Mock Exam Passed!" }
              ];
              
              const achievement = achievements.find(a => a.condition);
              if (achievement) {
                toast({
                  title: `🏆 ${achievement.message}`,
                  description: "Check your updated progress!",
                  duration: 4000,
                });
                
                setTimeout(() => {
                  onProgressMilestone();
                }, 3000);
              }
            }
          }, 1000);
        }
      }
    });
  };

  return { trackStudyActivity };
}