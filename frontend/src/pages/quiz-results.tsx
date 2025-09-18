import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/top-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuizTracking } from "@/hooks/useStudyTracking";
import { useTrackActivity, useCheckBadges } from "@/hooks/useAnalytics";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import { BadgeNotification } from "@/components/ui/badge-notification";
import { 
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  Star
} from "lucide-react";

interface QuizResults {
  score?: string;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  passed: boolean;
  questionsData: any[];
  answers: Record<number, string>;
  questionsAnswered: number;
  questionsSkipped: number;
  categoryName: string;
  subtopicName: string;
  categoryId: number;
  subtopicId: number;
}

export default function QuizResults() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { completeQuiz } = useQuizTracking();
  const trackActivity = useTrackActivity();
  const checkBadges = useCheckBadges();
  const { updateQuizProgress } = useDailyProgress();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<any>(null);

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('quizResults');
    if (savedResults) {
      const quizResults = JSON.parse(savedResults);
      setResults(quizResults);
      
      // Create question results for overall progress tracking
      const questionResults = quizResults.questionsData.map((question: any, index: number) => ({
        questionId: question.id,
        isCorrect: quizResults.answers[index] === question.correctAnswer,
        userAnswer: quizResults.answers[index] || null,
        correctAnswer: question.correctAnswer
      }));
      
      // Track quiz completion for study streak
      completeQuiz({
        score: quizResults.percentage || parseFloat(quizResults.score || '0'),
        percentage: quizResults.percentage || parseFloat(quizResults.score || '0'),
        questionsAnswered: quizResults.questionsAnswered,
        correctAnswers: quizResults.correctAnswers,
        questionResults: questionResults
      });

      // Track analytics activity with question results for overall progress
      trackActivity.mutate({
        activityType: 'quiz',
        subtopicIds: [quizResults.subtopicId],
        categoryId: quizResults.categoryId,
        score: quizResults.percentage || parseFloat(quizResults.score || '0'),
        questionsAnswered: quizResults.questionsAnswered,
        correctAnswers: quizResults.correctAnswers,
        timeSpent: Math.floor(quizResults.timeTaken / 60), // Convert to minutes
        isPassed: quizResults.passed
      });

      // Check for new badges
      checkBadges.mutate();
      
      // Update daily progress tracker for quiz completion
      updateQuizProgress.mutate();
      
      // Show confetti for passing score
      if (quizResults.passed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      // No results found, redirect to study mode
      setLocation('/study');
    }
  }, [completeQuiz]);

  const handleRetakeQuiz = () => {
    if (results) {
      // Clear previous results and quiz config to start fresh
      sessionStorage.removeItem('quizResults');
      sessionStorage.removeItem('quizConfig');
      
      // Use the stored category and subtopic IDs from results
      if (results.categoryId && results.subtopicId) {
        setLocation(`/study/quiz/category/${results.categoryId}/subtopic/${results.subtopicId}`);
      } else {
        // Fallback to study mode if IDs not available
        setLocation('/study');
      }
    }
  };

  const handleBackToStudy = () => {
    // Clear all quiz-related session data
    sessionStorage.removeItem('quizResults');
    sessionStorage.removeItem('quizConfig');
    
    // Navigate back to study mode selection
    setLocation('/study');
  };

  const handleViewMissedQuestions = () => {
    // Show detailed review of incorrect answers
    setShowMissedQuestions(true);
    
    // Scroll to the review section instantly after state update
    setTimeout(() => {
      const reviewSection = document.getElementById('review-section');
      if (reviewSection) {
        reviewSection.scrollIntoView({ 
          behavior: 'instant',
          block: 'start'
        });
      }
    }, 10);
  };

  const [showMissedQuestions, setShowMissedQuestions] = useState(false);

  // Helper function to get full choice text from letter
  const getChoiceText = (question: any, choiceLetter: string) => {
    if (!choiceLetter) return 'No answer selected';
    
    switch (choiceLetter.toUpperCase()) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
      default: return choiceLetter;
    }
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const missedQuestions = results.questionsData.filter((question, index) => {
    const userAnswer = results.answers[index];
    return userAnswer && userAnswer !== question.correctAnswer;
  });

  const skippedQuestions = results.questionsData.filter((question, index) => {
    return !results.answers[index];
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <TopNav />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-animation">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className={`${results.passed ? 'bg-green-600' : 'bg-red-600'} text-white p-6 rounded-t-lg border-4 ${results.passed ? 'border-green-700' : 'border-red-700'}`}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {results.passed ? (
                <Trophy className="w-8 h-8 text-yellow-300" />
              ) : (
                <Target className="w-8 h-8" />
              )}
              <h1 className="text-3xl font-bold">
                {results.passed ? 'Quiz Completed!' : 'Quiz Completed'}
              </h1>
            </div>
            <p className={`text-lg ${results.passed ? 'text-green-100' : 'text-red-100'} mb-2`}>
              {results.subtopicName}
            </p>
            <p className={`text-sm ${results.passed ? 'text-green-200' : 'text-red-200'}`}>
              {results.categoryName}
            </p>
          </div>
        </div>

        <Card className="rounded-t-none border-t-0">
          <CardContent className="p-6">
            {/* Score Overview */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {results.percentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {results.timeTaken}m
                  </div>
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                </div>
              </div>

              <Progress 
                value={results.percentage} 
                className="h-4 mb-4" 
              />

              <Badge 
                className={`text-lg px-4 py-2 ${
                  results.passed 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                {results.passed ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Passed (70% or higher)
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Did not pass (below 70%)
                  </>
                )}
              </Badge>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Correct Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    Incorrect Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {missedQuestions.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    Questions Skipped
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {results.questionsSkipped}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRetakeQuiz} 
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              
              {missedQuestions.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleViewMissedQuestions}
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950 w-full sm:w-auto"
                  size="lg"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Review Mistakes ({missedQuestions.length})
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleBackToStudy}
                className="w-full sm:w-auto"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Study
              </Button>
            </div>

            {/* Motivational Message */}
            <div className="mt-8 text-center">
              {results.passed ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Excellent work! You've demonstrated strong understanding of this topic.
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                    Keep up the great studying to master your AMT certification!
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Don't give up! Review the material and try again.
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    Each attempt helps you learn and improve your AMT knowledge.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missed Questions Review */}
        {showMissedQuestions && missedQuestions.length > 0 && (
          <Card id="review-section" className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Review Incorrect Answers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {missedQuestions.map((question, index) => {
                const questionIndex = results.questionsData.indexOf(question);
                const userAnswer = results.answers[questionIndex];
                
                return (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="font-medium text-foreground">
                      Question {questionIndex + 1}: {question.questionText}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">Your Answer:</p>
                        <p className="text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                          <span className="font-semibold">{userAnswer || 'None'}:</span> {getChoiceText(question, userAnswer)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-600">Correct Answer:</p>
                        <p className="text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                          <span className="font-semibold">{question.correctAnswer}:</span> {getChoiceText(question, question.correctAnswer)}
                        </p>
                      </div>
                    </div>
                    
                    {question.explanation && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600">Explanation:</p>
                        <p className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMissedQuestions(false)}
                >
                  Hide Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        .confetti-animation {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            top: -10px;
            transform: rotateZ(0deg);
          }
          100% {
            top: 100vh;
            transform: rotateZ(360deg);
          }
        }
      `}</style>
      
      {/* Badge Notification */}
      <BadgeNotification
        badge={earnedBadge}
        isVisible={showBadgeNotification}
        onClose={() => setShowBadgeNotification(false)}
      />
    </div>
  );
}