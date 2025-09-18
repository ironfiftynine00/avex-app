import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function StreakDisplay() {
  const queryClient = useQueryClient();
  const [lastValidated, setLastValidated] = useState<Date | null>(null);

  // Validate streak automatically
  const validateStreak = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/study-sessions/validate-streak');
    },
    onSuccess: () => {
      setLastValidated(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
    }
  });

  // Get current streak data
  const { data: streak } = useQuery({
    queryKey: ['/api/study-sessions/streak'],
  });

  // Auto-validate streak on mount and daily
  useEffect(() => {
    const validateAndSchedule = () => {
      validateStreak.mutate();
      
      // Calculate time until next midnight
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      
      setTimeout(() => {
        validateStreak.mutate();
        // Set up daily validation
        const dailyInterval = setInterval(() => {
          validateStreak.mutate();
        }, 24 * 60 * 60 * 1000);
        
        return () => clearInterval(dailyInterval);
      }, msUntilMidnight);
    };

    validateAndSchedule();
  }, []);

  const currentStreak = streak?.studyStreak || 0;
  const lastActive = streak?.lastActiveDate;

  // Calculate days until next milestone
  const nextMilestone = currentStreak < 7 ? 7 : Math.ceil(currentStreak / 10) * 10;
  const daysToMilestone = nextMilestone - currentStreak;

  // Get streak status
  const getStreakStatus = () => {
    if (currentStreak === 0) return "Start your study journey";
    if (currentStreak === 1) return "Great start!";
    if (currentStreak < 7) return `${7 - currentStreak} days to first badge`;
    if (currentStreak === 7) return "Consistent Cadet earned! 🏆";
    return `${currentStreak} day streak!`;
  };

  // Format last active date
  const formatLastActive = () => {
    if (!lastActive) return "Never";
    const date = new Date(lastActive);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) return "Today";
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.getTime() === yesterday.getTime()) return "Yesterday";
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentStreak > 0 ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'}`} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{currentStreak} Day Streak</h3>
                {currentStreak >= 7 && (
                  <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{getStreakStatus()}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatLastActive()}</span>
            </div>
            {currentStreak > 0 && currentStreak < nextMilestone && (
              <p className="text-xs text-muted-foreground mt-1">
                {daysToMilestone} days to next milestone
              </p>
            )}
          </div>
        </div>
        
        {/* Progress bar for next milestone */}
        {currentStreak > 0 && currentStreak < nextMilestone && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{currentStreak}</span>
              <span>{nextMilestone}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}