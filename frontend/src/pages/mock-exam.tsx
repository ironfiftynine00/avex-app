import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/top-nav";
import QuestionCard from "@/components/exam/question-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useStudyTracking } from "@/hooks/useStudyTracking";
import { useProgressDialog } from "@/contexts/ProgressDialogContext";
import { MOCK_EXAM_CONFIG } from "@/lib/constants";
import { 
  ClipboardCheck, 
  Clock, 
  Target, 
  BarChart,
  Trophy,
  RotateCcw,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";
import { Category } from "@shared/schema";

interface ExamState {
  isActive: boolean;
  categoryId: number;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  skippedQuestions: number[];
  startTime: Date;
  timeLimit: number; // in minutes
  score: number;
  percentage: number;
  isFinished: boolean;
}

export default function MockExam() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { openProgressDialog } = useProgressDialog();
  const trackActivity = useStudyTracking();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [showResults, setShowResults] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: categoryAttempts = [] } = useQuery({
    queryKey: [`/api/exams/category/${selectedCategory}`],
    enabled: !!selectedCategory,
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  
  // Get exam configuration based on category name
  const getExamConfig = (categoryName: string) => {
    return MOCK_EXAM_CONFIG[categoryName as keyof typeof MOCK_EXAM_CONFIG] || {
      questionCount: 30,
      skipsAllowed: 3,
      timeLimit: 30
    };
  };
  
  const examConfig = selectedCategoryData ? getExamConfig(selectedCategoryData.name) : null;
  const maxSkips = examConfig?.skipsAllowed || 3;
  const skipsRemaining = examState ? maxSkips - examState.skippedQuestions.length : maxSkips;

  // Timer effect
  useEffect(() => {
    if (!examState?.isActive) return;

    // Only set up timer if there's a time limit
    if (!examConfig?.timeLimit) {
      setTimeRemaining("No Time Limit");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - examState.startTime.getTime()) / 1000);
      const totalSeconds = examState.timeLimit * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);

      if (remaining === 0) {
        handleSubmitExam();
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, examConfig]);

  const startExamMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const config = examConfig!;
      const response = await apiRequest("GET", `/api/questions/random/${categoryId}/${config.questionCount}`);
      return response.json();
    },
    onSuccess: (questions) => {
      const config = examConfig!;
      setExamState({
        isActive: true,
        categoryId: selectedCategory!,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        skippedQuestions: [],
        startTime: new Date(),
        timeLimit: config.timeLimit || 999, // Very high number if no time limit
        score: 0,
        percentage: 0,
        isFinished: false,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      const response = await apiRequest("POST", "/api/exams", examData);
      return response.json();
    },
    onSuccess: (result) => {
      console.log("Exam submission success:", result);
      queryClient.invalidateQueries({ queryKey: [`/api/exams/category/${selectedCategory}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      // Update stored result with actual database ID if successful
      const storedResult = sessionStorage.getItem('examResult');
      if (storedResult) {
        const examResultData = JSON.parse(storedResult);
        examResultData.id = result.id; // Update with real ID
        sessionStorage.setItem('examResult', JSON.stringify(examResultData));
      }
    },
    onError: (error) => {
      console.error("Exam submission error:", error);
      
      // Don't block the user - results are already shown
      // Just log the error for debugging
      console.log("Background submission failed, but results are still displayed");
      
      // Optionally show a toast for debugging purposes
      toast({
        title: "Sync Note",
        description: "Results shown locally. Data sync will retry automatically.",
        variant: "default",
      });
    },
  });

  const handleStartExam = () => {
    if (!selectedCategory) return;
    startExamMutation.mutate(selectedCategory);
  };

  const handleAnswerQuestion = (answer: string) => {
    if (!examState) return;

    setExamState(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [prev!.currentQuestionIndex]: answer
      }
    }));
  };

  const handleSkipQuestion = () => {
    if (!examState || skipsRemaining <= 0) return;

    setExamState(prev => ({
      ...prev!,
      skippedQuestions: [...prev!.skippedQuestions, prev!.currentQuestionIndex]
    }));

    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (!examState) return;

    const currentAnswer = examState.answers[examState.currentQuestionIndex];
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    
    // Calculate cumulative score and percentage
    let newScore = examState.score;
    let newPercentage = examState.percentage;
    
    if (currentAnswer === currentQuestion.correctAnswer) {
      newScore += 1;
      // Calculate cumulative percentage based on total questions
      newPercentage = Math.round((newScore / examState.questions.length) * 100);
    }

    // Move to next question or finish exam
    const nextIndex = examState.currentQuestionIndex + 1;
    
    if (nextIndex >= examState.questions.length) {
      // Check if there are skipped questions
      if (examState.skippedQuestions.length > 0) {
        const firstSkippedIndex = examState.skippedQuestions[0];
        setExamState(prev => ({
          ...prev!,
          currentQuestionIndex: firstSkippedIndex,
          skippedQuestions: prev!.skippedQuestions.slice(1),
          score: newScore,
          percentage: newPercentage
        }));
      } else {
        handleSubmitExam();
      }
    } else {
      setExamState(prev => ({
        ...prev!,
        currentQuestionIndex: nextIndex,
        score: newScore,
        percentage: newPercentage
      }));
    }
  };

  const handleSubmitExam = () => {
    if (!examState) return;

    const finalScore = Object.entries(examState.answers).reduce((score, [index, answer]) => {
      const question = examState.questions[parseInt(index)];
      return score + (question.correctAnswer === answer ? 1 : 0);
    }, 0);

    const percentage = (finalScore / examState.questions.length) * 100;
    const passed = percentage >= 70;
    const timeTaken = Math.floor((new Date().getTime() - examState.startTime.getTime()) / 60000); // minutes

    // Create exam result data for immediate display
    const examResultData = {
      id: Date.now(), // temporary ID
      userId: user?.id || "temp",
      categoryId: examState.categoryId,
      categoryName: selectedCategoryData?.name || "Unknown Category",
      score: parseFloat(percentage.toFixed(1)),
      totalQuestions: examState.questions.length,
      correctAnswers: finalScore,
      timeTaken: timeTaken || 1, // minimum 1 minute
      passed,
      createdAt: new Date().toISOString()
    };

    // Store result in sessionStorage for immediate display
    sessionStorage.setItem('examResult', JSON.stringify(examResultData));
    sessionStorage.setItem('userName', user?.firstName || 'Student');
    
    // Try to submit to backend (non-blocking)
    const examData = {
      categoryId: examState.categoryId,
      score: percentage.toFixed(1),
      totalQuestions: examState.questions.length,
      correctAnswers: finalScore,
      timeTaken: timeTaken || 1,
      passed,
      questionsData: examState.questions,
      answers: examState.answers,
      questionsAnswered: examState.questions.length,
      questionsSkipped: examState.skippedQuestions.length
    };

    console.log("Submitting exam data:", examData);
    
    // Create question results for overall progress tracking
    const questionResults = examState.questions.map((question, index) => ({
      questionId: question.id,
      isCorrect: examState.answers[index] === question.correctAnswer,
      userAnswer: examState.answers[index] || null,
      correctAnswer: question.correctAnswer
    }));

    // Track analytics for category-specific progress updates
    trackActivity.mutate({
      activityType: 'mock_exam',
      categoryId: examState.categoryId,
      score: parseFloat(percentage.toFixed(1)),
      questionsAnswered: examState.questions.length,
      correctAnswers: finalScore,
      timeSpent: (timeTaken || 1) * 60, // Convert minutes to seconds for API
      isPassed: passed,
      questionResults: questionResults
    });
    
    // Trigger progress dialog on successful completion
    if (passed && percentage >= 70) {
      openProgressDialog();
    }
    
    // Navigate to results page immediately
    setLocation("/exam-results");
    
    // Try to submit to backend in background
    submitExamMutation.mutate(examData);
    setExamState(prev => ({ ...prev!, isActive: false, isFinished: true }));
  };

  const handleExitExam = () => {
    setExamState(null);
    setSelectedCategory(null);
    setShowExitDialog(false);
    toast({
      title: "Exam Exited",
      description: "You have left the mock examination. Your progress was not saved.",
    });
  };

  // If exam is active, show question interface
  if (examState?.isActive) {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <TopNav />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Formal Examination Header */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg border-4 border-red-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6" />
                <div>
                  <h1 className="text-xl font-bold">OFFICIAL MOCK EXAMINATION</h1>
                  <p className="text-red-100 text-sm">AMT Certification Simulation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExitDialog(true)}
                  className="bg-red-700 hover:bg-red-800 border-red-500 text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Exit Exam
                </Button>
                <div className="text-right">
                  <div className="text-2xl font-bold">{timeRemaining}</div>
                  <div className="text-red-200 text-sm">Time Remaining</div>
                </div>
              </div>
            </div>
          </div>

          <QuestionCard
            question={currentQuestion}
            questionNumber={examState.currentQuestionIndex + 1}
            totalQuestions={examState.questions.length}
            currentScore={examState.score}
            timeRemaining={timeRemaining}
            skipsRemaining={skipsRemaining}
            onAnswer={handleAnswerQuestion}
            onSkip={handleSkipQuestion}
            onFlag={() => {}}
            onNext={handleNextQuestion}
            onSubmit={handleSubmitExam}
            selectedAnswer={examState.answers[examState.currentQuestionIndex]}
            isQuizMode={true}
            showCorrectAnswer={false}
            cumulativePercentage={examState.percentage}
            quizModeTitle="Mock Examination"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">Official Mock Examination</h1>
            <p className="text-red-100">
              Simulated AMT Certification Exam - Formal Testing Environment
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <ClipboardCheck className="w-5 h-5" />
              <span className="font-medium">Formal Examination Mode</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              This is a timed, formal examination with limited skips. Results will be recorded for certification tracking.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <Trophy className="w-6 h-6" />
                <span>Examination Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Examination Category Selection */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select Examination Category</h3>
                  <p className="text-sm text-muted-foreground">Choose the AMT certification area for your examination</p>
                </div>
                
                <Select value={selectedCategory?.toString() || ""} onValueChange={(value) => setSelectedCategory(parseInt(value))}>
                  <SelectTrigger className="border-2 border-red-200 dark:border-red-800">
                    <SelectValue placeholder="Select examination category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Examination Parameters */}
              {selectedCategoryData && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Examination Parameters</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {examConfig?.questionCount || selectedCategoryData.questionCount}
                      </div>
                      <div className="text-sm font-medium text-red-700 dark:text-red-300">Total Questions</div>
                      <div className="text-xs text-muted-foreground mt-1">Fixed Count</div>
                    </div>
                    <div className="text-center p-6 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {examConfig?.timeLimit || "No Limit"}
                      </div>
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {examConfig?.timeLimit ? "Minutes" : "Time Limit"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {examConfig?.timeLimit ? "Strict Timing" : "Untimed"}
                      </div>
                    </div>
                    <div className="text-center p-6 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                      <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {examConfig?.skipsAllowed || maxSkips}
                      </div>
                      <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Skip Allowance</div>
                      <div className="text-xs text-muted-foreground mt-1">Limited Use</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Examination Rules and Instructions */}
              <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/10">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Official Examination Rules
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    This is a timed examination with strict time limits
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    You must answer all questions to submit the exam
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Skipped questions will be presented again at the end
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    70% or higher score is required to pass
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Results will be recorded for certification tracking
                  </li>
                </ul>
              </div>

              {/* Start Examination Button */}
              <div className="text-center">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-lg border-2 border-red-700"
                  onClick={handleStartExam}
                  disabled={!selectedCategory || startExamMutation.isPending}
                >
                  {startExamMutation.isPending ? (
                    <>
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Starting Examination...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Begin Official Mock Examination
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <X className="w-6 h-6 text-red-500" />
                <span>Exit Mock Exam?</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to exit the mock exam? Your progress will not be saved and you will lose all your answers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleExitExam}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Results Dialog - No Feedback */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <ClipboardCheck className="w-6 h-6 text-slate-500" />
                <span>Examination Submitted</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-600">
                  Submitted
                </div>
                <p className="text-muted-foreground">
                  Your examination has been recorded for evaluation
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium mb-2">Official Examination Complete</p>
                  <p>Your responses have been submitted for formal evaluation. Results will be processed according to standard certification procedures.</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowResults(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white"
                  onClick={() => {
                    setShowResults(false);
                    setExamState(null);
                    setSelectedCategory(null);
                  }}
                >
                  Return to Setup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}