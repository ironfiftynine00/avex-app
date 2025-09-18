import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudyHeader from "@/components/study/study-header";
import TopNav from "@/components/navigation/top-nav";
import { Image, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Infographic, Category, Subtopic } from "@shared/schema";
import { useReviewTracking } from "@/hooks/useStudyTracking";
import { useReviewTimeTracker } from "@/hooks/useDailyProgress";
import { useProgressDialog } from "@/contexts/ProgressDialogContext";
import { useEffect } from "react";

export default function ReviewMode() {
  const [, setLocation] = useLocation();
  const { openProgressDialog } = useProgressDialog();
  const { startTracking, markScrolledToEnd, finishTracking } = useReviewTracking(openProgressDialog);
  const { startReviewSession } = useReviewTimeTracker();
  const [match, params] = useRoute("/study/review/category/:categoryId/subtopic/:subtopicId");
  
  const categoryId = parseInt(params?.categoryId || '0');
  const subtopicId = parseInt(params?.subtopicId || '0');

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

  const { data: infographics = [], isLoading } = useQuery({
    queryKey: ['/api/infographics/subtopic', subtopicId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/infographics/subtopic/${subtopicId}`);
        if (!response.ok) {
          // If subtopic-specific infographics don't exist, try category-level
          const categoryResponse = await fetch(`/api/infographics/category/${categoryId}`);
          return categoryResponse.ok ? categoryResponse.json() : [];
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching infographics:', error);
        return [];
      }
    },
    enabled: !!subtopicId && !!categoryId
  });

  // Start tracking when component mounts
  useEffect(() => {
    startTracking();
    
    // Start daily progress tracking for 3-minute requirement
    const cleanup = startReviewSession();
    
    return () => {
      finishTracking();
      cleanup && cleanup();
    };
  }, []);

  // Track scroll to end
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= documentHeight - 100) { // Within 100px of bottom
        markScrolledToEnd();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    finishTracking();
    setLocation(`/study/review/category/${categoryId}/subtopics`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StudyHeader title="Review Mode" onBack={handleBack} />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <StudyHeader 
        title={`Review - ${subtopic?.name || 'Loading...'}`} 
        onBack={handleBack}
      />
      
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-blue-500 text-white">
            Review Mode
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">
            {subtopic?.name || 'Study Materials'}
          </h1>
          <p className="text-muted-foreground">{category?.name}</p>
          <p className="text-sm text-muted-foreground">
            Visual learning resources and study materials
          </p>
        </div>

        <div className="space-y-4">
          {infographics.length > 0 ? (
            infographics.map((infographic: Infographic) => (
              <Card key={infographic.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {infographic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {infographic.imageUrl ? (
                    <div className="mb-4">
                      <img 
                        src={infographic.imageUrl} 
                        alt={infographic.title}
                        className="w-full h-auto rounded-lg border"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8 text-center mb-4">
                      <Image className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Study Material Content</p>
                    </div>
                  )}
                  
                  {infographic.description && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        {infographic.description}
                      </p>
                    </div>
                  )}
                  
                  {infographic.content && typeof infographic.content === 'string' && (
                    <div className="mt-4 bg-background border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2">Key Information:</h4>
                      <div className="text-sm text-foreground leading-relaxed">
                        {infographic.content.split('\n').map((line: string, index: number) => (
                          <p key={index} className="mb-2">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-8 mb-6">
                <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Study Materials Available</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no review materials for this subtopic.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try selecting a different subtopic or check back later for new content.
                </p>
              </div>
              
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Choose Different Subtopic
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}