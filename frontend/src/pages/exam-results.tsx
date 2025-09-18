import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckBadges, useTrackActivity } from "@/hooks/useAnalytics";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import { 
  Trophy, 
  X,
  CheckCircle,
  Target,
  TrendingUp,
  RotateCcw,
  Home,
  Award,
  Sparkles,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamResult {
  id: number;
  userId: string;
  categoryId: number;
  categoryName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  passed: boolean;
  questionsData?: any;
  createdAt: string;
}

interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  passed: boolean;
}

interface ExamResultsPageProps {
  examResult?: ExamResult;
  categoryBreakdowns?: CategoryBreakdown[];
  userName?: string;
}

interface RouteProps {
  params?: any;
}

// Motivational quotes for failed attempts
const motivationalQuotes = [
  "Every expert was once a beginner. Try again!",
  "Success is not final, failure is not fatal. Keep going!",
  "The only way to learn is to take off. Get back up there!",
  "Great pilots are made through practice and perseverance.",
  "Your wings are already there, you just need to trust them.",
  "Every setback is a setup for a comeback!",
  "The sky is not the limit, it's your playground.",
  "Champions keep playing until they get it right."
];

export default function ExamResults(_: RouteProps) {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const checkBadges = useCheckBadges();
  const trackActivity = useTrackActivity();
  const { updateQuizProgress } = useDailyProgress();
  const [currentQuote] = useState(() => 
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  // Get data from sessionStorage or use props
  const getStoredData = () => {
    if (typeof window !== 'undefined') {
      const storedResult = sessionStorage.getItem('examResult');
      const storedUserName = sessionStorage.getItem('userName');
      
      if (storedResult) {
        return {
          result: JSON.parse(storedResult),
          userDisplayName: storedUserName || 'Student'
        };
      }
    }
    return null;
  };

  const storedData = getStoredData();
  
  // If no data, redirect to mock exam
  if (!storedData) {
    setLocation("/mock-exam");
    return null;
  }

  const result = storedData.result;
  const breakdowns = [{ 
    categoryId: result.categoryId, 
    categoryName: result.categoryName, 
    score: result.score, 
    questionsAnswered: result.totalQuestions, 
    totalQuestions: result.totalQuestions, 
    passed: result.passed 
  }];
  const userDisplayName = storedData.userDisplayName;

  const overallPassed = breakdowns.every(breakdown => breakdown.passed);
  const overallScore = breakdowns.reduce((acc, curr) => acc + curr.score, 0) / breakdowns.length;

  useEffect(() => {
    // Track mock exam completion in analytics
    if (result) {
      trackActivity.mutate({
        activityType: 'mock_exam',
        categoryId: result.categoryId,
        score: result.score,
        questionsAnswered: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeSpent: Math.floor(result.timeTaken / 60), // Convert to minutes
        isPassed: result.passed
      });
    }
    
    // Check for new badges after exam completion
    checkBadges.mutate();
    
    // Update daily progress tracker for quiz completion (mock exam counts as quiz)
    updateQuizProgress.mutate();
    
    if (overallPassed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
    
      // Clear sessionStorage after component mounts  
    return () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('examResult');
        sessionStorage.removeItem('userName');
      }
    };
  }, [overallPassed]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const nameVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        type: "spring",
        bounce: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1200,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 10 : 800,
                  rotate: 360,
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 relative z-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header with User Name */}
          <motion.div variants={nameVariants} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {overallPassed ? (
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Congratulations, {userDisplayName}!
                </span>
              ) : (
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Keep Going, {userDisplayName}!
                </span>
              )}
            </h1>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              {overallPassed ? (
                <div className="relative">
                  <Trophy className="w-16 h-16 text-yellow-500" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>
              ) : (
                <div className="relative">
                  <Target className="w-16 h-16 text-blue-500" />
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Overall Score Summary */}
          <motion.div variants={itemVariants}>
            <Card className="mb-8 border-2 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Score Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold mb-4">
                  <span className={cn(
                    "bg-gradient-to-r bg-clip-text text-transparent",
                    overallPassed 
                      ? "from-green-600 to-emerald-600" 
                      : "from-orange-600 to-red-600"
                  )}>
                    {overallScore.toFixed(1)}%
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  Overall Performance
                </p>
                <div className="flex justify-center items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{breakdowns.reduce((acc, curr) => acc + curr.questionsAnswered, 0)} Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>{Math.round(breakdowns.reduce((acc, curr) => acc + (curr.score / 100 * curr.questionsAnswered), 0))} Correct</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="mb-8 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {breakdowns.map((breakdown, index) => (
                    <motion.div
                      key={breakdown.categoryId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 * index, duration: 0.5 }}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-300",
                        breakdown.passed 
                          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700" 
                          : "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {breakdown.passed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 * index, type: "spring", bounce: 0.6 }}
                            >
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 * index, type: "spring", bounce: 0.6 }}
                            >
                              <X className="w-6 h-6 text-red-600" />
                            </motion.div>
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{breakdown.categoryName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.questionsAnswered} of {breakdown.totalQuestions} questions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            <span className={cn(
                              breakdown.passed ? "text-green-600" : "text-red-600"
                            )}>
                              {breakdown.score.toFixed(1)}%
                            </span>
                          </div>
                          <Badge 
                            variant={breakdown.passed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {breakdown.passed ? "PASS ✅" : "FAIL ❌"}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Final Result Message */}
          <motion.div variants={itemVariants}>
            <Card className={cn(
              "mb-8 border-2 shadow-xl",
              overallPassed 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700" 
                : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-700"
            )}>
              <CardContent className="p-8 text-center">
                {overallPassed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      ✅
                    </motion.div>
                    <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
                      PASS
                    </h2>
                    <p className="text-xl text-green-600 dark:text-green-300 mb-2">
                      You passed! You're ready for takeoff!
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Excellent work! You've demonstrated mastery of the material.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">
                      FAIL
                    </h2>
                    <motion.p 
                      className="text-xl text-orange-600 dark:text-orange-300 mb-4 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    >
                      {currentQuote}
                    </motion.p>
                    <p className="text-lg text-muted-foreground">
                      Focus on the areas that need improvement and try again.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-4xl mx-auto"
          >
            <Button
              onClick={() => {
                console.log("Retake exam button clicked - navigating to /mock-exam");
                // Clear any stored exam data and return to mock exam
                sessionStorage.removeItem('examResult');
                sessionStorage.removeItem('userName');
                setTimeout(() => setLocation("/mock-exam"), 100);
              }}
              size="lg"
              className={cn(
                "flex items-center gap-2 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95",
                overallPassed 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-700 dark:to-emerald-700 dark:hover:from-green-800 dark:hover:to-emerald-800" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
              )}
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              {overallPassed ? "Take Another Exam" : "Try Again"}
            </Button>
            <Button
              onClick={() => {
                console.log("Back to dashboard button clicked - navigating to /");
                // Clear stored exam data and go to dashboard
                sessionStorage.removeItem('examResult');
                sessionStorage.removeItem('userName');
                setTimeout(() => setLocation("/"), 100);
              }}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                console.log("Study more button clicked - navigating to /study");
                setTimeout(() => setLocation("/study"), 100);
              }}
              variant="secondary"
              size="lg"
              className="flex items-center gap-2 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Study More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}