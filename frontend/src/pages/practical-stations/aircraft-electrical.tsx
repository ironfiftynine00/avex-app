import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  Zap,
  ArrowLeft,
  FileText,
  Video,
  Image
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function AircraftElectricalStation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const stationId = 2; // Aircraft Electrical station ID

  // Scroll to top when component mounts - with delay to ensure DOM is ready
  useEffect(() => {
    // Immediate scroll without animation
    window.scrollTo(0, 0);
    // Backup with slight delay to ensure page is fully rendered
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch dynamic practical content from database
  const { data: practicalContent = [], isLoading } = useQuery({
    queryKey: ["/api/practical-stations", stationId, "content"],
    queryFn: () => fetch(`/api/practical-stations/${stationId}/content`).then(res => res.json())
  });

  const stationInfo = {
    title: "Aircraft Electrical Components",
    category: "Powerplant",
    description: "Learn essential electrical systems, components, and troubleshooting techniques for aircraft maintenance.",
    estimatedTime: "45-60 minutes",
    difficulty: "Intermediate",
    topics: [
      "Electrical Circuit Analysis",
      "Wire Harness Inspection",
      "Battery Testing Procedures",
      "Generator/Alternator Systems",
      "Avionics Power Distribution"
    ]
  };

  // Note: renderContent function removed - now using simplified review materials pattern

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-blue-100 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{stationInfo.estimatedTime}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`border-white/30 text-white text-xs ${
                        stationInfo.difficulty === 'Beginner' ? 'bg-green-500/20' :
                        stationInfo.difficulty === 'Intermediate' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}
                    >
                      {stationInfo.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/practical-exam")}
                className="text-white hover:bg-white/20 p-2 h-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Blocks First - Following Review Materials Pattern */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading practical content...</p>
          </div>
        ) : practicalContent.length > 0 ? (
          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">Practical Learning Materials</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {practicalContent
                .filter((content: any) => content.isVisible)
                .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
                .map((content: any) => {
                  // Safely parse content data once for each item
                  const safeJsonParse = (str: string) => {
                    try {
                      return JSON.parse(str);
                    } catch {
                      return { text: str };
                    }
                  };
                  
                  const contentData = typeof content.content === 'string' 
                    ? safeJsonParse(content.content) 
                    : content.content || {};

                  return (
                    <Card key={content.id} className="border-2 hover:border-blue-300 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-700">{content.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {content.contentType === 'image' && contentData.imageUrl ? (
                          <div className="mb-4">
                            <img 
                              src={contentData.imageUrl} 
                              alt={content.title}
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
                        ) : content.contentType === 'video' && contentData.videoUrl ? (
                          <div className="mb-4">
                            <div className="aspect-video">
                              <iframe
                                src={contentData.videoUrl}
                                className="w-full h-full rounded-lg border"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center mb-4">
                            <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <p className="text-muted-foreground">Content block</p>
                          </div>
                        )}
                        {contentData.text && (
                          <div className="text-sm text-muted-foreground">
                            <p className="whitespace-pre-wrap">
                              {typeof contentData.text === 'string' 
                                ? contentData.text 
                                : typeof contentData.text === 'object' 
                                  ? JSON.stringify(contentData.text)
                                  : String(contentData.text)
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-8">
              <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">No Practical Learning Materials Yet</h3>
              <p className="text-muted-foreground">Additional practical content blocks will appear here when they are added by administrators.</p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}