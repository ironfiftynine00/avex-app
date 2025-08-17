import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Flag, SkipForward, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionImage } from "./question-image";
import type { Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentScore: number;
  timeRemaining: string;
  skipsRemaining: number;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  onFlag: () => void;
  onNext: () => void;
  onPrevious?: () => void;
  selectedAnswer?: string;
  canGoBack?: boolean;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onSubmit?: () => void;
  isQuizMode?: boolean;
  showCorrectAnswer?: boolean;
  isPracticeMode?: boolean;
  showSkipButton?: boolean;
  quizModeTitle?: string;
  cumulativePercentage?: number;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  currentScore,
  timeRemaining,
  skipsRemaining,
  onAnswer,
  onSkip,
  onFlag,
  onNext,
  onPrevious,
  selectedAnswer,
  canGoBack = false,
  isBookmarked = false,
  onBookmark,
  onSubmit,
  isQuizMode = false,
  showCorrectAnswer = true,
  isPracticeMode = false,
  showSkipButton = true,
  quizModeTitle,
  cumulativePercentage
}: QuestionCardProps) {
  const [answer, setAnswer] = useState(selectedAnswer || "");

  // Sync local state with prop changes and clear when question changes
  useEffect(() => {
    setAnswer(selectedAnswer || "");
  }, [selectedAnswer, question.id]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    onAnswer(value);
  };

  const progress = (questionNumber / totalQuestions) * 100;
  
  // Use cumulative percentage for Quiz/Mock Exam modes, or calculate traditional percentage for others
  const scorePercentage = cumulativePercentage !== undefined 
    ? cumulativePercentage 
    : questionNumber > 1 ? (currentScore / (questionNumber - 1)) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        {!isPracticeMode && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{quizModeTitle || "Study Quiz"}</h3>
            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Progress and Timer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            {!isPracticeMode && <Progress value={progress} className="w-32" />}
          </div>
          
          {!isPracticeMode && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {cumulativePercentage !== undefined ? (
                  // Quiz/Mock Exam mode: Show cumulative percentage based on total questions
                  <>Score: {currentScore}/{totalQuestions} ({Math.round(scorePercentage)}%)</>
                ) : (
                  // Traditional mode: Show percentage based on answered questions
                  <>Score: {currentScore}/{questionNumber - 1} ({Math.round(scorePercentage)}%)</>
                )}
              </span>
              {timeRemaining && (
                <div className="flex items-center space-x-1 text-orange-500">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{timeRemaining}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="text-lg font-medium mb-4">
            {question?.questionText || "Loading question..."}
          </h4>
          
          {/* Question Image */}
          {question?.imageUrl && (
            <div className="mb-4">
              <QuestionImage 
                imageUrl={question.imageUrl} 
                alt="Question diagram"
                className="max-w-full"
              />
            </div>
          )}
          
          <RadioGroup value={answer} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {[
                { value: "A", text: question?.optionA || "" },
                { value: "B", text: question?.optionB || "" },
                { value: "C", text: question?.optionC || "" },
                { value: "D", text: question?.optionD || "" },
              ].filter(option => option.text).map((option) => (
                <Label
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isPracticeMode && answer ?
                      // Practice Mode: Show feedback only for selected answer
                      answer === option.value && answer === question.correctAnswer ?
                        'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      answer === option.value && answer !== question.correctAnswer ?
                        'border-red-500 bg-red-50 dark:bg-red-900/20' :
                        'border-border hover:bg-muted/50'
                      :
                    isQuizMode || !showCorrectAnswer ? 
                      // Quiz Mode: No feedback styling, just selection
                      answer === option.value ? 
                        'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
                        'border-border hover:bg-muted/50'
                      :
                      // Normal Mode: Show correct/incorrect feedback
                      answer === option.value && answer === question.correctAnswer ?
                        'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      answer === option.value && answer !== question.correctAnswer ?
                        'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      option.value === question.correctAnswer ?
                        'border-green-500 bg-green-50 dark:bg-green-900/20' :
                        'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-medium">{option.value}.</span>
                      <span className="ml-2">{option.text}</span>
                    </div>
                    {/* Show feedback based on mode */}
                    {isPracticeMode && answer && answer === option.value && (
                      <div>
                        {answer === question.correctAnswer ? (
                          <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">✗ Incorrect</span>
                        )}
                      </div>
                    )}
                    {!isQuizMode && !isPracticeMode && showCorrectAnswer && answer && (
                      <div>
                        {answer === option.value && answer === question.correctAnswer && (
                          <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                        )}
                        {answer === option.value && answer !== question.correctAnswer && (
                          <span className="text-red-600 text-sm font-medium">✗ Incorrect</span>
                        )}
                        {answer !== option.value && option.value === question.correctAnswer && (
                          <span className="text-green-600 text-sm font-medium">✓ Correct Answer</span>
                        )}
                      </div>
                    )}
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>

          {/* Practice Mode Explanation - Show only when correct answer is selected */}
          {isPracticeMode && answer && answer === question.correctAnswer && question.explanation && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Explanation</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          {isPracticeMode ? (
            /* Practice Mode: Only Previous and Next buttons */
            <>
              <div>
                {canGoBack && onPrevious && (
                  <Button variant="outline" onClick={onPrevious}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="text-center">
                <Badge variant="secondary">
                  Question {questionNumber} of {totalQuestions}
                </Badge>
              </div>

              <div>
                {questionNumber < totalQuestions && (
                  <Button onClick={onNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Regular Mode: All buttons */
            <>
              <div className="flex items-center space-x-3">
                {showSkipButton && skipsRemaining > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSkip}
                    disabled={skipsRemaining === 0}
                    className="text-orange-500 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip ({skipsRemaining} remaining)
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBookmark}
                  className={`${isBookmarked ? 'text-yellow-500 border-yellow-500' : 'text-avex-blue border-avex-blue'}`}
                >
                  <Bookmark className="w-4 h-4 mr-1" fill={isBookmarked ? "currentColor" : "none"} />
                  Flag
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                {canGoBack && onPrevious && (
                  <Button variant="ghost" onClick={onPrevious}>
                    Previous
                  </Button>
                )}
                <Button 
                  onClick={questionNumber === totalQuestions ? (onSubmit || onNext) : onNext}
                  disabled={!answer}
                  className="avex-button-primary"
                >
                  {questionNumber === totalQuestions ? "Submit Exam" : "Next"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
