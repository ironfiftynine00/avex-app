import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StudyQuestion {
  id: number;
  questionText: string;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  explanation: string;
  subtopicName: string;
  categoryName: string;
}

interface StudyCarouselProps {
  className?: string;
}

export function StudyCarousel({ className = "" }: StudyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());


  // Fetch random questions from the database
  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['/api/questions/random-study'],
    queryFn: () => fetch('/api/questions/random-study?count=10').then(res => res.json()) as Promise<StudyQuestion[]>,
    refetchInterval: 30000, // Refetch every 30 seconds to get new random questions
  });

  // Auto-advance carousel
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % questions.length);
      // Reset flip state when advancing automatically
      setFlippedCards(new Set());
    }, 6000); // 6 seconds per card

    return () => clearInterval(interval);
  }, [questions]);

  const handleFlip = (questionId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };



  // Get correct answer text
  const getCorrectAnswerText = (question: StudyQuestion) => {
    switch (question.correctAnswer) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
      default: return question.explanation || "Answer not available";
    }
  };

  if (isLoading || !questions || questions.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-56 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-avex-blue mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading study questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isFlipped = flippedCards.has(currentQuestion.id);

  return (
    <div className={`w-full ${className}`}>

      {/* Main Flashcard */}
      <div className="relative">
        <div className={`flip-card w-full h-56 mb-4 ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner relative w-full h-full">
            {/* Front */}
            <Card 
              className="flip-card-front absolute inset-0 cursor-pointer group hover:shadow-lg transition-all"
              onClick={() => handleFlip(currentQuestion.id)}
            >
              <CardContent className="h-full bg-gradient-to-br from-avex-blue to-avex-indigo rounded-lg p-6 flex flex-col justify-center text-white relative overflow-hidden">
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {currentQuestion.categoryName}
                  </span>
                </div>
                
                {/* Question Content */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">❓</span>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed font-medium break-words whitespace-pre-wrap text-center px-2">
                    {currentQuestion.questionText}
                  </p>
                </div>
                
                {/* Flip Hint */}
                <div className="absolute bottom-4 right-4 text-xs opacity-75">
                  Tap to reveal answer
                </div>
              </CardContent>
            </Card>
            
            {/* Back */}
            <Card 
              className="flip-card-back absolute inset-0 cursor-pointer group hover:shadow-lg transition-all"
              onClick={() => handleFlip(currentQuestion.id)}
            >
              <CardContent className="h-full bg-gradient-to-br from-avex-purple to-avex-violet rounded-lg p-6 flex flex-col justify-center text-white relative overflow-hidden">
                {/* Answer Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    Answer
                  </span>
                </div>
                
                {/* Answer Content */}
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed break-words whitespace-pre-wrap text-center px-2">
                    {currentQuestion.explanation || getCorrectAnswerText(currentQuestion)}
                  </p>
                </div>
                
                {/* Flip Hint */}
                <div className="absolute bottom-4 right-4 text-xs opacity-75">
                  Tap to see question
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>


    </div>
  );
}