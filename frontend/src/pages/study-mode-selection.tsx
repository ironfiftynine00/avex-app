import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StudyHeader from "@/components/study/study-header";
import TopNav from "@/components/navigation/top-nav";
import { 
  Book, 
  BookOpen,
  Target, 
  Clock,
  ArrowRight
} from "lucide-react";

const studyModes = [
  {
    id: 'review',
    title: 'Review',
    description: 'Study at your own pace with detailed explanations',
    icon: Book,
    color: 'bg-blue-500 hover:bg-blue-600',
    borderColor: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Test your knowledge without time pressure',
    icon: Target,
    color: 'bg-green-500 hover:bg-green-600',
    borderColor: 'border-green-200 hover:border-green-300'
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Timed quizzes with skip mechanics',
    icon: Clock,
    color: 'bg-orange-500 hover:bg-orange-600',
    borderColor: 'border-orange-200 hover:border-orange-300'
  }
];

export default function StudyModeSelection() {
  const [, setLocation] = useLocation();

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleModeSelect = (mode: string) => {
    setLocation(`/study/${mode}/categories`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      {/* Compact Study Mode Banner */}
      <div className="w-full px-4 py-4 md:py-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 md:p-6 rounded-xl relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Study Mode</h1>
            </div>
            <p className="text-blue-100 text-sm md:text-base">
              Master AMT concepts through interactive learning
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile-Optimized Study Mode Selection */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Choose Your Study Mode</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Select how you want to learn today
          </p>
        </div>

        {/* Compact Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {studyModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Card 
                key={mode.id} 
                className={`cursor-pointer transition-all duration-200 ${mode.borderColor} hover:shadow-lg active:scale-95 group`}
                onClick={() => handleModeSelect(mode.id)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${mode.color} flex items-center justify-center transition-all duration-200 group-hover:scale-105`}>
                      <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg md:text-xl text-foreground">
                        {mode.title}
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                    
                    <Button 
                      className={`${mode.color} hover:opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 w-full text-sm`}
                      size="sm"
                    >
                      Start {mode.title}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Compact Features Section */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-foreground text-xs mb-1">Interactive</h4>
            <p className="text-xs text-muted-foreground">Rich visuals</p>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-medium text-foreground text-xs mb-1">Feedback</h4>
            <p className="text-xs text-muted-foreground">Instant answers</p>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <h4 className="font-medium text-foreground text-xs mb-1">Timed</h4>
            <p className="text-xs text-muted-foreground">Real exam feel</p>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Book className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-foreground text-xs mb-1">Progress</h4>
            <p className="text-xs text-muted-foreground">Track growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}