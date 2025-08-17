import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Medal, 
  Flame, 
  BookOpen, 
  CheckCircle,
  Calendar,
  Crown,
  Award,
  UserPlus,
  Scale,
  Wrench,
  Target,
  Zap
} from "lucide-react";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

interface BadgesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBadges: UserBadge[];
  allBadges: BadgeDefinition[];
}

export function BadgesModal({ open, onOpenChange, userBadges, allBadges }: BadgesModalProps) {
  
  const getBadgeIcon = (badgeName: string, isEarned: boolean = false) => {
    const getIconColor = (name: string, earned: boolean) => {
      if (!earned) return "text-gray-400";
      switch (name) {
        case 'First Steps': return "text-red-300";
        case 'Quick Learner': return "text-yellow-300";
        case 'Streak Master': return "text-orange-300";
        case 'Exam Ace': return "text-yellow-300";
        case 'Category Expert': return "text-purple-300";
        case 'Battle Champion': return "text-blue-300";
        case 'Knowledge Seeker': return "text-green-300";
        case 'Perfect Score': return "text-amber-300";
        default: return "text-yellow-300";
      }
    };

    const iconColor = getIconColor(badgeName, isEarned);
    const iconMap: { [key: string]: JSX.Element } = {
      "First Steps": <Target className={`h-8 w-8 ${iconColor}`} />,
      "Quick Learner": <Zap className={`h-8 w-8 ${iconColor}`} />,
      "Streak Master": <Flame className={`h-8 w-8 ${iconColor}`} />,
      "Exam Ace": <Trophy className={`h-8 w-8 ${iconColor}`} />,
      "Category Expert": <Crown className={`h-8 w-8 ${iconColor}`} />,
      "Battle Champion": <Award className={`h-8 w-8 ${iconColor}`} />,
      "Knowledge Seeker": <BookOpen className={`h-8 w-8 ${iconColor}`} />,
      "Perfect Score": <Medal className={`h-8 w-8 ${iconColor}`} />
    };
    
    return iconMap[badgeName] || <Medal className={`h-8 w-8 ${iconColor}`} />;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Create a Set of earned badge IDs for efficient lookup
  const earnedBadgeIds = new Set(userBadges.map(ub => String(ub.id)));
  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Badges
          </DialogTitle>
          <DialogDescription>Your progress and earned achievements</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-3xl font-bold text-yellow-600">
                  {earnedCount}/{totalCount}
                </CardTitle>
              </div>
              <CardDescription className="text-lg font-medium text-yellow-700">
                Badges Collected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Collection Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progressPercentage.toFixed(1)}% Complete
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
                <p className="text-center text-sm text-muted-foreground">
                  {earnedCount === 0 
                    ? "Start studying to earn your first badge!"
                    : `${totalCount - earnedCount} more badges to collect!`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recently Earned Badges */}
          {userBadges.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Award className="h-5 w-5" />
                  Recently Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {userBadges.slice(0, 3).map((badge) => {
                    const badgeDefinition = allBadges.find(b => String(b.id) === String(badge.id));
                    if (!badgeDefinition) return null;

                    return (
                      <div key={badge.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`p-2 rounded-lg ${badgeDefinition.gradient} text-white`}>
                          {getBadgeIcon(badgeDefinition.name)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.name}</h4>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatTimeAgo(badge.earnedAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Badges Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                All Achievement Badges
              </CardTitle>
              <CardDescription>
                Complete study activities to unlock these achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBadges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(String(badge.id));
                  const userBadge = userBadges.find(ub => String(ub.id) === String(badge.id));

                  return (
                    <div 
                      key={badge.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isEarned 
                          ? 'border-green-200 bg-green-50 shadow-md' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {/* Earned Badge Indicator */}
                      {isEarned && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-green-500 text-white rounded-full p-1">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>
                      )}

                      <div className="text-center space-y-3">
                        {/* Badge Icon */}
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                          isEarned 
                            ? `bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg border-2 border-yellow-300`
                            : 'bg-gray-200'
                        }`}>
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                            isEarned ? 'bg-white/20' : 'bg-white/50'
                          }`}>
                            {getBadgeIcon(badge.name, isEarned)}
                          </div>
                        </div>

                        {/* Badge Info */}
                        <div>
                          <h3 className={`font-semibold ${
                            isEarned ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {badge.name}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            isEarned ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {badge.description}
                          </p>
                        </div>

                        {/* Earned Date */}
                        {isEarned && userBadge && (
                          <div className="pt-2 border-t border-green-200">
                            <Badge variant="secondary" className="text-xs">
                              Earned {formatTimeAgo(userBadge.earnedAt)}
                            </Badge>
                          </div>
                        )}

                        {/* Not Earned Overlay */}
                        {!isEarned && (
                          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
                            <div className="bg-white/90 rounded-full px-3 py-1">
                              <span className="text-xs font-medium text-gray-500">Locked</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Badge Categories */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Badge Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                  <p className="text-sm font-medium">Streak Badges</p>
                  <p className="text-xs text-muted-foreground">Study consistency</p>
                </div>
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-sm font-medium">Progress Badges</p>
                  <p className="text-xs text-muted-foreground">Completion milestones</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                  <p className="text-sm font-medium">Achievement Badges</p>
                  <p className="text-xs text-muted-foreground">Special accomplishments</p>
                </div>
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="text-sm font-medium">Expert Badges</p>
                  <p className="text-xs text-muted-foreground">Mastery rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}