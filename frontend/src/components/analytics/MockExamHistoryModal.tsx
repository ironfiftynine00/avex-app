import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, X, Calendar, Clock, Target, BarChart3, Eye } from "lucide-react";

interface MockExamHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examAttempts: any[];
}

export function MockExamHistoryModal({ open, onOpenChange, examAttempts }: MockExamHistoryModalProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (timeValue: number) => {
    // Handle both minutes (from timeTaken) and seconds (from timeSpent)
    // If timeValue is less than 100, assume it's minutes, otherwise seconds
    let totalMinutes, remainingSeconds;
    
    if (timeValue < 100) {
      // Likely minutes
      totalMinutes = timeValue;
      remainingSeconds = 0;
    } else {
      // Likely seconds
      totalMinutes = Math.floor(timeValue / 60);
      remainingSeconds = timeValue % 60;
    }
    
    if (remainingSeconds > 0) {
      return `${totalMinutes}m ${remainingSeconds}s`;
    } else {
      return `${totalMinutes}m`;
    }
  };

  if (selectedAttempt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-full max-h-[95vh] h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Exam Review: {selectedAttempt.categoryName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mb-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <Badge variant={selectedAttempt.passed ? "default" : "destructive"} className="text-sm">
                  {selectedAttempt.passed ? "PASSED" : "FAILED"}
                </Badge>
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.round(parseFloat(selectedAttempt.score))}%
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {formatDate(selectedAttempt.createdAt)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedAttempt(null)}
                className="bg-white dark:bg-gray-800"
              >
                Back to History
              </Button>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="p-4 text-center bg-green-50 dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedAttempt.correctAnswers}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="p-4 text-center bg-red-50 dark:bg-red-900/20">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {selectedAttempt.totalQuestions - selectedAttempt.correctAnswers}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">Incorrect</div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 text-center bg-blue-50 dark:bg-blue-900/20">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatDuration(selectedAttempt.timeTaken)}
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Duration</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                  {selectedAttempt.questionsData && selectedAttempt.questionsData.map((question: any, index: number) => {
                    // Check answers by both question ID and index for compatibility
                    const userAnswer = selectedAttempt.answers && (
                      selectedAttempt.answers[question.id] || 
                      selectedAttempt.answers[index] || 
                      selectedAttempt.answers[index.toString()]
                    );
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <Card key={question.id} className={`border-2 shadow-sm ${
                        isCorrect ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
                      }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-3 text-lg break-words whitespace-pre-wrap">{question.questionText}</h4>
                            
                            <div className="space-y-2 mb-4">
                              {[
                                { label: 'A', text: question.optionA },
                                { label: 'B', text: question.optionB },
                                { label: 'C', text: question.optionC },
                                { label: 'D', text: question.optionD }
                              ].map((option) => {
                                const isUserAnswer = userAnswer === option.label;
                                const isCorrectAnswer = question.correctAnswer === option.label;
                                
                                return (
                                  <div
                                    key={option.label}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      isCorrectAnswer
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                                        : isUserAnswer && !isCorrectAnswer
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-lg">{option.label}.</span>
                                      <span className="break-words whitespace-pre-wrap flex-1">{option.text}</span>
                                      {isCorrectAnswer && (
                                        <div className="flex items-center gap-2 ml-auto">
                                          <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                                            Correct Answer
                                          </span>
                                          <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <div className="flex items-center gap-2 ml-auto">
                                          <span className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                                            Your Answer
                                          </span>
                                          <X className="w-5 h-5 text-red-500" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {question.explanation && (
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Explanation:
                                </h5>
                                <p className="text-blue-800 dark:text-blue-200 leading-relaxed break-words whitespace-pre-wrap">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Mock Exam History
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4">
            {examAttempts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No exam attempts yet</p>
                <p className="text-gray-400 text-sm">Your mock exam history will appear here</p>
              </div>
            ) : (
              examAttempts.map((attempt) => (
                <Card 
                  key={attempt.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                  onClick={() => setSelectedAttempt(attempt)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{attempt.categoryName}</h3>
                          <Badge 
                            variant={attempt.passed ? "default" : "destructive"}
                            className="text-sm"
                          >
                            {attempt.passed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(attempt.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(attempt.timeTaken)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                          </div>
                        </div>
                        

                      </div>
                      
                      <div className="text-right ml-6">
                        <div className={`text-3xl font-bold ${
                          attempt.passed ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {Math.round(parseFloat(attempt.score))}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Final Score
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}