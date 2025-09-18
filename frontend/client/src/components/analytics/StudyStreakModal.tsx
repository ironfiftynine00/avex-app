import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Flame, BookOpen, Clock, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StudyActivity {
  date: string;
  activitiesCount: number;
  studyTime: number;
  questionsAnswered: number;
  categories: string[];
}

interface StudyStreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  lastActiveDate: string | null;
}

export function StudyStreakModal({ open, onOpenChange, currentStreak, lastActiveDate }: StudyStreakModalProps) {
  // Fetch real user study activity data
  const { data: studySessions } = useQuery({
    queryKey: ['/api/study-sessions'],
    enabled: open,
    retry: false,
  });

  const { data: userAnalytics } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: open,
    retry: false,
  });
  
  const formatTimeAgo = (dateString: string | null): string => {
    if (!dateString) return 'No recent activity';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Active now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your study journey today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "Excellent consistency!";
    return "Amazing dedication!";
  };

  const getStreakColor = (streak: number): string => {
    if (streak === 0) return "text-gray-500";
    if (streak < 7) return "text-orange-500";
    if (streak < 30) return "text-blue-500";
    return "text-purple-500";
  };

  const isStreakAtRisk = (): boolean => {
    if (!lastActiveDate) return true;
    
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceActive > 20; // At risk if more than 20 hours since last activity
  };

  // Process study sessions data for activity overview
  const getRecentActivity = () => {
    if (!Array.isArray(studySessions)) return [];
    
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayActivities = studySessions.filter((session: any) => 
        new Date(session.createdAt).toISOString().split('T')[0] === date
      );
      
      return {
        date,
        activitiesCount: dayActivities.length,
        studyTime: dayActivities.reduce((sum: number, session: any) => sum + (session.duration || 0), 0),
        questionsAnswered: dayActivities.reduce((sum: number, session: any) => sum + (session.questionsAnswered || 0), 0),
        sessionTypes: [...new Set(dayActivities.map((session: any) => session.sessionType))],
      };
    });
  };

  const recentActivity = getRecentActivity();
  const totalStudyTime = userAnalytics?.overview?.totalStudyTime || 0;
  const totalQuestionsAnswered = userAnalytics?.overview?.questionsAnswered || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Study Streak Activity
          </DialogTitle>
          <DialogDescription>Your study consistency and recent activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Streak Overview */}
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <CardTitle className="text-3xl font-bold text-orange-600">{currentStreak}</CardTitle>
                <span className="text-lg text-muted-foreground">days</span>
              </div>
              <CardDescription className={`text-lg font-medium ${getStreakColor(currentStreak)}`}>
                {getStreakMessage(currentStreak)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {isStreakAtRisk() && currentStreak > 0 && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                    <p className="text-yellow-800 font-medium">⚠️ Streak at risk!</p>
                    <p className="text-yellow-700 text-sm">
                      Study today to maintain your {currentStreak}-day streak
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {currentStreak === 0 ? 0 : Math.max(7, currentStreak)}
                    </div>
                    <p className="text-xs text-muted-foreground">Goal: 7 days</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {currentStreak === 0 ? 0 : Math.max(30, currentStreak)}
                    </div>
                    <p className="text-xs text-muted-foreground">Goal: 30 days</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {currentStreak === 0 ? 0 : Math.max(100, currentStreak)}
                    </div>
                    <p className="text-xs text-muted-foreground">Goal: 100 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Activity */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                Last Study Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                      Last Active
                    </h4>
                    <p className="text-lg font-medium">{formatDate(lastActiveDate)}</p>
                    <p className="text-sm text-muted-foreground">{formatTimeAgo(lastActiveDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                      Current Status
                    </h4>
                    <Badge variant={isStreakAtRisk() ? "destructive" : "default"} className="text-sm">
                      {isStreakAtRisk() ? "Streak at Risk" : "Active Streak"}
                    </Badge>
                  </div>
                </div>

                {lastActiveDate && (
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-medium mb-3">Recent Study Activity</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <BookOpen className="h-6 w-6 mx-auto text-green-500 mb-1" />
                        <p className="text-sm font-medium">Sessions</p>
                        <p className="text-xs text-muted-foreground">Multiple modes used</p>
                      </div>
                      <div>
                        <Target className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-xs text-muted-foreground">Categories studied</p>
                      </div>
                      <div>
                        <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                        <p className="text-sm font-medium">Growth</p>
                        <p className="text-xs text-muted-foreground">Continuous learning</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Streak Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Streak Milestones
              </CardTitle>
              <CardDescription>Your progress towards study consistency goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 7 Day Milestone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">1 Week Streak</span>
                    <Badge variant={currentStreak >= 7 ? "default" : "outline"}>
                      {currentStreak >= 7 ? "Achieved!" : `${currentStreak}/7`}
                    </Badge>
                  </div>
                  <Progress value={Math.min((currentStreak / 7) * 100, 100)} className="h-2" />
                </div>

                {/* 30 Day Milestone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">1 Month Streak</span>
                    <Badge variant={currentStreak >= 30 ? "default" : "outline"}>
                      {currentStreak >= 30 ? "Achieved!" : `${currentStreak}/30`}
                    </Badge>
                  </div>
                  <Progress value={Math.min((currentStreak / 30) * 100, 100)} className="h-2" />
                </div>

                {/* 100 Day Milestone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">100 Day Streak</span>
                    <Badge variant={currentStreak >= 100 ? "default" : "outline"}>
                      {currentStreak >= 100 ? "Achieved!" : `${currentStreak}/100`}
                    </Badge>
                  </div>
                  <Progress value={Math.min((currentStreak / 100) * 100, 100)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips for Maintaining Streak */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">💡 Streak Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800 space-y-2">
                <p>• Study for at least 10 minutes daily to maintain your streak</p>
                <p>• Use any study mode: Review, Practice, Quiz, or Mock Exam</p>
                <p>• Set a daily study time reminder</p>
                <p>• Even quick flashcard reviews count toward your streak</p>
                <p>• Consistency beats intensity - small daily efforts add up!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}