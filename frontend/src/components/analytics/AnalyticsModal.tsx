import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TrendingUp, BookOpen, Target, Clock, Trophy, Zap, X } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsModal({ open, onOpenChange }: AnalyticsModalProps) {
  const { data: analytics, isLoading } = useAnalytics();

  // Automatically refresh data when dialog opens
  useEffect(() => {
    if (open) {
      // Force fresh data by invalidating all analytics queries
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/detailed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/overall-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions/streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/badges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-progress'] });
    }
  }, [open]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>Performance Analytics</DialogTitle>
            <DialogDescription>Your detailed study progress and performance metrics</DialogDescription>
          </VisuallyHidden>
          <div className="space-y-4">
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

  if (!analytics) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <VisuallyHidden>
            <DialogTitle>Performance Analytics</DialogTitle>
            <DialogDescription>Analytics data unavailable</DialogDescription>
          </VisuallyHidden>
          <p className="text-center text-muted-foreground py-8">Failed to load analytics data</p>
        </DialogContent>
      </Dialog>
    );
  }

  const { overview } = analytics;
  const overallProgress = (analytics as any)?.overallProgress || 0;
  const completionStats = (analytics as any)?.completionStats || [];
  const passRate = overview.totalExams > 0 ? (overview.passedExams / overview.totalExams) * 100 : 0;
  const accuracyRate = overview.questionsAnswered > 0 ? (overview.correctAnswers / overview.questionsAnswered) * 100 : 0;
  const studyProgress = overallProgress || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Performance Analytics</DialogTitle>
          <DialogDescription>Your detailed study progress and performance metrics</DialogDescription>
        </VisuallyHidden>

        <div className="space-y-6">
          {/* Overall Progress Card - Enhanced with Question Completion */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
                Overall Progress
              </CardTitle>
              <CardDescription>Your complete study journey based on real-time activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Study Completion</span>
                  <span className="text-3xl font-bold text-blue-600">{Number(studyProgress).toFixed(1)}%</span>
                </div>
                <Progress value={Number(studyProgress)} className="h-4" />
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{overview.questionsAnswered || 0}</div>
                    <div className="text-xs text-muted-foreground">Questions Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{overview.correctAnswers || 0}</div>
                    <div className="text-xs text-muted-foreground">Correct Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{accuracyRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Real-time progress from all study activities automatically updated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Exam Performance */}
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Trophy className="h-5 w-5" />
                  Exam Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{overview.passedExams || 0}/{overview.totalExams || 0}</div>
                    <p className="text-sm text-muted-foreground">mock exams passed</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate</span>
                      <span className="font-semibold">{passRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={passRate} className="h-3" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>Average Score: {Number(overview.averageScore || 0).toFixed(1)}%</span>
                    <span>Updated in real-time</span>
                  </div>
                  {overview.averageScore > 0 && (
                    <div className="text-center pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-xl font-bold text-yellow-600">{Number(overview.averageScore).toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Activity */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BookOpen className="h-5 w-5" />
                  Study Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{overview.questionsAnswered || 0}</div>
                    <p className="text-sm text-muted-foreground">questions answered</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-100 rounded">
                      <div className="font-bold text-green-700">{overview.correctAnswers || 0}</div>
                      <div className="text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center p-2 bg-red-100 rounded">
                      <div className="font-bold text-red-700">{(overview.questionsAnswered || 0) - (overview.correctAnswers || 0)}</div>
                      <div className="text-muted-foreground">Incorrect</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Rate</span>
                      <span className="font-semibold">{accuracyRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={accuracyRate} className="h-3" />
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Live data from all study modes
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Time */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Clock className="h-5 w-5" />
                  Study Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{formatTime(overview.totalStudyTime || 0)}</div>
                    <p className="text-sm text-muted-foreground">total study time</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-purple-100 rounded">
                      <div className="font-bold text-purple-700">{Math.floor((overview.totalStudyTime || 0) / 60)}h</div>
                      <div className="text-muted-foreground">Hours</div>
                    </div>
                    <div className="text-center p-2 bg-purple-100 rounded">
                      <div className="font-bold text-purple-700">{(overview.totalStudyTime || 0) % 60}m</div>
                      <div className="text-muted-foreground">Minutes</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span>Daily Average</span>
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(Math.round((overview.totalStudyTime || 0) / 7))}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Tracked from all activities automatically
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Battle Performance */}
          {(overview.battleWins > 0 || overview.battleLosses > 0) && (
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Zap className="h-5 w-5" />
                  Battle Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{overview.battleWins}</div>
                    <p className="text-sm text-muted-foreground">wins</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{overview.battleLosses}</div>
                    <p className="text-sm text-muted-foreground">losses</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {((overview.battleWins / (overview.battleWins + overview.battleLosses)) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">win rate</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(overview.battleWins / (overview.battleWins + overview.battleLosses)) * 100} 
                    className="h-3" 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Performance */}
          {analytics.categoryStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Category Performance
                </CardTitle>
                <CardDescription>Real-time performance across AMT categories from user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {analytics.categoryStats.map((stat) => {
                    const accuracy = stat.questionsAnswered > 0 ? (stat.correctAnswers / stat.questionsAnswered) * 100 : 0;
                    // Calculate real progress: base on questions answered and accuracy, capped at realistic values
                    const baseProgress = Math.min(accuracy, 100);
                    // Consider activity level - more attempts and questions = higher progress
                    const activityBonus = Math.min((stat.attempts * 10) + (stat.questionsAnswered * 1.5), 30);
                    const categoryProgress = Math.min(baseProgress + activityBonus, 100);
                    return (
                      <div key={stat.categoryId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{(stat as any).categoryName || `Category ${stat.categoryId}`}</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{categoryProgress.toFixed(1)}% Complete</span>
                            <Badge variant="outline" className="text-xs">
                              {stat.attempts} sessions
                            </Badge>
                          </div>
                        </div>
                        <Progress value={categoryProgress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stat.questionsAnswered} questions • Best: {Number(stat.bestScore || 0).toFixed(1)}%</span>
                          <span>{accuracy.toFixed(1)}% accuracy</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Study time: {Math.floor((stat.timeSpent || 0) / 60)}h {(stat.timeSpent || 0) % 60}m • Auto-updated
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}