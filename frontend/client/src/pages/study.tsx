// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import TopNav from "@/components/navigation/top-nav";
import QuestionCard from "@/components/exam/question-card";
import { 
  Book, 
  Image, 
  Play, 
  Target,
  Clock,
  ArrowLeft,
  BookOpen,
  FolderOpen,
  Filter,
  Plus,
  X
} from "lucide-react";
import type { Question, Infographic, Category, Subtopic } from "@shared/schema";

export default function Study() {
  const [activeTab, setActiveTab] = useState("review");

  // Quiz Mode states
  const [quizMode, setQuizMode] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [quizSelectedCategories, setQuizSelectedCategories] = useState<number[]>([]);
  const [quizSelectedSubtopics, setQuizSelectedSubtopics] = useState<number[]>([]);
  
  // Quiz Configuration
  const [quizNumQuestions, setQuizNumQuestions] = useState(15);
  const [quizTimerMinutes, setQuizTimerMinutes] = useState(30);
  const [quizOneMinutePerQuestion, setQuizOneMinutePerQuestion] = useState(false);
  const [quizMaxSkips, setQuizMaxSkips] = useState(3);

  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSkippedQuestions, setQuizSkippedQuestions] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPercentage, setQuizPercentage] = useState(0);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(1800);
  const [quizSkipsRemaining, setQuizSkipsRemaining] = useState(3);
  const [quizIsRecallingSkipped, setQuizIsRecallingSkipped] = useState(false);
  const [quizSkippedRecallIndex, setQuizSkippedRecallIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    missedQuestions: Array<{
      question: Question;
      userAnswer: string;
      correctAnswer: string;
    }>;
  } | null>(null);

  // Practice Mode states
  const [practiceMode, setPracticeMode] = useState<'setup' | 'practice'>('setup');
  const [practiceSelectedCategories, setPracticeSelectedCategories] = useState<number[]>([]);
  const [practiceSelectedSubtopics, setPracticeSelectedSubtopics] = useState<number[]>([]);

  const [practiceCurrentIndex, setPracticeCurrentIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});

  // Review Mode states
  const [reviewSelectedCategories, setReviewSelectedCategories] = useState<number[]>([]);
  const [reviewSelectedSubtopics, setReviewSelectedSubtopics] = useState<number[]>([]);



  // Data queries
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Get subtopics for selected categories in each mode
  const { data: reviewSubtopics = [] } = useQuery({
    queryKey: ['/api/categories/subtopics', reviewSelectedCategories],
    queryFn: async () => {
      if (reviewSelectedCategories.length === 0) return [];
      const allSubtopics = [];
      for (const categoryId of reviewSelectedCategories) {
        const response = await fetch(`/api/categories/${categoryId}/subtopics`);
        const subtopics = await response.json();
        allSubtopics.push(...subtopics);
      }
      return allSubtopics;
    },
    enabled: reviewSelectedCategories.length > 0
  });

  const { data: practiceSubtopics = [] } = useQuery({
    queryKey: ['/api/categories/subtopics', practiceSelectedCategories],
    queryFn: async () => {
      if (practiceSelectedCategories.length === 0) return [];
      const allSubtopics = [];
      for (const categoryId of practiceSelectedCategories) {
        const response = await fetch(`/api/categories/${categoryId}/subtopics`);
        const subtopics = await response.json();
        allSubtopics.push(...subtopics);
      }
      return allSubtopics;
    },
    enabled: practiceSelectedCategories.length > 0
  });

  const { data: quizSubtopics = [] } = useQuery({
    queryKey: ['/api/categories/subtopics', quizSelectedCategories],
    queryFn: async () => {
      if (quizSelectedCategories.length === 0) return [];
      const allSubtopics = [];
      for (const categoryId of quizSelectedCategories) {
        const response = await fetch(`/api/categories/${categoryId}/subtopics`);
        const subtopics = await response.json();
        allSubtopics.push(...subtopics);
      }
      return allSubtopics;
    },
    enabled: quizSelectedCategories.length > 0
  });

  const { data: infographics = [] } = useQuery({
    queryKey: ['/api/infographics/category', reviewSelectedCategories[0]],
    enabled: reviewSelectedCategories.length > 0 && reviewSelectedCategories[0] !== undefined
  });

  // Practice Mode queries
  const { data: practiceQuestions = [] } = useQuery({
    queryKey: ['/api/questions/subtopics', practiceSelectedSubtopics],
    queryFn: async () => {
      if (practiceSelectedSubtopics.length === 0) return [];
      const allQuestions = [];
      for (const subtopicId of practiceSelectedSubtopics) {
        const response = await fetch(`/api/questions/subtopic/${subtopicId}`);
        const questions = await response.json();
        allQuestions.push(...questions);
      }
      return allQuestions;
    },
    enabled: practiceSelectedSubtopics.length > 0
  });

  // Quiz Mode queries - with randomization across multiple subtopics
  const { data: quizQuestions = [] } = useQuery({
    queryKey: ['/api/questions/quiz', quizSelectedSubtopics],
    queryFn: async () => {
      if (quizSelectedSubtopics.length === 0) return [];
      const allQuestions = [];
      for (const subtopicId of quizSelectedSubtopics) {
        const response = await fetch(`/api/questions/subtopic/${subtopicId}`);
        const questions = await response.json();
        allQuestions.push(...questions);
      }
      
      // Shuffle all questions for randomization across subtopics
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      return shuffled;
    },
    enabled: quizSelectedSubtopics.length > 0
  });

  // Timer effect for Quiz Mode
  useEffect(() => {
    if (quizMode === 'quiz' && quizTimeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit quiz
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizMode, quizTimeRemaining]);

  // Confetti effect for passing quiz
  useEffect(() => {
    if (quizMode === 'results' && quizResults?.passed) {
      // Simple confetti animation using CSS
      const confettiElements = document.querySelectorAll('.confetti');
      confettiElements.forEach(el => {
        el.classList.add('animate-bounce');
      });
    }
  }, [quizMode, quizResults]);

  // Quiz Mode Functions
  const handleQuizCategoryToggle = (categoryId: number, checked: boolean) => {
    if (checked) {
      setQuizSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setQuizSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleQuizSubtopicToggle = (subtopicId: number, checked: boolean) => {
    if (checked) {
      setQuizSelectedSubtopics(prev => [...prev, subtopicId]);
    } else {
      setQuizSelectedSubtopics(prev => prev.filter(id => id !== subtopicId));
    }
  };

  const handleQuizSelectAllSubtopics = () => {
    const allSubtopicIds = quizSubtopics?.map(s => s.id) || [];
    setQuizSelectedSubtopics(allSubtopicIds);
  };

  const handleQuizClearAllSubtopics = () => {
    setQuizSelectedSubtopics([]);
  };

  const startQuiz = () => {
    if (quizQuestions.length === 0) return;
    
    // Use actual available questions count (may be less than requested)
    const actualQuestionCount = Math.min(quizNumQuestions, quizQuestions.length);
    
    // Calculate timer based on actual question count
    let timeInSeconds = quizTimerMinutes * 60;
    if (quizOneMinutePerQuestion) {
      timeInSeconds = actualQuestionCount * 60;
    }
    
    setQuizTimeRemaining(timeInSeconds);
    setQuizSkipsRemaining(quizMaxSkips);
    setQuizCurrentIndex(0);
    setQuizAnswers({});
    setQuizSkippedQuestions([]);
    setQuizScore(0);
    setQuizPercentage(0);
    setQuizIsRecallingSkipped(false);
    setQuizSkippedRecallIndex(0);
    
    // Update quiz configuration to actual question count
    setQuizNumQuestions(actualQuestionCount);
    
    setQuizMode('quiz');
  };

  const handleQuizSkip = () => {
    if (quizSkipsRemaining > 0 && !quizIsRecallingSkipped) {
      setQuizSkippedQuestions(prev => [...prev, quizCurrentIndex]);
      setQuizSkipsRemaining(prev => prev - 1);
      
      // Move to next question
      handleQuizNext();
    }
  };

  const handleQuizNext = () => {
    // Update score when Next is tapped (Mock Exam style) 
    const currentAnswer = quizAnswers[getCurrentQuestionIndex()];
    const currentQuestion = quizQuestions[getCurrentQuestionIndex()];
    
    if (currentAnswer && currentQuestion && currentAnswer === currentQuestion.correctAnswer) {
      setQuizScore(prev => {
        const newScore = prev + 1;
        // Calculate cumulative percentage based on total selected questions
        const cumulativePercentage = Math.round((newScore / quizNumQuestions) * 100);
        setQuizPercentage(cumulativePercentage);
        return newScore;
      });
    }
    
    // Check if we're in skip recall mode
    if (quizIsRecallingSkipped) {
      if (quizSkippedRecallIndex < quizSkippedQuestions.length - 1) {
        setQuizSkippedRecallIndex(prev => prev + 1);
        setQuizCurrentIndex(quizSkippedQuestions[quizSkippedRecallIndex + 1]);
      } else {
        // All skipped questions answered, submit quiz
        submitQuiz();
      }
    } else {
      // Normal quiz flow
      if (quizCurrentIndex < quizNumQuestions - 1) {
        setQuizCurrentIndex(prev => prev + 1);
      } else {
        // Check if we have skipped questions to recall
        if (quizSkippedQuestions.length > 0) {
          setQuizIsRecallingSkipped(true);
          setQuizSkippedRecallIndex(0);
          setQuizCurrentIndex(quizSkippedQuestions[0]);
        } else {
          submitQuiz();
        }
      }
    }
  };

  const submitQuiz = () => {
    const actualQuestions = quizQuestions.slice(0, quizNumQuestions);
    let correctAnswers = 0;
    const missedQuestions = [];

    for (let i = 0; i < actualQuestions.length; i++) {
      const question = actualQuestions[i];
      const userAnswer = quizAnswers[i] || '';
      
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      } else if (userAnswer || !quizSkippedQuestions.includes(i)) {
        // Only add to missed if answered (incorrectly) or not skipped
        missedQuestions.push({
          question,
          userAnswer,
          correctAnswer: question.correctAnswer
        });
      }
    }

    const percentage = Math.round((correctAnswers / actualQuestions.length) * 100);
    const passed = percentage >= 70;

    setQuizResults({
      score: correctAnswers,
      totalQuestions: actualQuestions.length,
      percentage,
      passed,
      missedQuestions
    });

    setQuizMode('results');
  };

  const canSubmitQuiz = () => {
    // Can only submit if all non-skipped questions are answered AND we're not in recall mode
    if (quizIsRecallingSkipped) {
      return false; // Must answer all recalled questions
    }
    
    const answeredQuestions = Object.keys(quizAnswers).length;
    const totalNonSkippedQuestions = quizNumQuestions - quizSkippedQuestions.length;
    return answeredQuestions >= totalNonSkippedQuestions;
  };

  const getCurrentQuestionIndex = () => {
    if (quizIsRecallingSkipped) {
      return quizSkippedQuestions[quizSkippedRecallIndex];
    }
    return quizCurrentIndex;
  };

  const getCurrentQuestionNumber = () => {
    if (quizIsRecallingSkipped) {
      return `Skipped ${quizSkippedRecallIndex + 1} of ${quizSkippedQuestions.length}`;
    }
    return `${quizCurrentIndex + 1} of ${quizNumQuestions}`;
  };

  // Practice Mode Functions
  const handlePracticeCategoryToggle = (categoryId: number, checked: boolean) => {
    if (checked) {
      setPracticeSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setPracticeSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handlePracticeSubtopicToggle = (subtopicId: number, checked: boolean) => {
    if (checked) {
      setPracticeSelectedSubtopics(prev => [...prev, subtopicId]);
    } else {
      setPracticeSelectedSubtopics(prev => prev.filter(id => id !== subtopicId));
    }
  };

  const handlePracticeSelectAllSubtopics = () => {
    const allSubtopicIds = practiceSubtopics?.map(s => s.id) || [];
    setPracticeSelectedSubtopics(allSubtopicIds);
  };

  const handlePracticeClearAllSubtopics = () => {
    setPracticeSelectedSubtopics([]);
  };

  // Review Mode Functions
  const handleReviewCategoryToggle = (categoryId: number, checked: boolean) => {
    if (checked) {
      setReviewSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setReviewSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleReviewSubtopicToggle = (subtopicId: number, checked: boolean) => {
    if (checked) {
      setReviewSelectedSubtopics(prev => [...prev, subtopicId]);
    } else {
      setReviewSelectedSubtopics(prev => prev.filter(id => id !== subtopicId));
    }
  };

  const handleReviewSelectAllSubtopics = () => {
    const allSubtopicIds = reviewSubtopics?.map(s => s.id) || [];
    setReviewSelectedSubtopics(allSubtopicIds);
  };

  const handleReviewClearAllSubtopics = () => {
    setReviewSelectedSubtopics([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Study Mode</h1>
          <p className="text-muted-foreground">
            Master your AMT certification with interactive learning materials
          </p>
        </div>

        {/* Study Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Review</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center space-x-2">
              <Book className="w-4 h-4" />
              <span>Practice</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Review Tab - Independent Interface */}
          <TabsContent value="review" className="mt-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Review Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Review Materials</h2>
                <p className="text-muted-foreground">Visual learning resources and infographics</p>
              </div>

              {/* Enhanced Category and Subtopic Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">Filter Content</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Choose categories and subtopics to explore</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Categories
                    </label>
                    <Select value="" onValueChange={(value) => {
                      const categoryId = parseInt(value);
                      const isSelected = reviewSelectedCategories.includes(categoryId);
                      handleReviewCategoryToggle(categoryId, !isSelected);
                    }}>
                      <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 transition-colors">
                        <SelectValue placeholder={
                          reviewSelectedCategories.length > 0 
                            ? `${reviewSelectedCategories.length} Categories Selected`
                            : "+ Add Category"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id.toString()}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <FolderOpen className="w-4 h-4" />
                              {category.name}
                              {reviewSelectedCategories.includes(category.id) && (
                                <Badge variant="secondary" className="ml-auto">Selected</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subtopic Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Subtopics
                      {reviewSubtopics && reviewSubtopics.length > 0 && (
                        <span className="text-xs text-muted-foreground">({reviewSubtopics.length} available)</span>
                      )}
                    </label>
                    
                    {reviewSelectedCategories.length > 0 ? (
                      <div className="space-y-2">
                        <Select value="" onValueChange={(value) => {
                          const subtopicId = parseInt(value);
                          const isSelected = reviewSelectedSubtopics.includes(subtopicId);
                          handleReviewSubtopicToggle(subtopicId, !isSelected);
                        }}>
                          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-400 transition-colors">
                            <SelectValue placeholder={
                              reviewSelectedSubtopics.length > 0 
                                ? `${reviewSelectedSubtopics.length} Subtopics Selected`
                                : "+ Add Subtopic"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {reviewSubtopics?.map((subtopic) => (
                              <SelectItem 
                                key={subtopic.id} 
                                value={subtopic.id.toString()}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <BookOpen className="w-4 h-4" />
                                  {subtopic.name}
                                  {reviewSelectedSubtopics.includes(subtopic.id) && (
                                    <Badge variant="secondary" className="ml-auto">Selected</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {reviewSubtopics && reviewSubtopics.length > 0 && (
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleReviewSelectAllSubtopics}
                              className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Select All ({reviewSubtopics.length})
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleReviewClearAllSubtopics}
                              className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear All
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-sm text-muted-foreground">
                        Select a category first
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* Content Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(!reviewSelectedCategories.length && !reviewSelectedSubtopics.length) && (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Image className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Select Topics to Review</h3>
                      <p className="text-muted-foreground text-center">
                        Choose categories and subtopics above to view infographics and learning materials.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {(reviewSelectedCategories.length > 0 || reviewSelectedSubtopics.length > 0) && infographics?.length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Image className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Content Available</h3>
                      <p className="text-muted-foreground text-center">
                        No infographics are available for the selected topics yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {infographics?.map((infographic: any) => (
                  <Card key={infographic.id} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">{infographic.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {infographic.imageUrl ? (
                        <div className="mb-4">
                          <img 
                            src={infographic.imageUrl} 
                            alt={infographic.title}
                            className="w-full h-48 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
                            <Image className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Image failed to load</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center mb-4">
                          <Image className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                          <p className="text-muted-foreground">No image available</p>
                        </div>
                      )}
                      {infographic.description && (
                        <p className="text-sm text-muted-foreground">
                          {infographic.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Practice Tab - Independent Interface */}
          <TabsContent value="practice" className="mt-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {practiceMode === 'setup' && (
                <div className="space-y-6">
                  {/* Practice Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-700 mb-2">Practice Questions</h2>
                    <p className="text-muted-foreground">Study at your own pace with immediate feedback</p>
                  </div>

                  {/* Enhanced Category and Subtopic Selection */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-6 space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">Select Practice Topics</h3>
                      <p className="text-sm text-green-600 dark:text-green-300">Choose categories and subtopics for practice questions</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Categories
                        </label>
                        <Select value="" onValueChange={(value) => {
                          const categoryId = parseInt(value);
                          const isSelected = practiceSelectedCategories.includes(categoryId);
                          handlePracticeCategoryToggle(categoryId, !isSelected);
                        }}>
                          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 focus:border-green-400 transition-colors">
                            <SelectValue placeholder={
                              practiceSelectedCategories.length > 0 
                                ? `${practiceSelectedCategories.length} Categories Selected`
                                : "+ Add Category"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <FolderOpen className="w-4 h-4" />
                                  {category.name}
                                  {practiceSelectedCategories.includes(category.id) && (
                                    <Badge variant="secondary" className="ml-auto">Selected</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subtopic Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Subtopics
                          {practiceSubtopics && practiceSubtopics.length > 0 && (
                            <span className="text-xs text-muted-foreground">({practiceSubtopics.length} available)</span>
                          )}
                        </label>
                        
                        {practiceSelectedCategories.length > 0 ? (
                          <div className="space-y-2">
                            <Select value="" onValueChange={(value) => {
                              const subtopicId = parseInt(value);
                              const isSelected = practiceSelectedSubtopics.includes(subtopicId);
                              handlePracticeSubtopicToggle(subtopicId, !isSelected);
                            }}>
                              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 focus:border-green-400 transition-colors">
                                <SelectValue placeholder={
                                  practiceSelectedSubtopics.length > 0 
                                    ? `${practiceSelectedSubtopics.length} Subtopics Selected`
                                    : "+ Add Subtopic"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {practiceSubtopics?.map((subtopic) => (
                                  <SelectItem 
                                    key={subtopic.id} 
                                    value={subtopic.id.toString()}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <BookOpen className="w-4 h-4" />
                                      {subtopic.name}
                                      {practiceSelectedSubtopics.includes(subtopic.id) && (
                                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {practiceSubtopics && practiceSubtopics.length > 0 && (
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handlePracticeSelectAllSubtopics}
                                  className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Select All ({practiceSubtopics.length})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handlePracticeClearAllSubtopics}
                                  className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Clear All
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-sm text-muted-foreground">
                            Select a category first
                          </div>
                        )}
                      </div>
                    </div>
                  </div>



                  {/* Start Practice Button */}
                  {practiceSelectedSubtopics.length > 0 && (
                    <div className="flex justify-center">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                        onClick={() => setPracticeMode('practice')}
                      >
                        Start Practice Session
                      </Button>
                    </div>
                  )}

                  {/* Empty State */}
                  {practiceSelectedCategories.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Book className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Select Topics to Practice</h3>
                        <p className="text-muted-foreground text-center">
                          Choose categories and subtopics above to start practicing questions.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Practice Session - No Timer, No Skip Button */}
              {practiceMode === 'practice' && practiceQuestions.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-700 mb-2">Practice Questions</h2>
                    <p className="text-muted-foreground">Study at your own pace with immediate feedback</p>
                  </div>

                  <QuestionCard
                    question={practiceQuestions[practiceCurrentIndex]}
                    questionNumber={practiceCurrentIndex + 1}
                    totalQuestions={practiceQuestions.length}
                    currentScore={0}
                    timeRemaining=""
                    skipsRemaining={0}
                    onAnswer={(answer) => setPracticeAnswers(prev => ({ ...prev, [practiceCurrentIndex]: answer }))}
                    onSkip={() => {}}
                    onFlag={() => {}}
                    onNext={() => setPracticeCurrentIndex(prev => Math.min(prev + 1, practiceQuestions.length - 1))}
                    onPrevious={practiceCurrentIndex > 0 ? () => setPracticeCurrentIndex(prev => Math.max(prev - 1, 0)) : undefined}
                    selectedAnswer={practiceAnswers[practiceCurrentIndex] || ""}
                    canGoBack={practiceCurrentIndex > 0}
                    isQuizMode={false}
                    showCorrectAnswer={false}
                    isPracticeMode={true}
                  />

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setPracticeMode('setup')}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Selection</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Quiz Tab - Independent Interface */}
          <TabsContent value="quiz" className="mt-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {quizMode === 'setup' && (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">Quiz Mode</h2>
                    <p className="text-muted-foreground">Configure your timed quiz with personalized results</p>
                  </div>

                  {/* Enhanced Category and Subtopic Selection */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg p-6 space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Select Quiz Topics</h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">Choose categories and subtopics for quiz questions</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Categories
                        </label>
                        <Select value="" onValueChange={(value) => {
                          const categoryId = parseInt(value);
                          const isSelected = quizSelectedCategories.includes(categoryId);
                          handleQuizCategoryToggle(categoryId, !isSelected);
                        }}>
                          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 transition-colors">
                            <SelectValue placeholder={
                              quizSelectedCategories.length > 0 
                                ? `${quizSelectedCategories.length} Categories Selected`
                                : "+ Add Category"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <FolderOpen className="w-4 h-4" />
                                  {category.name}
                                  {quizSelectedCategories.includes(category.id) && (
                                    <Badge variant="secondary" className="ml-auto">Selected</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subtopic Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Subtopics
                          {quizSubtopics && quizSubtopics.length > 0 && (
                            <span className="text-xs text-muted-foreground">({quizSubtopics.length} available)</span>
                          )}
                        </label>

                        
                        {quizSelectedCategories.length > 0 ? (
                          <div className="space-y-2">
                            <Select value="" onValueChange={(value) => {
                              const subtopicId = parseInt(value);
                              const isSelected = quizSelectedSubtopics.includes(subtopicId);
                              handleQuizSubtopicToggle(subtopicId, !isSelected);
                            }}>
                              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-400 transition-colors">
                                <SelectValue placeholder={
                                  quizSelectedSubtopics.length > 0 
                                    ? `${quizSelectedSubtopics.length} Subtopics Selected`
                                    : "+ Add Subtopic"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {quizSubtopics?.map((subtopic) => (
                                  <SelectItem 
                                    key={subtopic.id} 
                                    value={subtopic.id.toString()}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <BookOpen className="w-4 h-4" />
                                      {subtopic.name}
                                      {quizSelectedSubtopics.includes(subtopic.id) && (
                                        <Badge variant="secondary" className="ml-auto">Selected</Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {quizSubtopics && quizSubtopics.length > 0 && (
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleQuizSelectAllSubtopics}
                                  className="text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Select All ({quizSubtopics.length})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleQuizClearAllSubtopics}
                                  className="text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Clear All
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-sm text-muted-foreground">
                            Select a category first
                          </div>
                        )}
                      </div>
                    </div>
                  </div>



                  {/* Quiz Configuration */}
                  {quizSelectedSubtopics.length > 0 && (
                    <Card className="border-indigo-200">
                      <CardHeader>
                        <CardTitle className="text-indigo-700">Quiz Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Number of Questions */}
                        <div className="space-y-2">
                          <Label>Number of Questions</Label>
                          <Select value={quizNumQuestions.toString()} onValueChange={(value) => setQuizNumQuestions(parseInt(value))}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 Questions</SelectItem>
                              <SelectItem value="30">30 Questions</SelectItem>
                              <SelectItem value="50">50 Questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Timer Options */}
                        <div className="space-y-2">
                          <Label>Timer</Label>
                          <Select 
                            value={quizTimerMinutes.toString()} 
                            onValueChange={(value) => setQuizTimerMinutes(parseInt(value))}
                            disabled={quizOneMinutePerQuestion}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 Minutes</SelectItem>
                              <SelectItem value="30">30 Minutes</SelectItem>
                              <SelectItem value="60">60 Minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="oneMinutePerQuestion"
                              checked={quizOneMinutePerQuestion}
                              onChange={(e) => setQuizOneMinutePerQuestion(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="oneMinutePerQuestion" className="text-sm">
                              1 minute per question ({quizNumQuestions} minutes total)
                            </Label>
                          </div>
                        </div>

                        {/* Max Skips */}
                        <div className="space-y-2">
                          <Label>Maximum Skips</Label>
                          <Select value={quizMaxSkips.toString()} onValueChange={(value) => setQuizMaxSkips(parseInt(value))}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No Skips</SelectItem>
                              <SelectItem value="1">1 Skip</SelectItem>
                              <SelectItem value="3">3 Skips</SelectItem>
                              <SelectItem value="5">5 Skips</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Skipped questions will be shown at the end before submission
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
                            onClick={startQuiz}
                            disabled={quizQuestions.length === 0}
                          >
                            Start Quiz ({Math.min(quizNumQuestions, quizQuestions.length)} Questions Available)
                          </Button>
                        </div>
                        
                        {/* Available Questions Info */}
                        {quizQuestions.length > 0 && (
                          <div className="text-center text-sm text-muted-foreground">
                            {quizQuestions.length} total questions available from selected topics
                            {quizQuestions.length < quizNumQuestions && (
                              <div className="text-orange-600 mt-1">
                                ⚠️ Only {quizQuestions.length} questions available (requested {quizNumQuestions})
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Empty State */}
                  {quizSelectedCategories.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Target className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Select Topics for Quiz</h3>
                        <p className="text-muted-foreground text-center">
                          Choose categories and subtopics above to start a timed quiz.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Quiz Session - With Timer, Skip Button, Score Tracking */}
              {quizMode === 'quiz' && quizQuestions.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">
                      {quizIsRecallingSkipped ? 'Reviewing Skipped Questions' : 'Quiz in Progress'}
                    </h2>
                    <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                      <span>⏱️ {Math.floor(quizTimeRemaining / 60)}:{(quizTimeRemaining % 60).toString().padStart(2, '0')}</span>
                      {!quizIsRecallingSkipped && <span>🔄 {quizSkipsRemaining} skips left</span>}
                      <span>📝 {Object.keys(quizAnswers).length}/{quizNumQuestions} answered</span>
                    </div>
                  </div>

                  <QuestionCard
                    question={quizQuestions[getCurrentQuestionIndex()]}
                    questionNumber={quizIsRecallingSkipped ? quizSkippedRecallIndex + 1 : quizCurrentIndex + 1}
                    totalQuestions={quizIsRecallingSkipped ? quizSkippedQuestions.length : quizNumQuestions}
                    currentScore={quizScore}
                    timeRemaining={`${Math.floor(quizTimeRemaining / 60)}:${(quizTimeRemaining % 60).toString().padStart(2, '0')}`}
                    skipsRemaining={quizSkipsRemaining}
                    onAnswer={(answer) => {
                      setQuizAnswers(prev => ({ ...prev, [getCurrentQuestionIndex()]: answer }));
                    }}
                    onSkip={handleQuizSkip}
                    onFlag={() => {}}
                    onNext={handleQuizNext}
                    onPrevious={undefined} // Remove Previous button entirely
                    selectedAnswer={quizAnswers[getCurrentQuestionIndex()] || ""}
                    canGoBack={false} // No going back in quiz mode
                    isQuizMode={true}
                    showCorrectAnswer={false}
                    isPracticeMode={false}
                    showSkipButton={quizSkipsRemaining > 0 && !quizIsRecallingSkipped}
                    quizModeTitle="Quiz Mode"
                    cumulativePercentage={quizPercentage}
                  />

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setQuizMode('setup')}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Setup</span>
                    </Button>
                    
                    {canSubmitQuiz() && (
                      <Button
                        onClick={submitQuiz}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Results Display */}
              {quizMode === 'results' && quizResults && (
                <div className="space-y-6">
                  {/* Percentage Highlight */}
                  <div className="text-center py-8 relative">
                    {quizResults.passed && (
                      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <div className="confetti text-4xl animate-bounce">🎊</div>
                        <div className="confetti text-3xl animate-bounce delay-100 ml-8">🎉</div>
                        <div className="confetti text-2xl animate-bounce delay-200 mr-8">✨</div>
                      </div>
                    )}
                    <div className={`text-6xl font-bold mb-4 ${quizResults.passed ? 'text-green-600' : 'text-red-600'} animate-pulse`}>
                      {quizResults.passed ? '🟢' : '🔴'} {quizResults.percentage}%
                    </div>
                    
                    {/* Personalized Result Message */}
                    <div className="space-y-2">
                      {quizResults.passed ? (
                        <div>
                          <h2 className="text-2xl font-bold text-green-700">
                            🎉 Congratulations, {user?.firstName || 'Student'}!
                          </h2>
                          <p className="text-lg text-green-600">
                            🏆 You scored {quizResults.percentage}% ({quizResults.score}/{quizResults.totalQuestions})
                          </p>
                          <p className="text-muted-foreground italic">
                            "You're one step closer to becoming certified!"
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-2xl font-bold text-red-700">
                            🙁 {user?.firstName || 'Student'}, you scored {quizResults.percentage}% ({quizResults.score}/{quizResults.totalQuestions})
                          </h2>
                          <p className="text-muted-foreground italic">
                            "Almost there! Keep practicing and you'll pass next time!"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Missed Questions Review */}
                  {quizResults.missedQuestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-700">Missed Questions Review</CardTitle>
                        <p className="text-muted-foreground">
                          Review these {quizResults.missedQuestions.length} questions to improve your understanding
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {quizResults.missedQuestions.map((missed, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <h4 className="font-semibold">{missed.question.questionText}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-red-600">❌ Your Answer:</span>
                                <span>{missed.userAnswer || 'Not answered'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅ Correct Answer:</span>
                                <span className="font-medium">{missed.correctAnswer}</span>
                              </div>
                              {missed.question.explanation && (
                                <div className="mt-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                  <span className="text-blue-800">🧠 Explanation:</span>
                                  <p className="text-blue-700 mt-1">{missed.question.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        setQuizMode('setup');
                        setQuizResults(null);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Take Another Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}