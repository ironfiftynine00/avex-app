import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TopNav from "@/components/navigation/top-nav";
import QuestionCard from "@/components/exam/question-card";
import { useToast } from "@/hooks/use-toast";
import { useQuizTracking } from "@/hooks/useStudyTracking";
import { useProgressDialog } from "@/contexts/ProgressDialogContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Clock, 
  Target, 
  X,
  Trophy
} from "lucide-react";

interface QuizState {
  isActive: boolean;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  skippedQuestions: number[];
  startTime: Date;
  timeLimit: number; // in minutes
  score: number;
  percentage: number;
  isFinished: boolean;
  maxSkips: number;
  config: any;
}

export default function QuizMode() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { openProgressDialog } = useProgressDialog();
  const [match, params] = useRoute("/study/quiz/category/:categoryId/subtopic/:subtopicId/questions");
  
  const categoryId = params?.categoryId ? parseInt(params.categoryId) : undefined;
  const subtopicId = params?.subtopicId ? parseInt(params.subtopicId) : undefined;
  const { completeQuiz } = useQuizTracking(categoryId, subtopicId ? [subtopicId] : undefined, openProgressDialog);
  
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00");
  const [showExitDialog, setShowExitDialog] = useState(false);

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/questions/subtopic', subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/subtopic/${subtopicId}`);
      return response.json();
    },
    enabled: !!subtopicId
  });

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryId, subtopicId]);

  // Get quiz config from sessionStorage and initialize when questions are loaded
  useEffect(() => {
    const savedConfig = sessionStorage.getItem('quizConfig');
    if (savedConfig && questions.length > 0) {
      const config = JSON.parse(savedConfig);
      initializeQuiz(config);
    } else if (!savedConfig) {
      // Redirect back to setup if no config
      setLocation(`/study/quiz/category/${categoryId}/subtopic/${subtopicId}`);
    }
  }, [categoryId, subtopicId, questions.length]);

  // Remove the problematic submitQuizMutation since we're using proper quiz tracking via useStudyTracking

  const initializeQuiz = (config: any) => {
    if (questions.length === 0) return;

    const shuffledQuestions = config.randomizeQuestions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;
    
    const quizQuestions = shuffledQuestions.slice(0, config.numQuestions);

    setQuizState({
      isActive: true,
      questions: quizQuestions,
      currentQuestionIndex: 0,
      answers: {},
      skippedQuestions: [],
      startTime: new Date(),
      timeLimit: config.timerMinutes,
      score: 0,
      percentage: 0,
      isFinished: false,
      maxSkips: config.maxSkips,
      config
    });

    // Initialize timer
    setTimeRemaining(`${config.timerMinutes}:00`);
  };

  // Timer effect
  useEffect(() => {
    if (!quizState?.isActive || quizState.timeLimit === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - quizState.startTime.getTime()) / 1000);
      const totalSeconds = quizState.timeLimit * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);

      if (remaining === 0) {
        handleSubmitQuiz();
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState]);

  const handleAnswerQuestion = (answer: string) => {
    if (!quizState) return;

    setQuizState(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [prev!.currentQuestionIndex]: answer
      }
    }));
  };

  const handleNextQuestion = () => {
    if (!quizState) return;

    // Update score when Next is clicked (Mock Exam style)
    const currentAnswer = quizState.answers[quizState.currentQuestionIndex];
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    if (currentAnswer && currentQuestion && currentAnswer === currentQuestion.correctAnswer) {
      setQuizState(prev => {
        const newScore = prev!.score + 1;
        const newPercentage = Math.round((newScore / prev!.questions.length) * 100);
        return {
          ...prev!,
          score: newScore,
          percentage: newPercentage
        };
      });
    }

    // Move to next question
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev!,
        currentQuestionIndex: prev!.currentQuestionIndex + 1
      }));
    } else {
      // Check for skipped questions
      if (quizState.skippedQuestions.length > 0) {
        // Go to first skipped question
        setQuizState(prev => ({
          ...prev!,
          currentQuestionIndex: prev!.skippedQuestions[0]
        }));
      } else {
        handleSubmitQuiz();
      }
    }
  };

  const handleSkipQuestion = () => {
    if (!quizState) return;
    
    const skipsRemaining = quizState.maxSkips - quizState.skippedQuestions.length;
    if (skipsRemaining > 0) {
      setQuizState(prev => ({
        ...prev!,
        skippedQuestions: [...prev!.skippedQuestions, prev!.currentQuestionIndex]
      }));
      
      // Move to next question
      handleNextQuestion();
    }
  };

  const handleSubmitQuiz = () => {
    if (!quizState) return;

    let correctAnswers = 0;
    const totalAnswered = Object.keys(quizState.answers).length;
    
    for (let i = 0; i < quizState.questions.length; i++) {
      const question = quizState.questions[i];
      const userAnswer = quizState.answers[i];
      
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    }

    const finalPercentage = Math.round((correctAnswers / quizState.questions.length) * 100);
    const passed = finalPercentage >= 70;

    const timeTaken = Math.floor((new Date().getTime() - quizState.startTime.getTime()) / 1000 / 60);

    const quizData = {
      categoryId,
      subtopicId,
      score: finalPercentage.toString(),
      totalQuestions: quizState.questions.length,
      correctAnswers,
      timeTaken: timeTaken || 1,
      passed,
      questionsData: quizState.questions,
      answers: quizState.answers,
      questionsAnswered: totalAnswered,
      questionsSkipped: quizState.skippedQuestions.length,
      studyMode: 'quiz'
    };

    console.log("Quiz completed with data:", quizData);
    
    // Create question results for overall progress tracking
    const questionResults = quizState.questions.map((question, index) => ({
      questionId: question.id,
      isCorrect: quizState.answers[index] === question.correctAnswer,
      userAnswer: quizState.answers[index] || null,
      correctAnswer: question.correctAnswer
    }));

    // Track quiz completion for analytics and study streak
    completeQuiz({
      score: finalPercentage,
      percentage: finalPercentage,
      questionsAnswered: totalAnswered,
      correctAnswers: correctAnswers,
      questionResults: questionResults
    });
    
    // Store results for the results page
    sessionStorage.setItem('quizResults', JSON.stringify({
      ...quizData,
      percentage: finalPercentage,
      categoryName: quizState.config.categoryName,
      subtopicName: quizState.config.subtopicName
    }));
    
    // Navigate to results page
    setLocation("/study/quiz-results");
    setQuizState(prev => ({ ...prev!, isActive: false, isFinished: true }));
  };

  const handleExitQuiz = () => {
    setQuizState(null);
    setShowExitDialog(false);
    sessionStorage.removeItem('quizConfig');
    toast({
      title: "Quiz Exited",
      description: "You have left the quiz. Your progress was not saved.",
    });
    setLocation(`/study/quiz/category/${categoryId}/subtopic/${subtopicId}`);
  };

  if (!quizState?.isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const skipsRemaining = quizState.maxSkips - quizState.skippedQuestions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <TopNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quiz Header */}
        <div className="bg-orange-600 text-white p-4 rounded-t-lg border-4 border-orange-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">QUIZ MODE</h1>
                <p className="text-orange-100 text-sm">{quizState.config.subtopicName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitDialog(true)}
                className="bg-orange-700 hover:bg-orange-800 border-orange-500 text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Exit Quiz
              </Button>
              {quizState.timeLimit > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{timeRemaining}</div>
                  <div className="text-orange-200 text-sm">Time Remaining</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          currentScore={quizState.score}
          timeRemaining={timeRemaining}
          skipsRemaining={skipsRemaining}
          onAnswer={handleAnswerQuestion}
          onSkip={handleSkipQuestion}
          onFlag={() => {}}
          onNext={handleNextQuestion}
          onSubmit={handleSubmitQuiz}
          selectedAnswer={quizState.answers[quizState.currentQuestionIndex]}
          isQuizMode={true}
          showCorrectAnswer={false}
          cumulativePercentage={quizState.percentage}
          quizModeTitle="Study Quiz"
        />
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit the quiz? Your progress will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitQuiz} className="bg-red-600 hover:bg-red-700">
              Exit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}