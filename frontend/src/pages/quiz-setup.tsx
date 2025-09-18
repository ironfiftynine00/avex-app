import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StudyHeader from "@/components/study/study-header";
import TopNav from "@/components/navigation/top-nav";
import { 
  Clock,
  Target,
  Play,
  Settings
} from "lucide-react";
import type { Category, Subtopic } from "@shared/schema";

export default function QuizSetup() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/study/quiz/category/:categoryId/subtopic/:subtopicId");
  
  const categoryId = parseInt(params?.categoryId || '0');
  const subtopicId = parseInt(params?.subtopicId || '0');

  // Quiz configuration states
  const [numQuestions, setNumQuestions] = useState(15);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [oneMinutePerQuestion, setOneMinutePerQuestion] = useState(false);
  const [maxSkips, setMaxSkips] = useState(3);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);

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

  const { data: questions = [] } = useQuery({
    queryKey: ['/api/questions/subtopic', subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/questions/subtopic/${subtopicId}`);
      return response.json();
    },
    enabled: !!subtopicId
  });

  const handleBack = () => {
    setLocation(`/study/quiz/category/${categoryId}/subtopics`);
  };

  const handleStartQuiz = () => {
    // Store quiz configuration in sessionStorage
    const quizConfig = {
      numQuestions: Math.min(numQuestions, questions.length),
      timerMinutes: oneMinutePerQuestion ? Math.min(numQuestions, questions.length) : timerMinutes,
      maxSkips,
      randomizeQuestions,
      categoryId,
      subtopicId,
      categoryName: category?.name,
      subtopicName: subtopic?.name
    };
    
    sessionStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    setLocation(`/study/quiz/category/${categoryId}/subtopic/${subtopicId}/questions`);
  };

  const availableQuestions = questions.length;
  const actualQuestions = Math.min(numQuestions, availableQuestions);
  const calculatedTime = oneMinutePerQuestion ? actualQuestions : timerMinutes;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <StudyHeader 
        title="Quiz Setup" 
        onBack={handleBack}
      />
      
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-orange-500 text-white">
            Quiz Mode
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">
            {subtopic?.name || 'Quiz Setup'}
          </h1>
          <p className="text-muted-foreground">{category?.name}</p>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-foreground">
              <strong>{availableQuestions}</strong> questions available for this subtopic
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quiz Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="numQuestions" className="text-sm font-medium">
                Number of Questions
              </Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max={availableQuestions}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.min(parseInt(e.target.value) || 1, availableQuestions))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  (max: {availableQuestions})
                </span>
              </div>
            </div>

            {/* Timer Configuration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timer Configuration
              </Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="oneMinutePerQuestion"
                  checked={oneMinutePerQuestion}
                  onCheckedChange={(checked) => setOneMinutePerQuestion(checked as boolean)}
                />
                <Label htmlFor="oneMinutePerQuestion" className="text-sm">
                  1 minute per question ({actualQuestions} minutes total)
                </Label>
              </div>

              {!oneMinutePerQuestion && (
                <div className="space-y-2">
                  <Label htmlFor="timerMinutes" className="text-sm">Custom Timer (minutes)</Label>
                  <Select value={timerMinutes.toString()} onValueChange={(value) => setTimerMinutes(parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Skip Configuration */}
            <div className="space-y-2">
              <Label htmlFor="maxSkips" className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Maximum Skips Allowed
              </Label>
              <Select value={maxSkips.toString()} onValueChange={(value) => setMaxSkips(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No skips allowed</SelectItem>
                  <SelectItem value="1">1 skip</SelectItem>
                  <SelectItem value="2">2 skips</SelectItem>
                  <SelectItem value="3">3 skips</SelectItem>
                  <SelectItem value="5">5 skips</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Additional Options</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="randomizeQuestions"
                  checked={randomizeQuestions}
                  onCheckedChange={(checked) => setRandomizeQuestions(checked as boolean)}
                />
                <Label htmlFor="randomizeQuestions" className="text-sm">
                  Randomize question order
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Summary */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-300">Quiz Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions:</span> {actualQuestions}
              </div>
              <div>
                <span className="font-medium">Time Limit:</span> {calculatedTime} minutes
              </div>
              <div>
                <span className="font-medium">Skips Allowed:</span> {maxSkips}
              </div>
              <div>
                <span className="font-medium">Randomized:</span> {randomizeQuestions ? 'Yes' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center pt-4">
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            onClick={handleStartQuiz}
            disabled={availableQuestions === 0}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Quiz
          </Button>
          
          {availableQuestions === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No questions available for this subtopic
            </p>
          )}
        </div>
      </div>
    </div>
  );
}