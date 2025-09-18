import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudyHeader from "@/components/study/study-header";
import TopNav from "@/components/navigation/top-nav";
import { 
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock
} from "lucide-react";
import type { Subtopic, Category } from "@shared/schema";

export default function SubtopicSelection() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/study/:mode/category/:categoryId/subtopics");
  
  const mode = params?.mode || 'review';
  const categoryId = parseInt(params?.categoryId || '0');

  // Auto scroll to top when component mounts or parameters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode, categoryId]);

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
      case 'review': return 'from-blue-500 to-blue-600';
      case 'practice': return 'from-green-500 to-green-600';
      case 'quiz': return 'from-orange-500 to-orange-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const { data: category } = useQuery({
    queryKey: ['/api/categories', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`);
      return response.json();
    },
    enabled: !!categoryId
  });

  const { data: subtopics = [], isLoading } = useQuery({
    queryKey: ['/api/categories', categoryId, 'subtopics'],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}/subtopics`);
      return response.json();
    },
    enabled: !!categoryId
  });

  const handleSubtopicSelect = (subtopicId: number) => {
    setLocation(`/study/${mode}/category/${categoryId}/subtopic/${subtopicId}`);
  };

  const handleBack = () => {
    setLocation(`/study/${mode}/categories`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        
        {/* Loading Banner */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className={`bg-gradient-to-r ${getModeColor()} text-white p-6 rounded-lg mb-6 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  {mode === 'review' && <BookOpen className="w-6 h-6" />}
                  {mode === 'practice' && <Target className="w-6 h-6" />}
                  {mode === 'quiz' && <Clock className="w-6 h-6" />}
                </div>
                <h1 className="text-3xl font-bold">{getModeTitle()}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      {/* Mode Banner */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`bg-gradient-to-r ${getModeColor()} text-white p-6 rounded-lg mb-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {mode === 'review' && <BookOpen className="w-6 h-6" />}
                  {mode === 'practice' && <Target className="w-6 h-6" />}
                  {mode === 'quiz' && <Clock className="w-6 h-6" />}
                </div>
                <h1 className="text-3xl font-bold">{getModeTitle()}</h1>
              </div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <p className="text-white/90 text-lg mb-4">
              {category?.name || 'Loading category...'}
            </p>
            <p className="text-white/80 text-sm">
              {mode === 'review' && 'Study detailed infographics and explanations'}
              {mode === 'practice' && 'Practice questions with immediate feedback'}
              {mode === 'quiz' && 'Timed quizzes with skip mechanics'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Select a Subtopic</h2>
          <p className="text-muted-foreground">Choose the specific area you want to study</p>
        </div>

        <div className="grid gap-4">
          {subtopics.map((subtopic: Subtopic) => (
            <Card 
              key={subtopic.id} 
              className="cursor-pointer transition-all duration-200 border-border hover:border-primary/50 hover:shadow-lg"
              onClick={() => handleSubtopicSelect(subtopic.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{subtopic.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Study this specific topic
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {subtopics.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Subtopics Available</h3>
              <p className="text-muted-foreground">
                This category doesn't have any subtopics yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}