import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { CategoryProgressModal } from "./CategoryProgressModal";

interface CategoryProgressCarouselProps {
  categories: { id: number; name: string; }[];
  progress: any[];
  examAttempts: any[];
  analytics?: any;
}

export function CategoryProgressCarousel({ 
  categories, 
  progress, 
  examAttempts,
  analytics
}: CategoryProgressCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality with pause on interaction
  useEffect(() => {
    if (!isAutoPlaying || isDragging) {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }
    
    autoPlayRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === categories.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change every 4 seconds

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlaying, isDragging, categories.length, currentIndex]);

  // Resume auto-play after user interaction
  const resumeAutoPlay = () => {
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 2000); // Resume after 2 seconds of no interaction
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === categories.length - 1 ? 0 : prevIndex + 1
    );
    resumeAutoPlay();
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? categories.length - 1 : prevIndex - 1
    );
    resumeAutoPlay();
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    resumeAutoPlay();
  };

  // Handle drag/swipe gestures
  const handleDragStart = () => {
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 50; // Minimum distance to trigger slide
    
    if (info.offset.x > threshold) {
      // Swipe right - go to previous
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? categories.length - 1 : prevIndex - 1
      );
    } else if (info.offset.x < -threshold) {
      // Swipe left - go to next
      setCurrentIndex((prevIndex) => 
        prevIndex === categories.length - 1 ? 0 : prevIndex + 1
      );
    }
    
    resumeAutoPlay();
  };

  const getCurrentCategory = () => {
    const category = categories[currentIndex];
    if (!category) return null;

    // Use analytics category stats for more accurate data
    const categoryStats = analytics?.categoryStats?.find((stats: any) => stats.categoryId === category.id);
    
    // Fallback to exam attempts for basic info
    const categoryAttempts = Array.isArray(examAttempts) 
      ? examAttempts.filter((exam: any) => exam.categoryId === category.id) 
      : [];
    
    const passedAttempts = categoryAttempts.filter((exam: any) => exam.passed).length;
    const lastScore = categoryAttempts[0] ? parseFloat(categoryAttempts[0].score) : 0;
    
    // Use realistic data based on actual exam attempts instead of potentially inflated analytics
    let progressPercent = 0;
    let questionsAnswered = 0;
    let correctAnswers = 0;
    let studyAttempts = 0;
    let bestScore = 0;
    let averageScore = 0;

    if (categoryAttempts.length > 0) {
      // Calculate realistic progress based on actual exams
      questionsAnswered = categoryAttempts.reduce((sum: number, exam: any) => sum + (exam.totalQuestions || 0), 0);
      correctAnswers = categoryAttempts.reduce((sum: number, exam: any) => sum + (exam.correctAnswers || 0), 0);
      bestScore = Math.max(...categoryAttempts.map((exam: any) => parseFloat(exam.score)));
      averageScore = categoryAttempts.reduce((sum: number, exam: any) => sum + parseFloat(exam.score), 0) / categoryAttempts.length;
      progressPercent = questionsAnswered > 0 ? (correctAnswers / questionsAnswered * 100) : bestScore;
      studyAttempts = categoryAttempts.length;
    } else if (categoryStats && categoryStats.questionsAnswered <= 50) {
      // Use analytics only if values seem realistic (<=50 questions seems reasonable for study sessions)
      questionsAnswered = categoryStats.questionsAnswered;
      correctAnswers = categoryStats.correctAnswers;
      progressPercent = questionsAnswered > 0 ? (correctAnswers / questionsAnswered * 100) : 0;
      studyAttempts = categoryStats.attempts;
      bestScore = categoryStats.bestScore ? parseFloat(categoryStats.bestScore) : 0;
      averageScore = categoryStats.averageScore ? parseFloat(categoryStats.averageScore) : 0;
    }

    return {
      ...category,
      progressPercent: Math.round(progressPercent),
      passedAttempts,
      totalAttempts: categoryAttempts.length,
      lastScore,
      bestScore,
      averageScore,
      questionsAnswered,
      correctAnswers,
      attempts: studyAttempts
    };
  };

  const currentCategory = getCurrentCategory();

  if (!currentCategory) return null;

  return (
    <div className="mb-8">
      {/* Connected Header and Carousel Container */}
      <Card className="avex-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-purple-200/50 dark:hover:border-purple-700/50 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-blue-900/10 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-400/5 dark:to-blue-400/5"></div>
        
        {/* Header Section - now inside the card */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-purple-100/50 dark:border-purple-800/30 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Category Progress</h3>
              <p className="text-sm text-muted-foreground">Track your learning journey across all subjects</p>
            </div>
          </div>
          <Button 
            variant="outline"
            className="bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200"
            onClick={() => setShowModal(true)}
          >
            <span className="mr-2">View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Carousel Content */}
        <CardContent className="p-8 pt-6 select-none relative z-10">


          {/* Category Content with Drag Support */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 0.98 }}
              >
                <div className="w-full">
                  <div className="mb-8 text-center">
                    <h4 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
                      {currentCategory.name}
                    </h4>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Category {currentIndex + 1} of {categories.length}
                      </p>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Category Progress - Based on Questions Answered */}
                  <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                      {currentCategory.questionsAnswered > 0 ? currentCategory.questionsAnswered : 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Questions Answered</div>
                    <div className="text-xs text-muted-foreground">
                      {currentCategory.questionsAnswered > 0 
                        ? `${currentCategory.correctAnswers} correct (${Math.round(currentCategory.progressPercent)}%)`
                        : 'No activity yet'
                      }
                    </div>
                  </div>
                  
                  {/* Study Sessions & Attempts */}
                  <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {currentCategory.attempts > 0 ? currentCategory.attempts : 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Study Sessions</div>
                    <div className="text-xs text-muted-foreground">
                      {currentCategory.totalAttempts > 0 
                        ? `${currentCategory.passedAttempts} mock exams passed`
                        : 'No mock exams yet'
                      }
                    </div>
                  </div>
                  
                  {/* Performance Score */}
                  <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-orange-100 dark:border-orange-800/50">
                    <div className={`text-4xl font-bold mb-2 ${currentCategory.bestScore >= 70 ? 'text-green-500' : currentCategory.bestScore > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                      {currentCategory.bestScore > 0 ? Math.round(currentCategory.bestScore) : '--'}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Best Score</div>
                    <div className="text-xs text-muted-foreground">
                      {currentCategory.averageScore > 0 
                        ? `Average: ${Math.round(currentCategory.averageScore)}%`
                        : 'No scores available'
                      }
                    </div>
                  </div>
                </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced Dot Indicators */}
          <div className="flex justify-center space-x-3 mt-8">
            {categories.map((_, index) => (
              <button
                key={index}
                className={`rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentIndex 
                    ? 'w-8 h-3 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg' 
                    : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-600'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>


        </CardContent>
      </Card>
      
      {/* Category Progress Modal */}
      <CategoryProgressModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        categories={categories}
        progress={progress}
        examAttempts={examAttempts}
      />
    </div>
  );
}