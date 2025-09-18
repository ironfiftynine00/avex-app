import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle,
  ArrowLeft,
  Hammer,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Wrench,
  Gauge,
  Zap,
  Plane,
  Cog,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import TopNav from "@/components/navigation/top-nav";
import type { PracticalStation, PracticalContent } from "@shared/schema";

interface PracticalStationPageProps {
  slug: string;
}

export default function PracticalStationPage({ slug }: PracticalStationPageProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts - with delay to ensure DOM is ready
  useEffect(() => {
    // Immediate scroll without animation
    window.scrollTo(0, 0);
    // Backup with slight delay to ensure page is fully rendered
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [slug]);

  // Fetch station data by slug
  const { data: stations, isLoading: stationsLoading, error: stationsError } = useQuery<PracticalStation[]>({
    queryKey: ["/api/practical-stations"],
  });

  // Find the station by slug
  const station = stations?.find(s => s.slug === slug);

  // Fetch station content
  const { data: content, isLoading: contentLoading, error: contentError } = useQuery<PracticalContent[]>({
    queryKey: ["/api/practical-stations", station?.id, "content"],
    enabled: !!station?.id,
  });

  // Error handling
  if (stationsError || contentError) {
    const error = stationsError || contentError;
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Station</h1>
            <p className="text-muted-foreground mb-6">
              {(error as any)?.message || "Failed to load practical station data. Please try again."}
            </p>
            <div className="space-x-4">
              <Button onClick={() => window.location.reload()} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => setLocation("/practical-exam")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Practical Stations
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (stationsLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Station not found
  if (!station) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Station Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The practical station you're looking for doesn't exist.
            </p>
            <Button onClick={() => setLocation("/practical-exam")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Practical Stations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get icon based on category
  const getStationIcon = (category: string) => {
    switch (category) {
      case 'Airframe':
        return Plane;
      case 'Powerplant':
        return Cog;
      case 'General':
        return BookOpen;
      default:
        return Wrench;
    }
  };

  // Get color scheme based on category
  const getColorScheme = (category: string) => {
    switch (category) {
      case 'Airframe':
        return {
          gradient: 'from-blue-500 to-blue-600',
          cardBorder: 'border-blue-200',
          cardBg: 'from-blue-50 to-indigo-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
      case 'Powerplant':
        return {
          gradient: 'from-red-500 to-red-600',
          cardBorder: 'border-red-200',
          cardBg: 'from-red-50 to-orange-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'General':
        return {
          gradient: 'from-green-500 to-green-600',
          cardBorder: 'border-green-200',
          cardBg: 'from-green-50 to-emerald-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      default:
        return {
          gradient: 'from-orange-500 to-orange-600',
          cardBorder: 'border-orange-200',
          cardBg: 'from-orange-50 to-red-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-800'
        };
    }
  };

  const StationIcon = getStationIcon(station.category);
  const colors = getColorScheme(station.category);

  // Render content based on type
  const renderContent = (item: PracticalContent) => {
    const contentData = typeof item.content === 'string' ? 
      (() => {
        try { return JSON.parse(item.content); } 
        catch { return {}; }
      })() : 
      (item.content || {});

    switch (item.contentType) {
      case 'image':
        if (contentData.imageUrl) {
          return (
            <div className="mb-4">
              <img 
                src={contentData.imageUrl} 
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  fallback?.classList.remove('hidden');
                }}
              />
              <div className="hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
                <Image className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-muted-foreground">Image failed to load</p>
              </div>
            </div>
          );
        }
        break;
      
      case 'video':
        if (contentData.videoUrl) {
          return (
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
          );
        }
        break;
      
      case 'text':
      default:
        if (item.htmlContent) {
          // Sanitize HTML content to prevent XSS attacks
          const sanitizedHTML = DOMPurify.sanitize(item.htmlContent, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'div', 'span'],
            ALLOWED_ATTR: ['class', 'style']
          });
          return (
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            />
          );
        } else if (contentData.text) {
          return (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {contentData.text}
            </div>
          );
        }
        break;
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
        <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Content block</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className={`bg-gradient-to-r ${colors.gradient} text-white p-5 rounded-lg mb-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <StationIcon className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{station.name}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {station.category}
                    </Badge>
                    {station.estimatedTime && (
                      <div className="flex items-center gap-1 text-white/90 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{station.estimatedTime}</span>
                      </div>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`border-white/30 text-white text-xs ${
                        station.difficulty === 'Beginner' ? 'bg-green-500/20' :
                        station.difficulty === 'Intermediate' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}
                    >
                      {station.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/practical-exam")}
                className="text-white hover:bg-white/20 p-2 h-auto"
                data-testid="back-to-practical-exam"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            {station.description && (
              <p className="text-white/90 text-sm mt-3 leading-relaxed">
                {station.description}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-8">
          {content && content.length > 0 ? (
            content
              .filter(item => item.isVisible)
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item) => (
                <Card 
                  key={item.id} 
                  className={`${colors.cardBorder} bg-gradient-to-r ${colors.cardBg}`}
                  data-testid={`content-block-${item.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                        {item.contentType === 'image' ? (
                          <Image className={`w-6 h-6 ${colors.iconColor}`} />
                        ) : item.contentType === 'video' ? (
                          <Video className={`w-6 h-6 ${colors.iconColor}`} />
                        ) : (
                          <FileText className={`w-6 h-6 ${colors.iconColor}`} />
                        )}
                      </div>
                      <CardTitle className={colors.textColor}>{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderContent(item)}
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className={`${colors.cardBorder} bg-gradient-to-r ${colors.cardBg}`}>
              <CardContent className="py-16 text-center">
                <BookOpen className={`w-16 h-16 ${colors.iconColor} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${colors.textColor} mb-2`}>
                  Content Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  This practical station is being prepared with comprehensive study materials.
                  Check back soon for detailed guides and interactive content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}