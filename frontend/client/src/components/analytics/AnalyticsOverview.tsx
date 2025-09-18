import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TrendingUp, BookOpen, Target, Clock, Trophy, Zap } from "lucide-react";
import { formatTime } from "@/lib/utils";

export function AnalyticsOverview() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Failed to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  const { overview } = analytics;
  const passRate = overview.totalExams > 0 ? (overview.passedExams / overview.totalExams) * 100 : 0;
  const accuracyRate = overview.questionsAnswered > 0 ? (overview.correctAnswers / overview.questionsAnswered) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your complete study journey across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Study Completion</span>
              <span className="text-2xl font-bold text-blue-600">{Number(overview.overallProgress).toFixed(1)}%</span>
            </div>
            <Progress value={Number(overview.overallProgress)} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Keep studying to reach 100% completion across all subtopics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Exam Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exam Performance</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.passedExams}/{overview.totalExams}</div>
            <p className="text-xs text-muted-foreground">
              {passRate.toFixed(1)}% pass rate
            </p>
            <div className="mt-4">
              <Progress value={passRate} className="h-2" />
            </div>
            {overview.averageScore > 0 && (
              <p className="text-sm mt-2">
                Average Score: <span className="font-semibold">{Number(overview.averageScore).toFixed(1)}%</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Study Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Activity</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.questionsAnswered}</div>
            <p className="text-xs text-muted-foreground">
              questions answered
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="font-semibold">{accuracyRate.toFixed(1)}%</span>
              </div>
              <Progress value={accuracyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Study Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(overview.totalStudyTime)}</div>
            <p className="text-xs text-muted-foreground">
              total study time
            </p>
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                Keep up the great work!
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Battle Performance */}
        {(overview.battleWins > 0 || overview.battleLosses > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battle Performance</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.battleWins}W</div>
              <p className="text-xs text-muted-foreground">
                {overview.battleLosses}L · {((overview.battleWins / (overview.battleWins + overview.battleLosses)) * 100).toFixed(1)}% win rate
              </p>
              <div className="mt-4">
                <Progress 
                  value={(overview.battleWins / (overview.battleWins + overview.battleLosses)) * 100} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Breakdown */}
      {analytics.categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Performance
            </CardTitle>
            <CardDescription>Your progress across different AMT categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryStats.map((stat) => (
                <div key={stat.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category {stat.categoryId}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span>Best: {Number(stat.bestScore).toFixed(1)}%</span>
                      <Badge variant="outline" className="text-xs">
                        {stat.attempts} attempts
                      </Badge>
                    </div>
                  </div>
                  <Progress value={Number(stat.categoryProgress)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stat.questionsAnswered} questions</span>
                    <span>{((stat.correctAnswers / stat.questionsAnswered) * 100).toFixed(1)}% accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}