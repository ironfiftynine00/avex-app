import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StudyHeader from "@/components/study/study-header";
import SimpleQuestionCard from "@/components/study/simple-question-card";
import { useStudyActivityTracker } from "@/hooks/useStudyActivityTracker";
import { 
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle
} from "lucide-react";
import type { Question, Category, Subtopic } from "@shared/schema";

export default function StudyQuestions() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/study/:mode/category/:categoryId/subtopic/:subtopicId/questions");
  
  const mode = params?.mode || 'review';
  const categoryId = parseInt(params?.categoryId || '0');
  const subtopicId = parseInt(params?.subtopicId || '0');

  // Question navigation states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  // Quiz mode specific states
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
  const [skipsRemaining, setSkipsRemaining] = useState(3);
  const [skippedQuestions, setSkippedQuestions] = useState<number[]>([]);
  const [isRecallingSkipped, setIsRecallingSkipped] = useState(false);
  const [skippedRecallIndex, setSkippedRecallIndex] = useState(0);

  // Practice mode states
  const [practiceStarted, setPracticeStarted] = useState(false);

  // Streak tracking
  const { trackReviewActivity, trackPracticeActivity, trackQuizActivity } = useStudyActivityTracker();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);

  // Data queries
  const { data: category } = useQuery({
    queryKey: ['/api/categories', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`);
      return response.json();
    },
    enabled: !!categoryId
  });

  const { data: subtopic } = useQuery({
    queryKey: ['/api/subtopics', subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/subtopics/${subtopicId}`);
      return response.json();
    },
    enabled: !!subtopicId
  });

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['/api/questions/subtopic', subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/subtopic/${subtopicId}`);
      const questions = await response.json();
      
      // Shuffle questions for quiz mode
      if (mode === 'quiz') {
        return questions.sort(() => Math.random() - 0.5);
      }
      
      return questions;
    },
    enabled: !!subtopicId
  });

  // Timer effect for Quiz Mode
  useEffect(() => {
    if (mode === 'quiz' && quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, quizStarted, timeRemaining]);

  // Track review and practice activity based on time and completion
  useEffect(() => {
    if (!sessionStartTime) return;

    const trackActivity = () => {
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      
      if (mode === 'review') {
        // Track review if user spent at least 2 minutes or viewed all questions
        if (duration >= 120 || currentIndex >= questions.length - 1) {
          trackReviewActivity({ 
            duration, 
            scrolledToEnd: currentIndex >= questions.length - 1 
          });
        }
      } else if (mode === 'practice') {
        // Track practice if user answered at least 5 questions
        if (questionsAnsweredCount >= 5) {
          trackPracticeActivity({ questionsAnswered: questionsAnsweredCount });
        }
      }
    };

    // Track activity when user reaches end or after sufficient time
    if (currentIndex >= questions.length - 1 || 
        (sessionStartTime && (new Date().getTime() - sessionStartTime.getTime()) >= 120000)) {
      trackActivity();
    }

    // Cleanup tracking on component unmount
    return () => {
      if (sessionStartTime && mode !== 'quiz') {
        trackActivity();
      }
    };
  }, [mode, currentIndex, questions.length, questionsAnsweredCount, sessionStartTime]);

  const handleBack = () => {
    setLocation(`/study/${mode}/category/${categoryId}/subtopics`);
  };

  const handleStart = () => {
    if (mode === 'quiz') {
      setQuizStarted(true);
      setTimeRemaining(questions.length * 60); // 1 minute per question
    } else if (mode === 'practice') {
      setPracticeStarted(true);
    }
    setCurrentIndex(0);
    setAnswers({});
    setShowExplanation(false);
    setSessionStartTime(new Date());
    setQuestionsAnsweredCount(0);
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [getCurrentQuestionIndex()]: answer
    }));
    
    // Track answered question count for streak calculation
    const currentQuestionIndex = getCurrentQuestionIndex();
    if (!prev[currentQuestionIndex]) {
      setQuestionsAnsweredCount(count => count + 1);
    }
  };

  const getCurrentQuestionIndex = () => {
    if (isRecallingSkipped) {
      return skippedQuestions[skippedRecallIndex];
    }
    return currentIndex;
  };

  const getCurrentQuestion = () => {
    return questions[getCurrentQuestionIndex()];
  };

  const handleNext = () => {
    if (mode === 'review') {
      setShowExplanation(true);
      setTimeout(() => {
        setShowExplanation(false);
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }, 3000); // Show explanation for 3 seconds
    } else if (mode === 'practice') {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (mode === 'quiz') {
      handleQuizNext();
    }
  };

  const handleQuizNext = () => {
    if (isRecallingSkipped) {
      if (skippedRecallIndex < skippedQuestions.length - 1) {
        setSkippedRecallIndex(prev => prev + 1);
      } else {
        handleQuizComplete();
      }
    } else {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (skippedQuestions.length > 0) {
        setIsRecallingSkipped(true);
        setSkippedRecallIndex(0);
      } else {
        handleQuizComplete();
      }
    }
  };

  const handleSkip = () => {
    if (mode === 'quiz' && skipsRemaining > 0 && !isRecallingSkipped) {
      setSkippedQuestions(prev => [...prev, currentIndex]);
      setSkipsRemaining(prev => prev - 1);
      handleQuizNext();
    }
  };

  const handleQuizComplete = () => {
    // Calculate results and navigate to results page
    let correctAnswers = 0;
    questions.forEach((question: Question, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = percentage >= 70;
    
    // Track quiz completion for streak
    trackQuizActivity({ completed: true });
    
    // Store results in sessionStorage for results page
    sessionStorage.setItem('quizResults', JSON.stringify({
      score: correctAnswers,
      totalQuestions: questions.length,
      percentage,
      passed,
      category: category?.name,
      subtopic: subtopic?.name
    }));
    
    setLocation('/exam-results');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader title="Loading..." />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const getModeTitle = () => {
    switch (mode) {
      case 'review': return 'Review Mode';
      case 'practice': return 'Practice Mode';
      case 'quiz': return 'Quiz Mode';
      default: return 'Study Mode';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'review': return 'bg-blue-500';
      case 'practice': return 'bg-green-500';
      case 'quiz': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const shouldShowStartScreen = () => {
    if (mode === 'review') return false; // Review starts immediately
    if (mode === 'practice') return !practiceStarted;
    if (mode === 'quiz') return !quizStarted;
    return false;
  };

  if (shouldShowStartScreen()) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader 
          title={getModeTitle()} 
          onBack={handleBack}
        />
        
        <div className="p-4 space-y-6">
          <div className="text-center space-y-4">
            <Badge className={`${getModeColor()} text-white`}>
              {getModeTitle()}
            </Badge>
            <h1 className="text-2xl font-bold text-foreground">
              {subtopic?.name}
            </h1>
            <p className="text-muted-foreground">{category?.name}</p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-foreground">
                <strong>{questions.length}</strong> questions available
              </p>
              {mode === 'quiz' && (
                <>
                  <p className="text-sm text-foreground">
                    <strong>Time:</strong> {questions.length} minutes ({formatTime(questions.length * 60)})
                  </p>
                  <p className="text-sm text-foreground">
                    <strong>Skips:</strong> 3 allowed
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className={getModeColor()}
              onClick={handleStart}
            >
              <Play className="w-5 h-5 mr-2" />
              Start {getModeTitle()}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader 
          title={getModeTitle()} 
          onBack={handleBack}
        />
        
        <div className="p-4 text-center py-12">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Questions Available</h3>
          <p className="text-muted-foreground">
            This subtopic doesn't have any questions yet.
          </p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = ((getCurrentQuestionIndex() + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <StudyHeader 
        title={`${getModeTitle()} - ${subtopic?.name}`} 
        onBack={handleBack}
      />
      
      <div className="p-4 space-y-4">
        {/* Progress and Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Badge className={`${getModeColor()} text-white`}>
              Question {getCurrentQuestionIndex() + 1} of {questions.length}
            </Badge>
            {mode === 'quiz' && (
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-foreground">
                  Time: {formatTime(timeRemaining)}
                </span>
                <span className="text-foreground">
                  Skips: {skipsRemaining}
                </span>
              </div>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question */}
        <SimpleQuestionCard
          question={currentQuestion}
          selectedAnswer={answers[getCurrentQuestionIndex()] || ''}
          onAnswerSelect={handleAnswerSelect}
          showExplanation={showExplanation && mode === 'review'}
        />

        {/* Controls */}
        <div className="flex justify-between items-center pt-4">
          {mode === 'quiz' && skipsRemaining > 0 && !isRecallingSkipped && (
            <Button variant="outline" onClick={handleSkip}>
              Skip ({skipsRemaining})
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button 
            onClick={handleNext}
            disabled={!answers[getCurrentQuestionIndex()]}
            className={getModeColor()}
          >
            {currentIndex === questions.length - 1 && mode === 'quiz' ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}