import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/top-nav";
import QuestionCard from "@/components/exam/question-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ClipboardCheck, 
  Clock, 
  Target, 
  BarChart,
  Trophy,
  RotateCcw,
  CheckCircle,
  XCircle
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
  isFinished: boolean;
}

export default function MockExam() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [showResults, setShowResults] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const { data: examAttempts } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: categoryAttempts = [] } = useQuery<any[]>({
    queryKey: [`/api/exams/category/${selectedCategory}`],
    enabled: !!selectedCategory,
  });

  const startExamMutation = useMutation({
    mutationFn: async ({ categoryId, questionCount }: { categoryId: number; questionCount: number }) => {
      const response = await apiRequest("GET", `/api/questions/random/${categoryId}/${questionCount}`);
      return response.json();
    },
    onSuccess: (questions) => {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category || !selectedCategory) return;

      setExamState({
        isActive: true,
        categoryId: selectedCategory,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        skippedQuestions: [],
        startTime: new Date(),
        timeLimit: 60, // Default 60 minutes
        score: 0,
        isFinished: false,
      });
    },
    onError: (error) => {
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
      setShowResults(true);
      setExamState(null);
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Exam Completed",
        description: `You scored ${result.score}%`,
        variant: result.passed ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (!examState?.isActive || examState.isFinished) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - examState.startTime.getTime()) / 1000);
      const totalSeconds = examState.timeLimit * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      if (remaining === 0) {
        // Time's up - finish exam
        handleFinishExam();
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [examState]);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const maxSkips = selectedCategoryData && selectedCategoryData.questionCount ? 
    (selectedCategoryData.questionCount <= 15 ? 1 : 
     selectedCategoryData.questionCount <= 30 ? 2 : 3) : 0;

  const handleFinishExam = () => {
    if (!examState || !user) return;
    
    const timeSpentSeconds = Math.floor((new Date().getTime() - examState.startTime.getTime()) / 1000);
    const correctAnswers = examState.score;
    const scorePercentage = Math.round((correctAnswers / examState.questions.length) * 100);
    
    const examData = {
      userId: user.id,
      categoryId: examState.categoryId,
      score: scorePercentage.toString(),
      totalQuestions: examState.questions.length,
      correctAnswers: correctAnswers,
      timeTaken: timeSpentSeconds,
      passed: (correctAnswers / examState.questions.length) >= 0.7,
      questionsData: examState.questions,
      timeSpent: timeSpentSeconds,
      questionsAnswered: Object.keys(examState.answers).length,
      questionsSkipped: examState.skippedQuestions.length,
      categoryName: categories.find(c => c.id === examState.categoryId)?.name || '',
      answers: examState.answers,
    };
    
    submitExamMutation.mutate(examData);
  };

  const handleSubmitExam = () => {
    handleFinishExam();
  };

  const handleStartExam = () => {
    if (!selectedCategoryData || !selectedCategory) return;
    
    startExamMutation.mutate({
      categoryId: selectedCategory,
      questionCount: selectedCategoryData.questionCount || 50, // Default to 50 questions
    });
  };

  const handleAnswerQuestion = (answer: string) => {
    if (!examState) return;

    setExamState(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [prev!.currentQuestionIndex]: answer,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (!examState) return;

    const currentAnswer = examState.answers[examState.currentQuestionIndex];
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    
    // Calculate score
    let newScore = examState.score;
    if (currentAnswer === currentQuestion.correctAnswer) {
      newScore += 1;
    }

    // Move to next question or finish exam
    const nextIndex = examState.currentQuestionIndex + 1;
    
    if (nextIndex >= examState.questions.length) {
      // Check if there are skipped questions
      if (examState.skippedQuestions.length > 0) {
        // Go to first skipped question
        const firstSkipped = examState.skippedQuestions[0];
        setExamState(prev => ({
          ...prev!,
          currentQuestionIndex: firstSkipped,
          score: newScore,
        }));
      } else {
        // Finish exam
        handleFinishExam();
      }
    } else {
      setExamState(prev => ({
        ...prev!,
        currentQuestionIndex: nextIndex,
        score: newScore,
      }));
    }
  };

  const handleSkipQuestion = () => {
    if (!examState || examState.skippedQuestions.length >= maxSkips) return;

    setExamState(prev => ({
      ...prev!,
      skippedQuestions: [...prev!.skippedQuestions, prev!.currentQuestionIndex],
      currentQuestionIndex: prev!.currentQuestionIndex + 1,
    }));
  };





  if (examState?.isActive) {
    const currentQuestion = examState.questions[examState.currentQuestionIndex];
    const skipsRemaining = maxSkips - examState.skippedQuestions.length;
    const progress = ((examState.currentQuestionIndex + 1) / examState.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
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
                        {selectedCategoryData.questionCount}
                      </div>
                      <div className="text-sm font-medium text-red-700 dark:text-red-300">Total Questions</div>
                      <div className="text-xs text-muted-foreground mt-1">Fixed Count</div>
                    </div>
                    <div className="text-center p-6 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {selectedCategoryData.timeLimit}
                      </div>
                      <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Minutes</div>
                      <div className="text-xs text-muted-foreground mt-1">Strict Timing</div>
                    </div>
                    <div className="text-center p-6 border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                      <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {maxSkips}
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

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Examination Completed</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500">
                  Complete!
                </div>
                <p className="text-muted-foreground">
                  Your official examination has been submitted successfully
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pass Threshold</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowResults(false)}
                >
                  Review Answers
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setShowResults(false);
                    handleStartExam();
                  }}
                >
                  Retake Examination
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Attempts</span>
                    <span className="font-medium">{categoryAttempts.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pass Rate</span>
                    <span className="font-medium">
                      {categoryAttempts.length > 0 
                        ? Math.round((categoryAttempts.filter((a: any) => a.passed).length / categoryAttempts.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Highest Score</span>
                    <span className="font-medium">
                      {categoryAttempts.length > 0 
                        ? Math.round(Math.max(...categoryAttempts.map((a: any) => parseFloat(a.score))))
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Exam Completed</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500">
                  Complete!
                </div>
                <p className="text-muted-foreground">
                  Your exam has been submitted successfully
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pass Threshold</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowResults(false)}
                >
                  Review Answers
                </Button>
                <Button 
                  className="flex-1 avex-button-primary"
                  onClick={() => {
                    setShowResults(false);
                    handleStartExam();
                  }}
                >
                  Retake Exam
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
