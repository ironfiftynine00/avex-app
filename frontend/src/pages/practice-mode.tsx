import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import StudyHeader from "@/components/study/study-header";
import TopNav from "@/components/navigation/top-nav";
import { QuestionImage } from "@/components/exam/question-image";
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronRight
} from "lucide-react";
import type { Question, Category, Subtopic } from "@shared/schema";
import { usePracticeTracking } from "@/hooks/useStudyTracking";
import { useDailyProgress } from "@/hooks/useDailyProgress";
import { useProgressDialog } from "@/contexts/ProgressDialogContext";

export default function PracticeMode() {
  const [, setLocation] = useLocation();
  const { openProgressDialog } = useProgressDialog();
  const { incrementQuestions, finishTracking, questionsAnswered } = usePracticeTracking(openProgressDialog);
  const { updatePracticeProgress } = useDailyProgress();
  const [match, params] = useRoute("/study/practice/category/:categoryId/subtopic/:subtopicId");
  
  const categoryId = parseInt(params?.categoryId || '0');
  const subtopicId = parseInt(params?.subtopicId || '0');

  // Practice states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

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
      return response.json();
    },
    enabled: !!subtopicId
  });

  // Reset states when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setShowFeedback(false);
  }, [currentIndex]);

  const handleBack = () => {
    // Trigger tracking when leaving if enough questions answered
    finishTracking();
    
    // Update daily progress if enough questions answered (≥5 for practice requirement)
    if (questionsAnswered >= 5) {
      updatePracticeProgress.mutate();
    }
    
    setLocation(`/study/practice/category/${categoryId}/subtopics`);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return; // Prevent changing answer after feedback is shown
    setSelectedAnswer(answer);
    
    // Track answered question for practice streak and overall progress
    if (!answeredQuestions.has(currentIndex)) {
      const currentQuestion = questions[currentIndex];
      const isCorrect = answer === currentQuestion?.correctAnswer;
      incrementQuestions(currentQuestion?.id, isCorrect);
      setAnsweredQuestions(prev => new Set(Array.from(prev).concat(currentIndex)));
    }
    
    // Immediately show feedback when answer is selected
    setShowFeedback(true);
    setAnsweredQuestions(prev => new Set(Array.from(prev).concat(currentIndex)));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All questions completed - trigger practice tracking
      finishTracking();
      
      // Update daily progress if enough questions answered (≥5 for practice requirement)
      if (questionsAnswered >= 5) {
        updatePracticeProgress.mutate();
      }
      
      setLocation('/study');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader title="Practice Mode" onBack={handleBack} />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader title="Practice Mode" onBack={handleBack} />
        
        <div className="p-4 text-center py-12">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Questions Available</h3>
          <p className="text-muted-foreground">
            This subtopic doesn't have any practice questions yet.
          </p>
          <Button variant="outline" onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Choose Different Subtopic
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <StudyHeader 
        title={`Practice - ${subtopic?.name}`} 
        onBack={handleBack}
      />
      
      <div className="p-4 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Badge className="bg-green-500 text-white">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {category?.name}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground leading-relaxed">
              {currentQuestion.questionText}
            </h3>
            {currentQuestion.imageUrl && (
              <QuestionImage imageUrl={currentQuestion.imageUrl} />
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
              disabled={showFeedback}
            >
              {['A', 'B', 'C', 'D'].map((option) => {
                let optionClass = "";
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    optionClass = "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
                  } else if (option === selectedAnswer && !isCorrect) {
                    optionClass = "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
                  }
                }

                return (
                  <div key={option} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${optionClass}`}>
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${option}`}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={`option-${option}`}
                      className="flex-1 cursor-pointer text-base leading-relaxed"
                    >
                      <span className="font-medium text-primary mr-2">{option}.</span>
                      {currentQuestion[`option${option}` as keyof Question] as string}
                    </Label>
                    {showFeedback && option === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {showFeedback && option === selectedAnswer && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>
            
            {showFeedback && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="mb-3">
                  <span className={`text-sm font-medium flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
                  </p>
                )}
                {currentQuestion.explanation && (
                  <div className="border-t border-border pt-3 mt-3">
                    <h4 className="text-sm font-medium text-foreground mb-2">Explanation:</h4>
                    <p className="text-sm text-foreground leading-relaxed">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-between items-center pt-4">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {showFeedback && (
              <Button 
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600"
              >
                {currentIndex === questions.length - 1 ? 'Return to Menu' : 'Next'}
                {currentIndex < questions.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}