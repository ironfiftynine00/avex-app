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
  Plane,
  Eye,
  FileText,
  Video,
  Image,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function AircraftWalkaroundStation() {
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
  }, []);

  const stationInfo = {
    title: "Aircraft Walk Around",
    category: "General",
    description: "Step-by-step visual guide for conducting thorough aircraft pre-flight inspections and walk-around procedures.",
    estimatedTime: "40-60 minutes",
    difficulty: "Beginner",
    topics: [
      "Pre-flight Checks",
      "Visual Inspection", 
      "Safety Items",
      "Discrepancy Logging",
      "Documentation"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Plane className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sky-100 text-xs">
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

        {/* Educational Content */}
        <div className="space-y-8">
          
          {/* Pre-flight Inspection Checklist */}
          <Card className="border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-800">Pre-flight Inspection Checklist</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Systematic Approach */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Systematic Inspection Approach</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Cabin Interior</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check flight controls for freedom of movement</li>
                        <li>• Verify instrument readings and operation</li>
                        <li>• Test radio and navigation equipment</li>
                        <li>• Inspect seat belts and shoulder harnesses</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Engine Compartment</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check oil level and condition</li>
                        <li>• Inspect for fuel, oil, or hydraulic leaks</li>
                        <li>• Examine belts, hoses, and connections</li>
                        <li>• Verify air filter condition</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Exterior Walk-around</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Inspect wings, fuselage, and empennage</li>
                        <li>• Check control surfaces and hinges</li>
                        <li>• Examine landing gear and tires</li>
                        <li>• Verify navigation lights and antennas</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Fuel System</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check fuel quantity in all tanks</li>
                        <li>• Inspect fuel caps and seals</li>
                        <li>• Look for fuel stains or leaks</li>
                        <li>• Verify fuel type and contamination</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Safety Items */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Safety Items
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Control Surface Security</p>
                    <p>Verify all control surfaces are properly attached and move freely</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Structural Integrity</p>
                    <p>Check for cracks, dents, or damage to aircraft structure</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Engine Security</p>
                    <p>Ensure engine is properly mounted with no loose components</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Inspection Techniques */}
          <Card className="border-sky-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Eye className="w-6 h-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-800">Visual Inspection Techniques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Inspection Methods */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">What to Look For</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Surface Damage</p>
                      <p className="text-sm text-gray-700">Cracks, dents, scratches, corrosion, or missing parts</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Fluid Leaks</p>
                      <p className="text-sm text-gray-700">Oil, fuel, hydraulic fluid, or coolant stains or drips</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Security Items</p>
                      <p className="text-sm text-gray-700">Loose bolts, fasteners, panels, or access doors</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Wear Patterns</p>
                      <p className="text-sm text-gray-700">Abnormal wear on tires, control surfaces, or cables</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Inspection Techniques</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Touch and Feel</p>
                      <p className="text-sm text-gray-700">Feel for looseness, excessive play, or temperature</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Listen and Smell</p>
                      <p className="text-sm text-gray-700">Unusual sounds during control movement or odors</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Systematic Pattern</p>
                      <p className="text-sm text-gray-700">Follow consistent inspection pattern every time</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Adequate Lighting</p>
                      <p className="text-sm text-gray-700">Use flashlight or position aircraft for best visibility</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Defects */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Common Defects Found During Inspection</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border p-2 text-left">Component</th>
                        <th className="border p-2 text-left">Common Issues</th>
                        <th className="border p-2 text-left">Action Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Tires</td>
                        <td className="border p-2">Uneven wear, low pressure, cuts</td>
                        <td className="border p-2">Check pressure, inspect for damage</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Engine</td>
                        <td className="border p-2">Oil leaks, loose cowling</td>
                        <td className="border p-2">Check oil level, secure panels</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Control Surfaces</td>
                        <td className="border p-2">Loose hinges, damaged fabric</td>
                        <td className="border p-2">Check security, inspect covering</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discrepancy Logging */}
          <Card className="border-sky-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <FileText className="w-6 h-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-800">Discrepancy Logging & Documentation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Documentation Requirements */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Required Documentation</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <h6 className="font-medium text-orange-700">Defect Description</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Specific location of defect</li>
                        <li>• Detailed description of issue</li>
                        <li>• Severity assessment</li>
                        <li>• Date and time of discovery</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <h6 className="font-medium text-orange-700">Inspector Information</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Inspector name and certificate</li>
                        <li>• Contact information</li>
                        <li>• Inspection type performed</li>
                        <li>• Signature and date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grounding Criteria */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3">Aircraft Grounding Criteria</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Flight Safety</p>
                    <p>Any defect that could affect safe flight operation</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Airworthiness</p>
                    <p>Items required by type certificate or regulations</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Emergency Items</p>
                    <p>Safety equipment required for intended flight</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Walk-Around Guide */}
          <Card className="border-sky-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Image className="w-6 h-6 text-sky-600" />
                </div>
                <CardTitle className="text-sky-800">Visual Walk-Around Inspection Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-sky-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-sky-800">Aircraft Inspection Diagrams</p>
                    <p className="text-sm text-gray-600">Visual guide showing inspection points and techniques</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Step-by-step visual guide showing inspection sequence, critical checkpoints, and common defect locations
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}