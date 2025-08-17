import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import BadgeCard from "@/components/badges/badge-card";
import Flashcard from "@/components/study/flashcard";
import TopNav from "@/components/navigation/top-nav";
import { 
  Flame, 
  TrendingUp, 
  Medal, 
  CheckCircle, 
  ArrowRight,
  Play,
  Zap,
  BarChart3,
  Trophy,
  Target,
  Crown,
  Award,
  BookOpen
} from "lucide-react";
import { CATEGORIES, BADGES } from "@/lib/constants";
import { useStreakValidation } from "@/hooks/useStreakValidation";
import StreakDisplay from "@/components/study/streak-display";
import { AnalyticsModal } from "@/components/analytics/AnalyticsModal";
import { MockExamHistoryModal } from "@/components/analytics/MockExamHistoryModal";
import { StudyStreakDialog } from "@/components/StudyStreakDialog";
import { BadgesModal } from "@/components/analytics/BadgesModal";
import { BattleHistoryModal } from "@/components/analytics/BattleHistoryModal";
import { CategoryProgressCarousel } from "@/components/dashboard/CategoryProgressCarousel";
import { StudyCarousel } from "@/components/dashboard/StudyCarousel";
import { useProgressDialog } from "@/contexts/ProgressDialogContext";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useBattleStats, useBattleHistory } from "@/hooks/useBattleData";
import { useOverallProgress } from "@/hooks/useOverallProgress";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isProgressDialogOpen, openProgressDialog, closeProgressDialog } = useProgressDialog();
  const [mockHistoryOpen, setMockHistoryOpen] = useState(false);

  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [battleHistoryOpen, setBattleHistoryOpen] = useState(false);

  
  // Initialize streak validation
  useStreakValidation();
  
  // Get overall progress data
  const { data: overallProgressData } = useOverallProgress();

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: examAttempts = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/badges/user"],
    retry: false,
  });

  const { data: availableBadges = [] } = useQuery({
    queryKey: ["/api/badges/available"],
    retry: false,
  });

  const { data: streak = {} } = useQuery({
    queryKey: ["/api/study-sessions/streak"],
  });

  const { data: analytics } = useAnalytics();
  const { data: battleStats } = useBattleStats() as { data: any };
  const { data: battleHistory } = useBattleHistory(3);

  // Calculate overall progress
  const overallProgress = Array.isArray(progress) && progress.length > 0 
    ? progress.reduce((acc: number, p: any) => acc + (p.correctAnswers / p.totalAttempts * 100 || 0), 0) / progress.length
    : 0;

  // Get latest exam score
  const latestExam = Array.isArray(examAttempts) ? examAttempts[0] : null;
  const latestScore = latestExam ? parseFloat(latestExam.score) : 0;

  // Count earned badges
  const earnedBadgesCount = Array.isArray(userBadges) ? userBadges.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Welcome back!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Continue your AMT certification journey</p>
            </div>
            
            {/* View Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
              <Button className="avex-button-primary text-sm px-3 py-2 sm:px-4 sm:py-2">
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground text-sm px-3 py-2 sm:px-4 sm:py-2"
                onClick={() => setLocation("/study")}
              >
                Study Mode
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground text-sm px-3 py-2 sm:px-4 sm:py-2"
                onClick={() => setLocation("/mock-exam")}
              >
                Mock Exam
              </Button>
            </div>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Study Streak - Clickable Activity */}
            <StudyStreakDialog>
              <Card 
                className="avex-card cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-orange-200 bg-white dark:bg-gray-800"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Study Streak</p>
                      <p className="text-2xl font-bold text-avex-blue">{(streak as any)?.studyStreak || 0} days</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center border border-orange-200 dark:border-orange-800">
                      <Flame className="text-orange-500 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StudyStreakDialog>

            {/* Overall Progress - Clickable Analytics */}
            <Card 
              className="avex-card cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-green-200 bg-white dark:bg-gray-800"
              onClick={() => openProgressDialog()}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Study Completion</p>
                    <p className="text-2xl font-bold text-avex-indigo">
                      {Number(overallProgressData?.overallProgress || 0).toFixed(1)}%
                    </p>
                    {overallProgressData && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {overallProgressData.completedQuestions}/{overallProgressData.totalQuestions} questions
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center border border-green-200 dark:border-green-800">
                    <BarChart3 className="text-green-500 w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Earned - Clickable Collection */}
            <Card 
              className="avex-card cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-yellow-200 bg-white dark:bg-gray-800"
              onClick={() => setBadgesModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Badges Earned</p>
                    <p className="text-2xl font-bold text-avex-purple">
                      {Array.isArray(userBadges) ? userBadges.length : 0}/{Array.isArray(availableBadges) ? availableBadges.length : 8}
                    </p>
                    {/* Show earned badge indicators with colored icons */}
                    {Array.isArray(userBadges) && userBadges.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {userBadges.slice(0, 3).map((badge: any, index: number) => {
                          const getBadgeIcon = (badgeName: string) => {
                            switch (badgeName) {
                              case 'First Steps':
                                return <Target className="w-3 h-3 text-red-300" />;
                              case 'Quick Learner':
                                return <Zap className="w-3 h-3 text-yellow-300" />;
                              case 'Streak Master':
                                return <Flame className="w-3 h-3 text-orange-300" />;
                              case 'Exam Ace':
                                return <Trophy className="w-3 h-3 text-yellow-300" />;
                              case 'Category Expert':
                                return <Crown className="w-3 h-3 text-purple-300" />;
                              case 'Battle Champion':
                                return <Award className="w-3 h-3 text-blue-300" />;
                              case 'Knowledge Seeker':
                                return <BookOpen className="w-3 h-3 text-green-300" />;
                              case 'Perfect Score':
                                return <Medal className="w-3 h-3 text-gold-300" />;
                              default:
                                return <Medal className="w-3 h-3 text-yellow-300" />;
                            }
                          };

                          return (
                            <div 
                              key={badge.id} 
                              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white shadow-lg border-2 border-yellow-300 hover:scale-105 transition-transform"
                              title={`${badge.name} - Earned ${new Date(badge.earnedAt).toLocaleDateString()}`}
                            >
                              <div className="flex items-center justify-center w-4 h-4 bg-white/20 rounded-full">
                                {getBadgeIcon(badge.name)}
                              </div>
                              <span className="text-xs font-bold truncate max-w-12">
                                {badge.name.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                        {userBadges.length > 3 && (
                          <div className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-full border border-yellow-300 shadow-sm">
                            <span className="text-xs font-medium">+{userBadges.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center border border-yellow-200 dark:border-yellow-800">
                    <Medal className={`w-5 h-5 ${
                      Array.isArray(userBadges) && userBadges.length > 0 
                        ? 'text-yellow-600' 
                        : 'text-yellow-500'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Mock Score - Clickable History */}
            <Card 
              className="avex-card cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200 bg-white dark:bg-gray-800"
              onClick={() => setMockHistoryOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Last Mock Score</p>
                    <p className={`text-2xl font-bold ${latestScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                      {Math.round(latestScore)}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <CheckCircle className="text-blue-500 w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Progress Panel */}
        <div className="mb-8">
          <CategoryProgressCarousel 
            categories={CATEGORIES}
            progress={Array.isArray(progress) ? progress : []}
            examAttempts={Array.isArray(examAttempts) ? examAttempts : []}
            analytics={analytics}
          />
        </div>

        {/* Study Streak Display */}
        <div className="mb-6">
          <StreakDisplay />
        </div>

        {/* Study Mode Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Flashcard Study */}
          <Card className="avex-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Continue Studying</CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-avex-blue hover:text-avex-dark-blue"
                  onClick={() => setLocation("/study")}
                >
                  Study Mode <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StudyCarousel />
            </CardContent>
          </Card>

          {/* Mock Exam History - Clickable */}
          <Card 
            className="avex-card cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200"
            onClick={() => setMockHistoryOpen(true)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mock Examination History</CardTitle>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <BarChart3 className="text-blue-500 w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(examAttempts) && examAttempts.length > 0 ? (
                <>
                  {/* Latest Exam Summary */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Latest Exam</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        latestExam?.passed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {latestExam?.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                      {latestExam?.categoryName || 'Category Name'}
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {Math.round(latestScore)}%
                    </p>
                  </div>

                  {/* Recent Attempts Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent Attempts</h4>
                    {examAttempts.slice(0, 3).map((attempt: any, index: number) => (
                      <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{attempt.categoryName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{Math.round(parseFloat(attempt.score))}%</span>
                          <span className={`w-2 h-2 rounded-full ${
                            attempt.passed ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                        </div>
                      </div>
                    ))}
                  </div>


                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-muted-foreground mb-4">No exam attempts yet</p>
                  <Button 
                    className="w-full avex-button-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation("/mock-exam");
                    }}
                  >
                    Take Your First Mock Exam
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Badge Collection */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-yellow-400 rounded-lg border border-yellow-500">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Achievement Badges</h3>
              <p className="text-sm text-muted-foreground">Your learning milestones</p>
            </div>
          </div>

          {/* Auto-Carousel Badge Display */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div 
              className="flex gap-3 pb-2 animate-carousel-scroll"
              style={{
                width: `${BADGES.length * 120}px`,
                animation: 'carousel-scroll 20s linear infinite'
              }}
            >
              {/* First set of badges */}
              {BADGES.map((badge) => {
                const isEarned = Array.isArray(userBadges) ? userBadges.some((ub: any) => ub.id === badge.id) : false;
                const earnedBadge = Array.isArray(userBadges) ? userBadges.find((ub: any) => ub.id === badge.id) : null;
                
                return (
                  <BadgeCard
                    key={badge.id}
                    name={badge.name}
                    description={badge.description}
                    icon={badge.icon}
                    gradient={badge.gradient}
                    isEarned={isEarned}
                    earnedAt={earnedBadge?.earnedAt}
                  />
                );
              })}
              {/* Duplicate badges for seamless loop */}
              {BADGES.map((badge) => {
                const isEarned = Array.isArray(userBadges) ? userBadges.some((ub: any) => ub.id === badge.id) : false;
                const earnedBadge = Array.isArray(userBadges) ? userBadges.find((ub: any) => ub.id === badge.id) : null;
                
                return (
                  <BadgeCard
                    key={`${badge.id}-duplicate`}
                    name={badge.name}
                    description={badge.description}
                    icon={badge.icon}
                    gradient={badge.gradient}
                    isEarned={isEarned}
                    earnedAt={earnedBadge?.earnedAt}
                  />
                );
              })}
            </div>
            
            {/* Gradient fade indicators */}
            <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none rounded-l-2xl z-10"></div>
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none rounded-r-2xl z-10"></div>
            
            {/* Auto-scroll indicator */}
            <div className="absolute bottom-1 right-3 text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
              Auto
            </div>
          </div>
        </div>

        {/* Battle Mode Preview */}
        <Card 
          className="bg-gradient-to-br from-avex-violet to-avex-purple text-white mb-8 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setBattleHistoryOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Battle Mode</h3>
                <p className="text-purple-100">Compete with other students in real-time quizzes</p>
              </div>
              <div className="text-right">
                <div className="text-2xl">⚔️</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-sm sm:text-lg font-bold">{battleStats?.battlesWon || 0}</div>
                <div className="text-xs text-purple-200">Battles Won</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-sm sm:text-lg font-bold">{battleStats?.totalBattles || 0}</div>
                <div className="text-xs text-purple-200">Total Battles</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-sm sm:text-lg font-bold">{battleStats?.winRate ? `${battleStats.winRate}%` : '0%'}</div>
                <div className="text-xs text-purple-200">Win Rate</div>
              </div>
            </div>

            {/* Recent Battle History */}
            {Array.isArray(battleHistory) && battleHistory.length > 0 && (
              <div className="mb-4 p-3 bg-white/10 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 text-purple-100">Recent Battles</h4>
                <div className="space-y-1">
                  {battleHistory.slice(0, 2).map((battle: any, index: number) => (
                    <div key={battle.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${battle.isWinner ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-purple-200">
                          {battle.categoryName || 'General'} ({battle.totalParticipants}P)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-100 font-medium">#{battle.userRank}</span>
                        <span className="text-purple-200">{battle.userScore}pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                className="flex-1 bg-white text-avex-violet hover:scale-105 transition-transform text-sm sm:text-base py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/battle");
                }}
              >
                Quick Match
              </Button>
              <Button 
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors text-sm sm:text-base py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/battle");
                }}
              >
                Create Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Modal */}
      <AnalyticsModal open={isProgressDialogOpen} onOpenChange={closeProgressDialog} />
      
      {/* Mock Exam History Modal */}
      <MockExamHistoryModal 
        open={mockHistoryOpen} 
        onOpenChange={setMockHistoryOpen}
        examAttempts={Array.isArray(examAttempts) ? examAttempts : []}
      />
      

      
      {/* Badges Modal */}
      <BadgesModal 
        open={badgesModalOpen} 
        onOpenChange={setBadgesModalOpen}
        userBadges={Array.isArray(userBadges) ? userBadges : []}
        allBadges={Array.isArray(availableBadges) ? availableBadges.map((badge: any) => ({ 
          ...badge, 
          id: String(badge.id),
          gradient: "from-yellow-400 to-orange-500" // Default gradient for all badges
        })) : []}
      />
      
      {/* Battle History Modal */}
      <BattleHistoryModal 
        open={battleHistoryOpen}
        onOpenChange={setBattleHistoryOpen}
      />

    </div>
  );
}
