import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Clock, 
  Users, 
  ClipboardCheck, 
  BookOpen, 
  Activity, 
  Monitor,
  CheckCircle,
  XCircle,
  Timer,
  Award,
  RefreshCw
} from "lucide-react";

interface UserActivity {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  activityType: string;
  startTime: string;
  duration?: number;
  isActive: boolean;
  deviceInfo?: string;
  lastActivityAt: string;
}

interface ExamAttempt {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  categoryId: number;
  categoryName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  passed: boolean;
  createdAt: string;
}

interface StudySession {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  categoryId?: number;
  categoryName?: string;
  subtopicId?: number;
  subtopicName?: string;
  sessionType: string;
  duration?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  createdAt: string;
}

interface UserHistoryItem {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  activityType: string;
  categoryName?: string;
  subtopicName?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  passed?: boolean;
  timeTaken?: number;
  duration?: number;
  questionsAnswered?: number;
  createdAt: string;
}

interface ActivityOverview {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  totalExams: number;
  totalStudySessions: number;
  averageScore: number;
}

interface RealTimeAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RealTimeAnalyticsModal({ isOpen, onClose }: RealTimeAnalyticsModalProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch user activity with auto-refresh (more frequent for real-time updates)
  const { data: userActivity, refetch: refetchActivity, isRefetching: isRefetchingActivity } = useQuery<UserActivity[]>({
    queryKey: ["/api/admin/analytics/activity"],
    refetchInterval: autoRefresh ? 2000 : false, // Refresh every 2 seconds for real-time
    refetchIntervalInBackground: true,
  });

  // Fetch recent exam attempts
  const { data: examAttempts, refetch: refetchExams, isRefetching: isRefetchingExams } = useQuery<ExamAttempt[]>({
    queryKey: ["/api/admin/analytics/exams"],
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch recent study sessions
  const { data: studySessions, refetch: refetchSessions, isRefetching: isRefetchingSessions } = useQuery<StudySession[]>({
    queryKey: ["/api/admin/analytics/sessions"],
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch comprehensive user history
  const { data: userHistory, refetch: refetchUserHistory, isRefetching: isRefetchingUserHistory } = useQuery<UserHistoryItem[]>({
    queryKey: ["/api/admin/analytics/user-history"],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch activity overview
  const { data: overview, refetch: refetchOverview, isRefetching: isRefetchingOverview } = useQuery<ActivityOverview>({
    queryKey: ["/api/admin/analytics/overview"],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    refetchIntervalInBackground: true,
  });

  const handleManualRefresh = () => {
    refetchActivity();
    refetchExams();
    refetchSessions();
    refetchUserHistory();
    refetchOverview();
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'exam':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'study':
        return <BookOpen className="w-4 h-4" />;
      case 'battle':
        return <Award className="w-4 h-4" />;
      case 'dashboard':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'exam':
        return 'bg-purple-100 text-purple-700';
      case 'study':
        return 'bg-blue-100 text-blue-700';
      case 'battle':
        return 'bg-orange-100 text-orange-700';
      case 'dashboard':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">Real-Time User Analytics</DialogTitle>
            <DialogDescription>
              Monitor live user activities, exam attempts, and study sessions with real-time updates.
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-1">
              {autoRefresh ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live monitoring • Updates every 2-10 seconds
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Monitoring paused
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(isRefetchingActivity || isRefetchingExams || isRefetchingSessions || isRefetchingUserHistory || isRefetchingOverview) && autoRefresh && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Updating...
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              {autoRefresh ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse text-green-500" />
                  Live
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Paused
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-lg font-bold">{overview.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active (24h)</p>
                    <p className="text-lg font-bold">{overview.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Live Sessions</p>
                    <p className="text-lg font-bold">{overview.activeSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                    <p className="text-lg font-bold">{overview.totalExams}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Study Sessions</p>
                    <p className="text-lg font-bold">{overview.totalStudySessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-lg font-bold">{overview.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="activity" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Activity
              {userActivity && userActivity.length > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                  {userActivity.filter((a) => a.isActive).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Recent Exams
              {examAttempts && examAttempts.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                  {examAttempts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Study Sessions
              {studySessions && studySessions.length > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                  {studySessions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              User History
              {userHistory && userHistory.length > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                  {userHistory.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {userActivity && userActivity.length > 0 ? (
                    <div className="space-y-3">
                      {userActivity.map((activity: any) => (
                        <div key={activity.id} className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-blue-500">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)}`}>
                                {getActivityIcon(activity.activityType)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {activity.firstName} {activity.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{activity.email}</p>
                                {activity.deviceInfo && (
                                  <p className="text-xs text-muted-foreground">
                                    📱 {activity.deviceInfo}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={activity.isActive ? "default" : "secondary"}>
                                  {activity.activityType}
                                </Badge>
                                {activity.isActive && (
                                  <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">
                                    🟢 Live
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.lastActivityAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {/* Detailed Activity Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-background/50 rounded-md">
                            <div>
                              <p className="text-xs text-muted-foreground">Session Duration</p>
                              <p className="text-sm font-medium">
                                {activity.duration ? formatDuration(activity.duration) : 'Just started'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Started</p>
                              <p className="text-sm font-medium">
                                {format(new Date(activity.startTime), 'HH:mm:ss')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                {activity.isActive ? (
                                  <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                    Inactive
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active users found
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Recent Mock Examinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {examAttempts && examAttempts.length > 0 ? (
                    <div className="space-y-3">
                      {examAttempts.map((exam: any) => (
                        <div key={exam.id} className={`p-4 bg-muted/50 rounded-lg border-l-4 ${exam.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${exam.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {exam.passed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {exam.firstName} {exam.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{exam.email}</p>
                                <p className="text-sm font-medium text-foreground">{exam.categoryName}</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={exam.passed ? "default" : "destructive"} className="text-sm">
                                  {exam.score}% {exam.passed ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(exam.createdAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>

                          {/* Detailed Exam Results */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 p-3 bg-background/50 rounded-md">
                            <div>
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="text-lg font-bold text-foreground">{exam.score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Correct Answers</p>
                              <p className="text-lg font-bold text-blue-600">
                                {exam.correctAnswers}/{exam.totalQuestions}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Time Taken</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {formatDuration(exam.timeTaken)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Result</p>
                              <div className="flex items-center gap-1">
                                {exam.passed ? (
                                  <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    PASSED
                                  </span>
                                ) : (
                                  <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    FAILED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* User Performance Indicator */}
                          <div className="mt-3 p-2 bg-background/30 rounded-md">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Performance</span>
                              <span>{exam.score}% of 100%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full transition-all ${exam.passed ? 'bg-green-500' : 'bg-red-500'}`} 
                                style={{ width: `${exam.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent exam attempts found
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recent Study Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {studySessions && studySessions.length > 0 ? (
                    <div className="space-y-3">
                      {studySessions.map((session: any) => (
                        <div key={session.id} className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-indigo-500">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getActivityColor(session.sessionType)}`}>
                                {getActivityIcon(session.sessionType)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {session.firstName} {session.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{session.email}</p>
                                <p className="text-sm font-medium text-foreground">
                                  {session.categoryName || 'General Study'}
                                  {session.subtopicName && ` • ${session.subtopicName}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <Badge variant="outline" className="mb-2">
                                {session.sessionType}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(session.createdAt), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>

                          {/* Study Session Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 p-3 bg-background/50 rounded-md">
                            <div>
                              <p className="text-xs text-muted-foreground">Session Duration</p>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {session.duration ? formatDuration(session.duration) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Questions Answered</p>
                              <p className="text-lg font-bold text-blue-600">
                                {session.questionsAnswered || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Correct Answers</p>
                              <p className="text-lg font-bold text-green-600">
                                {session.correctAnswers || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Accuracy</p>
                              <p className="text-sm font-bold text-foreground">
                                {session.questionsAnswered > 0 
                                  ? `${Math.round((session.correctAnswers / session.questionsAnswered) * 100)}%`
                                  : 'N/A'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Performance Indicator for Study Sessions */}
                          {session.questionsAnswered > 0 && (
                            <div className="mt-3 p-2 bg-background/30 rounded-md">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Study Progress</span>
                                <span>{session.correctAnswers}/{session.questionsAnswered} correct</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div 
                                  className="h-2 rounded-full transition-all bg-gradient-to-r from-blue-500 to-indigo-500" 
                                  style={{ 
                                    width: `${Math.round((session.correctAnswers / session.questionsAnswered) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent study sessions found
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Comprehensive User History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete activity history showing all mock exams and quiz sessions with dates and times
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {userHistory && userHistory.length > 0 ? (
                    <div className="space-y-3">
                      {userHistory.map((item, index) => (
                        <div key={`${item.activityType}-${item.userId}-${index}`} className={`p-4 bg-muted/50 rounded-lg border-l-4 ${
                          item.activityType === 'exam' 
                            ? item.passed ? 'border-l-green-500' : 'border-l-red-500'
                            : 'border-l-blue-500'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                item.activityType === 'exam' 
                                  ? item.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.activityType === 'exam' ? (
                                  item.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                                ) : (
                                  <BookOpen className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {item.firstName} {item.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{item.email}</p>
                                <p className="text-sm font-medium text-foreground">
                                  {item.categoryName || 'General Study'}
                                  {item.subtopicName && ` • ${item.subtopicName}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={item.activityType === 'exam' ? (item.passed ? 'default' : 'destructive') : 'outline'}>
                                  {item.activityType === 'exam' ? 'Mock Exam' : item.activityType}
                                  {item.score !== undefined && item.score !== null && ` • ${item.score}%`}
                                </Badge>
                                {item.activityType === 'exam' && item.passed !== undefined && (
                                  <Badge variant={item.passed ? 'default' : 'destructive'} className="text-xs">
                                    {item.passed ? 'PASS' : 'FAIL'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                📅 {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                🕐 {format(new Date(item.createdAt), 'HH:mm:ss')}
                              </p>
                            </div>
                          </div>

                          {/* Activity Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 p-3 bg-background/50 rounded-md">
                            {item.activityType === 'exam' ? (
                              <>
                                <div>
                                  <p className="text-xs text-muted-foreground">Final Score</p>
                                  <p className="text-lg font-bold text-foreground">{item.score}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Correct Answers</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {item.correctAnswers}/{item.totalQuestions}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Time Taken</p>
                                  <p className="text-sm font-medium flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {item.timeTaken ? formatDuration(item.timeTaken) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Result</p>
                                  <div className="flex items-center gap-1">
                                    {item.passed ? (
                                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        PASSED
                                      </span>
                                    ) : (
                                      <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                                        <XCircle className="w-4 h-4" />
                                        FAILED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <p className="text-xs text-muted-foreground">Session Duration</p>
                                  <p className="text-sm font-medium flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {item.duration ? formatDuration(item.duration) : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Questions Answered</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {item.questionsAnswered || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Correct Answers</p>
                                  <p className="text-lg font-bold text-green-600">
                                    {item.correctAnswers || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                                  <p className="text-sm font-medium">
                                    {item.score !== undefined && item.score !== null ? `${item.score}%` : 'N/A'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Performance Indicator */}
                          {item.score !== undefined && item.score !== null && (
                            <div className="mt-3 p-2 bg-background/30 rounded-md">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{item.activityType === 'exam' ? 'Exam Performance' : 'Study Performance'}</span>
                                <span>{item.score}% of 100%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    item.activityType === 'exam' 
                                      ? item.passed ? 'bg-green-500' : 'bg-red-500'
                                      : 'bg-blue-500'
                                  }`} 
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No user history found
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}