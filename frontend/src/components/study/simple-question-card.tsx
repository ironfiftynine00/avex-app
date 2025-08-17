import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuestionImage } from "../exam/question-image";
import type { Question } from "@shared/schema";

interface SimpleQuestionCardProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  showExplanation?: boolean;
}

export default function SimpleQuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  showExplanation = false
}: SimpleQuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground leading-relaxed">
          {question.questionText}
        </h3>
        {question.imageUrl && (
          <QuestionImage imageUrl={question.imageUrl} />
        )}
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={onAnswerSelect}
          className="space-y-3"
        >
          {['A', 'B', 'C', 'D'].map((option) => (
            <div key={option} className="flex items-center space-x-3">
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
                {question[`option${option}` as keyof Question] as string}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {showExplanation && selectedAnswer && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="mb-2">
              <span className="text-sm font-medium">
                {selectedAnswer === question.correctAnswer ? (
                  <span className="text-green-600">✓ Correct!</span>
                ) : (
                  <span className="text-red-600">✗ Incorrect</span>
                )}
              </span>
            </div>
            {selectedAnswer !== question.correctAnswer && (
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Correct answer:</strong> {question.correctAnswer}
              </p>
            )}
            {question.explanation && (
              <p className="text-sm text-foreground">{question.explanation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}