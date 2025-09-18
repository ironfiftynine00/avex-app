// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TopNav from "@/components/navigation/top-nav";
import Flashcard from "@/components/study/flashcard";
import QuestionCard from "@/components/exam/question-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Book, 
  Image, 
  Play, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Target
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { Question, Flashcard as FlashcardType, Infographic, Category, Subtopic } from "@shared/schema";

export default function Study() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("review");
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [practiceQuizConfig, setPracticeQuizConfig] = useState({
    questionCount: "20",
    timeLimit: "auto"
  });

  // Quiz Mode states
  const [quizMode, setQuizMode] = useState<'setup' | 'quiz' | 'completed'>('setup');
  const [quizSelectedCategories, setQuizSelectedCategories] = useState<number[]>([]);
  const [quizSelectedSubtopics, setQuizSelectedSubtopics] = useState<number[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
  const [quizSkipsRemaining, setQuizSkipsRemaining] = useState(3);

  // Practice Mode states
  const [practiceMode, setPracticeMode] = useState<'setup' | 'practice'>('setup');
  const [practiceSelectedCategories, setPracticeSelectedCategories] = useState<number[]>([]);
  const [practiceSelectedSubtopics, setPracticeSelectedSubtopics] = useState<number[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceCurrentIndex, setPracticeCurrentIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});

  // Review Mode states
  const [reviewSelectedCategories, setReviewSelectedCategories] = useState<number[]>([]);
  const [reviewSelectedSubtopics, setReviewSelectedSubtopics] = useState<number[]>([]);
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);
  const [practiceTimeRemaining, setPracticeTimeRemaining] = useState<number>(0);
  const [availableQuestionCount, setAvailableQuestionCount] = useState(0);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const { data: subtopics } = useQuery({
    queryKey: [`/api/categories/${selectedCategory}/subtopics`],
    enabled: !!selectedCategory,
  });

  const { data: infographics = [] } = useQuery<Infographic[]>({
    queryKey: [`/api/infographics/category/${selectedCategory}`],
    enabled: activeTab === "review" && !!selectedCategory,
  });

  const { data: flashcards = [] } = useQuery<FlashcardType[]>({
    queryKey: [`/api/flashcards/category/${selectedCategory}`],
    enabled: activeTab === "practice" && !!selectedCategory,
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: [`/api/questions/category/${selectedCategory}`],
    enabled: activeTab === "quiz" && !!selectedCategory,
  });

  // Query for all subtopics (for practice quiz setup)
  const { data: allSubtopics = [] } = useQuery<Subtopic[]>({
    queryKey: ["/api/subtopics/all"],
    enabled: activeTab === "quiz",
  });

  // Query for subtopics linked to selected categories
  const { data: categorySubtopics = [] } = useQuery<Subtopic[]>({
    queryFn: async () => {
      if (selectedCategories.length === 0) return [];
      
      const subtopicsPromises = selectedCategories.map(categoryId =>
        apiRequest("GET", `/api/categories/${categoryId}/subtopics`).then(res => res.json())
      );
      
      const subtopicsArrays = await Promise.all(subtopicsPromises);
      const uniqueSubtopics = Array.from(
        new Map(
          subtopicsArrays.flat().map(subtopic => [subtopic.id, subtopic])
        ).values()
      );
      
      return uniqueSubtopics;
    },
    queryKey: [`/api/categories-subtopics`, selectedCategories],
    enabled: selectedCategories.length > 0 && activeTab === "quiz",
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  // Calculate available questions based on selected subtopics
  useEffect(() => {
    const calculateQuestionCount = async () => {
      if (selectedSubtopics.length === 0) {
        setAvailableQuestionCount(0);
        return;
      }

      try {
        const questionsPromises = selectedSubtopics.map(subtopicId =>
          apiRequest("GET", `/api/questions/subtopic/${subtopicId}`).then(res => res.json())
        );
        
        const questionsArrays = await Promise.all(questionsPromises);
        const totalQuestions = questionsArrays.flat().length;
        setAvailableQuestionCount(totalQuestions);
      } catch (error) {
        console.error('Error calculating question count:', error);
        setAvailableQuestionCount(0);
      }
    };

    if (practiceQuizMode === 'setup') {
      calculateQuestionCount();
    }
  }, [selectedSubtopics, practiceQuizMode]);

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories([categories[0].id]);
    }
  }, [categories, selectedCategories]);

  // Auto-select all subtopics when categories change
  useEffect(() => {
    if (categorySubtopics.length > 0) {
      setSelectedSubtopics(categorySubtopics.map(st => st.id));
    }
  }, [categorySubtopics]);

  // Timer effect for practice quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (practiceQuizMode === 'quiz' && practiceTimeRemaining > 0) {
      interval = setInterval(() => {
        setPracticeTimeRemaining(prev => {
          if (prev <= 1) {
            setPracticeQuizMode('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [practiceQuizMode, practiceTimeRemaining]);

  const fetchPracticeQuestions = useMutation({
    mutationFn: async ({ subtopicIds, questionCount }: { subtopicIds: number[]; questionCount: number }): Promise<Question[]> => {
      const questionsPromises = subtopicIds.map(subtopicId =>
        apiRequest("GET", `/api/questions/subtopic/${subtopicId}`).then(res => res.json())
      );
      
      const questionsArrays = await Promise.all(questionsPromises);
      const allQuestions = questionsArrays.flat();
      
      // Shuffle and limit questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, questionCount);
    },
    onSuccess: (questions: Question[]) => {
      setPracticeQuestions(questions);
      setPracticeQuizMode('quiz');
      setCurrentQuestionIndex(0);
      setPracticeAnswers({});
      setPracticeStartTime(new Date());
      
      // Set timer
      const timeLimit = practiceQuizConfig.timeLimit === "auto" ? 
        parseInt(practiceQuizConfig.questionCount) : 
        practiceQuizConfig.timeLimit === "unlimited" ? 0 :
        parseInt(practiceQuizConfig.timeLimit);
      
      setPracticeTimeRemaining(timeLimit * 60); // Convert to seconds
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start practice quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleStartPracticeQuiz = () => {
    if (selectedSubtopics.length === 0) {
      toast({
        title: "No Subtopics Selected",
        description: "Please select at least one subtopic to start the practice quiz.",
        variant: "destructive",
      });
      return;
    }

    const questionCount = parseInt(practiceQuizConfig.questionCount);
    
    if (availableQuestionCount < questionCount) {
      toast({
        title: "Not Enough Questions",
        description: `Only ${availableQuestionCount} questions available. Please reduce the question count or select more subtopics.`,
        variant: "destructive",
      });
      return;
    }

    fetchPracticeQuestions.mutate({
      subtopicIds: selectedSubtopics,
      questionCount: questionCount
    });
  };

  const handlePracticeQuizAnswer = (answer: string) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handlePracticeQuizNext = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete the practice quiz
      setPracticeQuizMode('completed');
    }
  };

  const handlePracticeQuizPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleBackToSetup = () => {
    setPracticeQuizMode('setup');
    setPracticeQuestions([]);
    setCurrentQuestionIndex(0);
    setPracticeAnswers({});
    setPracticeStartTime(null);
    setPracticeTimeRemaining(0);
  };

  const handleNextFlashcard = () => {
    if (flashcards && currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    }
  };

  const handlePreviousFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
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

              {/* Category and Subtopic Dropdowns */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Select value="" onValueChange={(value) => handleReviewCategoryToggle(parseInt(value), true)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {reviewSelectedCategories.length > 0 && (
                  <Select value="" onValueChange={(value) => handleReviewSubtopicToggle(parseInt(value), true)}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select Subtopic" />
                    </SelectTrigger>
                    <SelectContent>
                      {subtopics?.filter(s => reviewSelectedCategories.some(catId => 
                        categories.find(c => c.id === catId)
                      )).map((subtopic) => (
                        <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                          {subtopic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Selected Filters Display */}
              {(reviewSelectedCategories.length > 0 || reviewSelectedSubtopics.length > 0) && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {reviewSelectedCategories.map(catId => {
                    const category = categories.find(c => c.id === catId);
                    return category ? (
                      <Badge key={catId} variant="default" className="flex items-center gap-1">
                        {category.name}
                        <button onClick={() => handleReviewCategoryToggle(catId, false)}>×</button>
                      </Badge>
                    ) : null;
                  })}
                  {reviewSelectedSubtopics.map(subId => {
                    const subtopic = subtopics?.find(s => s.id === subId);
                    return subtopic ? (
                      <Badge key={subId} variant="secondary" className="flex items-center gap-1">
                        {subtopic.name}
                        <button onClick={() => handleReviewSubtopicToggle(subId, false)}>×</button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

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
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
                        <Image className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">Interactive infographic content</p>
                      </div>
                      {infographic.description && (
                        <p className="text-sm text-muted-foreground mt-4">
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

                  {/* Category and Subtopic Dropdowns */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Select value="" onValueChange={(value) => handlePracticeCategoryToggle(parseInt(value), true)}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {practiceSelectedCategories.length > 0 && (
                      <Select value="" onValueChange={(value) => handlePracticeSubtopicToggle(parseInt(value), true)}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select Subtopic" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtopics?.filter(s => practiceSelectedCategories.some(catId => 
                            categories.find(c => c.id === catId)
                          )).map((subtopic) => (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Selected Filters Display */}
                  {(practiceSelectedCategories.length > 0 || practiceSelectedSubtopics.length > 0) && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {practiceSelectedCategories.map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return category ? (
                          <Badge key={catId} variant="default" className="bg-green-600 flex items-center gap-1">
                            {category.name}
                            <button onClick={() => handlePracticeCategoryToggle(catId, false)}>×</button>
                          </Badge>
                        ) : null;
                      })}
                      {practiceSelectedSubtopics.map(subId => {
                        const subtopic = subtopics?.find(s => s.id === subId);
                        return subtopic ? (
                          <Badge key={subId} variant="secondary" className="flex items-center gap-1">
                            {subtopic.name}
                            <button onClick={() => handlePracticeSubtopicToggle(subId, false)}>×</button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Start Practice Button */}
                  {practiceSelectedSubtopics.length > 0 && (
                    <div className="flex justify-center">
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
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
                    <p className="text-muted-foreground">Timed quiz with skip button and score tracking</p>
                  </div>

                  {/* Category and Subtopic Dropdowns */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Select value="" onValueChange={(value) => handleQuizCategoryToggle(parseInt(value), true)}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {quizSelectedCategories.length > 0 && (
                      <Select value="" onValueChange={(value) => handleQuizSubtopicToggle(parseInt(value), true)}>
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select Subtopic" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtopics?.filter(s => quizSelectedCategories.some(catId => 
                            categories.find(c => c.id === catId)
                          )).map((subtopic) => (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Selected Filters Display */}
                  {(quizSelectedCategories.length > 0 || quizSelectedSubtopics.length > 0) && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quizSelectedCategories.map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return category ? (
                          <Badge key={catId} variant="default" className="bg-indigo-600 flex items-center gap-1">
                            {category.name}
                            <button onClick={() => handleQuizCategoryToggle(catId, false)}>×</button>
                          </Badge>
                        ) : null;
                      })}
                      {quizSelectedSubtopics.map(subId => {
                        const subtopic = subtopics?.find(s => s.id === subId);
                        return subtopic ? (
                          <Badge key={subId} variant="secondary" className="flex items-center gap-1">
                            {subtopic.name}
                            <button onClick={() => handleQuizSubtopicToggle(subId, false)}>×</button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Quiz Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Number of Questions</Label>
                      <Select 
                        value={practiceQuizConfig.questionCount}
                        onValueChange={(value) => setPracticeQuizConfig(prev => ({ ...prev, questionCount: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                          <SelectItem value="30">30 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Time Limit</Label>
                      <Select 
                        value={practiceQuizConfig.timeLimit}
                        onValueChange={(value) => setPracticeQuizConfig(prev => ({ ...prev, timeLimit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Start Quiz Button */}
                  {quizSelectedSubtopics.length > 0 && (
                    <div className="flex justify-center">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3">
                        Start Quiz
                      </Button>
                    </div>
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
                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">Quiz in Progress</h2>
                    <p className="text-muted-foreground">Timer running - skip button available</p>
                  </div>

                  <QuestionCard
                    question={quizQuestions[quizCurrentIndex]}
                    questionNumber={quizCurrentIndex + 1}
                    totalQuestions={quizQuestions.length}
                    currentScore={quizScore}
                    timeRemaining={`${Math.floor(quizTimeRemaining / 60)}:${(quizTimeRemaining % 60).toString().padStart(2, '0')}`}
                    skipsRemaining={quizSkipsRemaining}
                    onAnswer={(answer) => setQuizAnswers(prev => ({ ...prev, [quizCurrentIndex]: answer }))}
                    onSkip={() => setQuizSkipsRemaining(prev => prev - 1)}
                    onFlag={() => {}}
                    onNext={() => setQuizCurrentIndex(prev => Math.min(prev + 1, quizQuestions.length - 1))}
                    onPrevious={quizCurrentIndex > 0 ? () => setQuizCurrentIndex(prev => Math.max(prev - 1, 0)) : undefined}
                    selectedAnswer={quizAnswers[quizCurrentIndex] || ""}
                    canGoBack={quizCurrentIndex > 0}
                    isQuizMode={true}
                    showCorrectAnswer={false}
                    isPracticeMode={false}
                  />

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setQuizMode('setup')}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Setup</span>
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
