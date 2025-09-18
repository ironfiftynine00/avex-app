import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Activity, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface UserAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

interface SessionAnalytics {
  dailyScreenTime: Array<{
    date: string;
    totalTime: number;
    sessionCount: number;
    activityTypes: string[];
  }>;
  recentSessions: Array<{
    id: number;
    sessionId: string;
    startTime: string;
    endTime: string | null;
    duration: number;
    activityType: string;
    pageViews: number;
    isActive: boolean;
    deviceInfo: string | null;
  }>;
  summary: {
    totalTime: number;
    totalSessions: number;
    averageSessionTime: number;
    activeDays: number;
    totalDays: number;
  };
}

export default function UserAnalyticsModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}: UserAnalyticsModalProps) {
  const [selectedDays, setSelectedDays] = useState(30);

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-user-analytics', userId, selectedDays],
    queryFn: async (): Promise<SessionAnalytics> => {
      const response = await fetch(`/api/admin/user-analytics/${userId}?days=${selectedDays}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: isOpen && userId > 0
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getActivityBadgeColor = (activityType: string) => {
    const colors: Record<string, string> = {
      study: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      exam: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      battle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      dashboard: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      profile: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[activityType] || colors.general;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics for {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Period Selector */}
          <div className="flex gap-2">
            {[7, 14, 30, 60].map((days) => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDays(days)}
              >
                {days} days
              </Button>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load analytics data
            </div>
          )}

          {analytics && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="daily">Daily Activity</TabsTrigger>
                <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatDuration(analytics.summary.totalTime)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary.totalSessions}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatDuration(analytics.summary.averageSessionTime)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.summary.activeDays}/{analytics.summary.totalDays}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="daily" className="space-y-4">
                <div className="space-y-3">
                  {analytics.dailyScreenTime.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity recorded in the selected period
                    </div>
                  ) : (
                    analytics.dailyScreenTime.slice(0, 14).map((day) => (
                      <Card key={day.date}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{formatDate(day.date)}</p>
                              <div className="flex gap-2 mt-1">
                                {day.activityTypes.map((type) => (
                                  <Badge
                                    key={type}
                                    variant="secondary"
                                    className={getActivityBadgeColor(type)}
                                  >
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">
                                {formatDuration(day.totalTime)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {day.sessionCount} session{day.sessionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <div className="space-y-3">
                  {analytics.recentSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent sessions found
                    </div>
                  ) : (
                    analytics.recentSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={getActivityBadgeColor(session.activityType)}
                                >
                                  {session.activityType}
                                </Badge>
                                {session.isActive && (
                                  <Badge variant="outline" className="text-green-600">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Started: {formatDateTime(session.startTime)}
                              </p>
                              {session.endTime && (
                                <p className="text-sm text-muted-foreground">
                                  Ended: {formatDateTime(session.endTime)}
                                </p>
                              )}
                              {session.deviceInfo && (
                                <p className="text-xs text-muted-foreground truncate max-w-md">
                                  {session.deviceInfo}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatDuration(session.duration)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.pageViews} page view{session.pageViews !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}