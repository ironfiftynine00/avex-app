import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useQuery } from "@tanstack/react-query";

interface CategoryProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: number; name: string; }[];
  progress: any[];
  examAttempts: any[];
}

export function CategoryProgressModal({ 
  isOpen, 
  onClose, 
  categories, 
  progress, 
  examAttempts 
}: CategoryProgressModalProps) {
  // Fetch analytics data for real-time category stats
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();

  const getCategoryData = (category: { id: number; name: string; }) => {
    // Get analytics data for this category if available
    const categoryStats = analyticsData?.categoryStats?.find(
      (stats: any) => stats.categoryId === category.id
    );
    
    // Calculate progress from subtopic data for this category
    const categorySubtopics = analyticsData?.subtopicProgress?.filter(
      (subtopic: any) => {
        // You'd need to map subtopic to category here - using fallback for now
        return true; // This would need proper category-subtopic mapping
      }
    ) || [];
    
    // Calculate real progress using the same method as analytics modal
    const accuracy = categoryStats?.questionsAnswered > 0 
      ? (categoryStats.correctAnswers / categoryStats.questionsAnswered) * 100 
      : 0;
    const baseProgress = Math.min(accuracy, 100);
    const attempts = categoryStats?.attempts || 0;
    const activityBonus = Math.min((attempts * 10) + ((categoryStats?.questionsAnswered || 0) * 1.5), 30);
    const progressPercent = Math.min(baseProgress + activityBonus, 100);
    
    // Get exam attempts for this category
    const categoryAttempts = Array.isArray(examAttempts) 
      ? examAttempts.filter((exam: any) => exam.categoryId === category.id) 
      : [];
    
    const passedAttempts = categoryAttempts.filter((exam: any) => exam.passed).length;
    const lastScore = categoryAttempts.length > 0 ? parseFloat(categoryAttempts[0].score) : 0;

    return {
      ...category,
      progressPercent,
      passedAttempts,
      totalAttempts: categoryAttempts.length,
      lastScore,
      // Additional analytics data
      averageScore: categoryStats?.averageScore ? parseFloat(categoryStats.averageScore) : 0,
      bestScore: categoryStats?.bestScore ? parseFloat(categoryStats.bestScore) : 0,
      questionsAnswered: categoryStats?.questionsAnswered || 0,
      correctAnswers: categoryStats?.correctAnswers || 0,
      timeSpent: categoryStats?.timeSpent || 0,
      attempts: attempts
    };
  };

  // Use analytics data for more accurate overall progress
  const overallProgress = analyticsData?.overview?.overallProgress 
    ? parseFloat(String(analyticsData.overview.overallProgress)) 
    : (categories.length > 0 
        ? Math.round(categories.reduce((acc, cat) => {
            const data = getCategoryData(cat);
            return acc + data.progressPercent;
          }, 0) / categories.length)
        : 0);

  // Use analytics data for exam stats if available
  const totalExams = analyticsData?.overview?.totalExams || examAttempts?.length || 0;
  const totalPassed = analyticsData?.overview?.passedExams || examAttempts?.filter((exam: any) => exam.passed).length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                Category Progress Overview
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                Detailed breakdown of your performance across all categories
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="avex-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 relative">
                <ProgressRing 
                  percentage={overallProgress} 
                  size={48}
                  strokeWidth={4}
                  className="text-purple-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {overallProgress}%
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Overall Progress
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                <span>{totalPassed}</span>
                <span className="text-sm text-muted-foreground mx-1">/</span>
                <span className="text-lg">{totalExams}</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Exams Passed
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {categories.length}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Categories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const categoryData = getCategoryData(category);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="avex-card hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-purple-200/50 dark:hover:border-purple-700/50">
                  <CardContent className="p-4">
                    {/* Category Header */}
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">
                        {categoryData.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={categoryData.progressPercent >= 70 ? "default" : "secondary"}
                          className={
                            categoryData.progressPercent >= 70 
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          }
                        >
                          {categoryData.progressPercent >= 70 ? "Good Progress" : "Needs Work"}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Category {index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Progress */}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 relative">
                          <ProgressRing 
                            percentage={categoryData.progressPercent} 
                            size={48}
                            strokeWidth={4}
                            className="text-purple-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                              {Math.round(categoryData.progressPercent)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Progress
                        </div>
                      </div>

                      {/* Mock Exams */}
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">
                          <span className="text-green-500">{categoryData.passedAttempts}</span>
                          <span className="text-muted-foreground text-sm mx-1">/</span>
                          <span className="text-foreground text-lg">{categoryData.totalAttempts}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Mock Exams
                        </div>
                      </div>

                      {/* Last Score */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${
                          categoryData.lastScore >= 70 ? 'text-green-500' : 'text-orange-500'
                        }`}>
                          {categoryData.lastScore > 0 ? `${Math.round(categoryData.lastScore)}%` : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          Last Score
                        </div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Performance</span>
                        <span className={`font-medium ${
                          categoryData.progressPercent >= 80 ? 'text-green-500' :
                          categoryData.progressPercent >= 60 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {categoryData.progressPercent >= 80 ? 'Excellent' :
                           categoryData.progressPercent >= 60 ? 'Good' :
                           categoryData.progressPercent >= 40 ? 'Average' : 'Needs Improvement'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            categoryData.progressPercent >= 80 ? 'bg-green-500' :
                            categoryData.progressPercent >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(categoryData.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}