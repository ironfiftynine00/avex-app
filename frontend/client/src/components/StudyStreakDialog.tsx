import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Target, Clock, CheckCircle, Circle, Calendar, Trophy, BookOpen, Brain, Zap } from "lucide-react";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface StudyStreakDialogProps {
  children: React.ReactNode;
}

export function StudyStreakDialog({ children }: StudyStreakDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    todayProgress,
    streakData,
    isLoading,
    getProgressPercentage,
    getRequirements,
    isAllCompleted,
  } = useDailyProgress();

  const progressPercentage = getProgressPercentage();
  const requirements = getRequirements();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <VisuallyHidden>
            <DialogTitle>Study Streak Activity</DialogTitle>
            <DialogDescription>Your daily study progress and streak information</DialogDescription>
          </VisuallyHidden>
          <div className="space-y-4 pb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <VisuallyHidden>
          <DialogTitle>Study Streak Activity</DialogTitle>
          <DialogDescription>Your daily study progress and streak information</DialogDescription>
        </VisuallyHidden>
        
        <div className="space-y-6 pb-4">
          {/* Header with Current Streak */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Study Streak</h2>
                <p className="text-sm text-muted-foreground">Track your daily study activity</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{streakData?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              {(streakData?.longestStreak || 0) > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Best: {streakData?.longestStreak} days
                </div>
              )}
            </div>
          </div>

          {/* Daily Progress Card */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-600" />
                  Today's Progress
                </div>
                <Badge variant={progressPercentage === 100 ? "default" : "secondary"} className="text-sm">
                  {Math.round(progressPercentage)}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} className="h-3" />
              
              <div className="grid gap-3">
                {/* Quiz Requirement */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700/40">
                  <div className="flex-shrink-0">
                    {requirements.quiz.completed ? (
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Circle className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", requirements.quiz.completed ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300")}>
                      {requirements.quiz.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{requirements.quiz.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>

                {/* Review Requirement */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700/40">
                  <div className="flex-shrink-0">
                    {requirements.review.completed ? (
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Circle className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", requirements.review.completed ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300")}>
                      {requirements.review.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{requirements.review.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                </div>

                {/* Practice Requirement */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-white/40 dark:border-gray-700/40">
                  <div className="flex-shrink-0">
                    {requirements.practice.completed ? (
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Circle className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", requirements.practice.completed ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300")}>
                      {requirements.practice.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{requirements.practice.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Brain className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Maintenance Tips Card */}
          <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Target className="h-5 w-5" />
                Streak Maintenance Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Complete all three activities daily to maintain your streak</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Your streak resets to 0 if you miss any day</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Study consistently to unlock special badges and achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivational Status Card */}
          {isAllCompleted ? (
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="pt-6 text-center">
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Great job! You've completed today's goal!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Your streak continues tomorrow. Keep it up!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : progressPercentage > 0 ? (
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardContent className="pt-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    You're making progress!
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Complete the remaining requirements to maintain your streak.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
              <CardContent className="pt-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start building your streak today!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Complete all three requirements to maintain your daily streak.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity History */}
          {streakData?.lastActiveDate && (
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last active: {new Date(streakData.lastActiveDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}