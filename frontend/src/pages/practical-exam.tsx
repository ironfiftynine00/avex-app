import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  Trophy,
  Users,
  Calendar,
  Lock,
  Crown,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  ShieldCheck,
  Activity,
  Star
} from "lucide-react";
import TopNav from "@/components/navigation/top-nav";
import { useLocation } from "wouter";

export default function PracticalExam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [showSchedulingGuide, setShowSchedulingGuide] = useState(false);
  
  // Check if user has premium access
  const hasAccess = user && (user.role === "premium" || user.role === "admin");

  // Check if user already has a pending premium request
  const { data: existingRequest } = useQuery({
    queryKey: ["/api/premium-requests/my-request"],
    enabled: !!user && user.role === "basic"
  });

  // Mutation to request premium access
  const requestPremiumMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/premium-requests", {
        userId: user?.id,
        requestMessage: message
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your premium access request has been submitted to the administrator.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit premium access request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRequestPremium = () => {
    const message = `I would like to request premium access to use practical study guides. This will help me with hands-on AMT preparation and practical test skills.`;
    requestPremiumMutation.mutate(message);
  };

  const handleViewStudyGuide = (guide: any) => {
    // Navigate to dedicated practical station page
    setLocation(`/practical/${guide.id}`);
  };

  const practicalGuides = [
    {
      id: "aircraft-electrical",
      title: "Aircraft Electrical Components",
      description: "Essential guide to electrical systems, wiring, components, and troubleshooting techniques for aircraft maintenance",
      topics: ["Circuit Analysis", "Component Testing", "Wire Repair", "Electrical Safety"],
      infographicsCount: 15,
      difficulty: "Intermediate",
      lastUpdated: "Dec 20, 2024",
      category: "Station 1"
    },
    {
      id: "weight-balance",
      title: "Weight & Balance",
      description: "Comprehensive procedures for aircraft weight and balance calculations, loading, and center of gravity determination",
      topics: ["CG Calculations", "Loading Charts", "Moment Arms", "Weight Limits"],
      infographicsCount: 12,
      difficulty: "Advanced",
      lastUpdated: "Dec 18, 2024",
      category: "Station 2"
    },
    {
      id: "technical-publications",
      title: "Technical Publications",
      description: "Guide to using maintenance manuals, service bulletins, airworthiness directives, and technical documentation",
      topics: ["Manual Navigation", "AD Compliance", "Service Bulletins", "Parts Catalogs"],
      infographicsCount: 8,
      difficulty: "Beginner",
      lastUpdated: "Dec 22, 2024",
      category: "Station 3"
    },
    {
      id: "sheet-metal",
      title: "Sheet Metal Work",
      description: "Visual procedures for sheet metal repair, forming, cutting, and joining techniques in aircraft maintenance",
      topics: ["Metal Forming", "Rivet Installation", "Patch Repairs", "Layout Techniques"],
      infographicsCount: 18,
      difficulty: "Advanced",
      lastUpdated: "Dec 15, 2024",
      category: "Station 4"
    },
    {
      id: "aircraft-instruments",
      title: "Aircraft Instruments",
      description: "Complete guide to aircraft instrument systems, testing procedures, and troubleshooting techniques",
      topics: ["Pitot-Static Testing", "Compass Swing", "Instrument Removal", "System Checks"],
      infographicsCount: 14,
      difficulty: "Intermediate",
      lastUpdated: "Dec 19, 2024",
      category: "Station 5"
    },
    {
      id: "aircraft-tools",
      title: "Aircraft Tools",
      description: "Essential reference for proper tool usage, safety procedures, and specialized aircraft maintenance equipment",
      topics: ["Tool Safety", "Torque Procedures", "Specialized Tools", "Tool Calibration"],
      infographicsCount: 10,
      difficulty: "Beginner",
      lastUpdated: "Dec 17, 2024",
      category: "Station 6"
    },
    {
      id: "painting-corrosion",
      title: "Airframe Painting and Corrosion Identification",
      description: "Comprehensive guide to aircraft painting procedures, corrosion detection, and prevention techniques",
      topics: ["Surface Prep", "Paint Application", "Corrosion Types", "Prevention Methods"],
      infographicsCount: 16,
      difficulty: "Intermediate",
      lastUpdated: "Dec 21, 2024",
      category: "Station 7"
    },
    {
      id: "landing-gear",
      title: "Landing Gear",
      description: "Visual guide to landing gear systems, maintenance procedures, and troubleshooting techniques",
      topics: ["Gear Operation", "Hydraulic Systems", "Tire Inspection", "Brake Systems"],
      infographicsCount: 13,
      difficulty: "Advanced",
      lastUpdated: "Dec 16, 2024",
      category: "Station 8"
    },
    {
      id: "propeller",
      title: "Propeller",
      description: "Complete reference for propeller maintenance, inspection, and repair procedures",
      topics: ["Blade Inspection", "Hub Maintenance", "Balance Procedures", "Pitch Adjustments"],
      infographicsCount: 11,
      difficulty: "Advanced",
      lastUpdated: "Dec 14, 2024",
      category: "Station 9"
    },
    {
      id: "reciprocating-engine",
      title: "Reciprocating Engine",
      description: "Detailed guide to reciprocating engine maintenance, troubleshooting, and repair procedures",
      topics: ["Compression Testing", "Valve Adjustment", "Engine Timing", "Fuel System"],
      infographicsCount: 20,
      difficulty: "Advanced",
      lastUpdated: "Dec 13, 2024",
      category: "Station 10"
    },
    {
      id: "aircraft-walkaround",
      title: "Aircraft Walk Around",
      description: "Step-by-step visual guide for conducting thorough aircraft pre-flight inspections and walk-around procedures",
      topics: ["Pre-flight Checks", "Visual Inspection", "Safety Items", "Discrepancy Logging"],
      infographicsCount: 9,
      difficulty: "Beginner",
      lastUpdated: "Dec 12, 2024",
      category: "Station 11"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "upcoming": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600";
      case "Intermediate": return "text-yellow-600";
      case "Advanced": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopNav />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Practical Study Guides</h1>
              <p className="text-muted-foreground">Visual guides and infographics to master hands-on AMT skills</p>
            </div>
          </div>
          
          {/* Premium Badge */}
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            Premium Feature
          </Badge>
        </div>

        {/* Practical Exam Scheduling Guide - Collapsible */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowSchedulingGuide(!showSchedulingGuide)}
            variant="outline"
            className="w-full justify-between p-4 h-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
          >
            <div className="flex items-center gap-3 text-left">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-blue-700">
                  Practical Examination Scheduling & Requirements
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Complete guide to schedule your practical examination and required documentation
                </p>
              </div>
            </div>
            <div className="text-blue-600">
              {showSchedulingGuide ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </Button>

          {showSchedulingGuide && (
            <Card className="mt-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <p className="text-base text-gray-700 leading-relaxed">
                    After successfully completing and passing all theoretical examinations, applicants may proceed with their Practical (Skill) Test by following these steps:
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Step 1: Request for Practical Permit */}
                  <div className="border-l-4 border-blue-200 pl-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</div>
                      Request for Practical Permit
                    </h4>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-sm leading-relaxed">
                        • Send your <strong>Knowledge Test Result (KTR)</strong> to the CAAP – Proficiency Check and Skills Test Division (PCSTD) via email at:
                      </p>
                      <div className="ml-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">📧 pcstd@caap.gov.ph</p>
                      </div>
                      <p className="text-sm leading-relaxed">
                        • Wait for the issuance of your <strong>Practical Permit</strong> (ensure to print it once received)
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Book Your Skill Test Schedule */}
                  <div className="border-l-4 border-green-200 pl-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</div>
                      Book Your Skill Test Schedule
                    </h4>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-sm leading-relaxed">
                        • Contact your preferred <strong>accredited skill test center</strong> via email or phone
                      </p>
                      <p className="text-sm leading-relaxed">
                        • Confirm your examination schedule and coordinate any additional requirements or fees
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Prepare Required Documents */}
                  <div className="border-l-4 border-orange-200 pl-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</div>
                      Prepare Required Documents and Materials
                    </h4>
                    <div className="text-gray-700">
                      <p className="text-sm font-medium mb-4 text-gray-800">
                        📋 Bring the following on the day of your Practical Examination:
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Practical Permit</strong> (printed copy)</p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Form 542</strong> (General Application Form - completed and printed)</p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Theoretical Exam Results</strong></p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Knowledge Test Report (KTR)</strong></p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Academic Credentials</strong> - photocopy of TOR and Diploma/Certificate, or COE/OJT Certificate</p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Government-issued ID</strong> (valid identification card)</p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>ID Photographs</strong> - Two (2) recent 2x2 photos</p>
                        </div>
                        <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm leading-relaxed"><strong>Blue Ballpen</strong> for signing forms</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Process Your License */}
                  <div className="border-l-4 border-purple-200 pl-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">4</div>
                      Process Your License After Passing
                    </h4>
                    <div className="space-y-3 text-gray-700">
                      <p className="text-sm leading-relaxed">
                        • Submit your <strong>practical exam result</strong> to the CAAP Main Office
                      </p>
                      <p className="text-sm leading-relaxed">
                        • This step is necessary for processing and release of your <strong>Aviation Maintenance Technician (AMT) License Card</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Premium Access Request Section (for basic users) */}
        {user && user.role === "basic" && !hasAccess && (
          <Card className="mb-8 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-orange-700">
                <Lock className="h-6 w-6" />
                Premium Feature Locked
              </CardTitle>
              <CardDescription>
Practical Study Guides require Premium Access
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
Access comprehensive visual guides and infographics covering hands-on AMT skills and practical test preparation. 
                Premium access includes step-by-step procedures, troubleshooting guides, and expert tips for real-world scenarios.
              </p>
              
              {existingRequest?.status === "pending" ? (
                <div className="space-y-4">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Request Pending Review
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Your premium access request is being reviewed by an administrator.
                    You'll be notified once it's approved.
                  </p>
                </div>
              ) : existingRequest?.status === "rejected" ? (
                <div className="space-y-4">
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Request Declined
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your previous premium access request was declined. 
                    You can submit a new request if your circumstances have changed.
                  </p>
                  <Button 
                    onClick={handleRequestPremium} 
                    disabled={requestPremiumMutation.isPending}
                    className="avex-button-primary"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {requestPremiumMutation.isPending ? "Submitting..." : "Request Premium Access"}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleRequestPremium} 
                  disabled={requestPremiumMutation.isPending}
                  className="avex-button-primary"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {requestPremiumMutation.isPending ? "Submitting..." : "Request Premium Access"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Practical Study Guides Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {practicalGuides.map((guide) => (
            <Card 
              key={guide.id}
              className={`avex-card transition-all ${
                hasAccess 
                  ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer" 
                  : "opacity-60 relative"
              }`}
              onClick={() => hasAccess && setSelectedExam(guide.id)}
            >
              {/* Lock overlay for basic users */}
              {!hasAccess && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">Premium Access Required</p>
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {guide.description}
                    </CardDescription>
                  </div>
                  <Badge className={`ml-2 bg-${guide.category === 'Powerplant' ? 'red' : guide.category === 'Electronics' ? 'blue' : guide.category === 'Airframe' ? 'green' : 'purple'}-100 text-${guide.category === 'Powerplant' ? 'red' : guide.category === 'Electronics' ? 'blue' : guide.category === 'Airframe' ? 'green' : 'purple'}-800`}>
                    {guide.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Topics Covered */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>


                  {/* Action Button */}
                  <div className="pt-2">
                    {hasAccess ? (
                      <Button 
                        className="w-full avex-button-primary"
                        onClick={() => handleViewStudyGuide(guide)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Study Guide
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Premium Access Required
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Trophy className="h-5 w-5" />
              About Practical Examinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">What to Expect</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real aircraft components and tools</li>
                  <li>• Simulated maintenance scenarios</li>
                  <li>• Expert instructor supervision</li>
                  <li>• Immediate feedback and scoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Premium subscription required</li>
                  <li>• Safety training completion</li>
                  <li>• Basic theoretical knowledge</li>
                  <li>• Advance registration needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}