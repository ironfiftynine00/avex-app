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
  RotateCw,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Activity
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function PropellerStation() {
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
    title: "Propeller",
    category: "Powerplant",
    description: "Complete reference for propeller maintenance, inspection, and repair procedures.",
    estimatedTime: "80-100 minutes",
    difficulty: "Advanced",
    topics: [
      "Blade Inspection",
      "Hub Maintenance", 
      "Balance Procedures",
      "Pitch Adjustments",
      "Troubleshooting"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <RotateCw className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-100 text-xs">
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
          
          {/* Propeller Blade Inspection */}
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800">Propeller Blade Inspection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Inspection Areas */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Critical Inspection Areas</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Leading Edge</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check for nicks, cuts, and erosion</li>
                        <li>• Inspect for impact damage</li>
                        <li>• Look for corrosion or pitting</li>
                        <li>• Verify leading edge protection</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Blade Surface</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Examine for cracks or stress lines</li>
                        <li>• Check paint condition</li>
                        <li>• Look for oil canning (metal props)</li>
                        <li>• Inspect for delamination (composite)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Blade Root/Hub</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Inspect attachment bolts/clamps</li>
                        <li>• Check for fretting or wear</li>
                        <li>• Examine grease seals</li>
                        <li>• Verify blade retention</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Blade Tip</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check for damage or wear</li>
                        <li>• Inspect tip weights (if installed)</li>
                        <li>• Verify tip cap security</li>
                        <li>• Look for vibration damage</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Damage Assessment */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Damage Assessment Criteria
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Minor Damage</p>
                    <p>Small nicks less than 0.1" deep, surface scratches, minor paint damage</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Major Damage</p>
                    <p>Deep cuts greater than 0.1", cracks, bent blades, hub damage</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Immediate Grounding</p>
                    <p>Through cracks, blade separation, hub failure</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hub Maintenance & Overhaul */}
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Settings className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800">Hub Maintenance & Overhaul</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Hub Components */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">Fixed Pitch Hub</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Hub Assembly</p>
                      <p className="text-sm text-gray-700">Simple one-piece or multi-piece construction</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Blade Attachment</p>
                      <p className="text-sm text-gray-700">Bolted or bonded blade-to-hub connection</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Maintenance</p>
                      <p className="text-sm text-gray-700">Regular inspection of bolts and attachment points</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Constant Speed Hub</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Governor System</p>
                      <p className="text-sm text-gray-700">Oil pressure control for blade angle changes</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Pitch Change Mechanism</p>
                      <p className="text-sm text-gray-700">Hydraulic actuator and feedback system</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Complex Maintenance</p>
                      <p className="text-sm text-gray-700">Specialized overhaul procedures and equipment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overhaul Procedures */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">General Overhaul Steps</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Disassembly</p>
                      <p className="text-sm text-gray-600">Careful removal of components following manufacturer procedures</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Inspection</p>
                      <p className="text-sm text-gray-600">Detailed examination of all components for wear and damage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Component Service</p>
                      <p className="text-sm text-gray-600">Repair, replacement, or refurbishment as required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Reassembly & Test</p>
                      <p className="text-sm text-gray-600">Careful reassembly with functional testing and balancing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Propeller Balancing */}
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800">Propeller Balancing Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Balance Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-700 mb-3">Static Balance</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Eliminate propeller tendency to rotate due to weight distribution</p>
                    <p><strong>Method:</strong> Mount on knife edges or precision bearing setup</p>
                    <p><strong>Tolerance:</strong> Heavy spot should not exceed 1/4 turn from any position</p>
                    <p><strong>Correction:</strong> Add/remove weight from blade tips or hub</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Dynamic Balance</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Eliminate vibration during rotation</p>
                    <p><strong>Method:</strong> Vibration analysis during engine operation</p>
                    <p><strong>Equipment:</strong> Vibration analyzer and phase reference</p>
                    <p><strong>Correction:</strong> Calculated weight addition/removal based on vibration data</p>
                  </div>
                </div>
              </div>

              {/* Balance Procedure */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Dynamic Balance Process</h5>
                <div className="grid md:grid-cols-4 gap-3 text-xs">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
                    <strong>Initial Run</strong><br/>
                    Record baseline vibration
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
                    <strong>Trial Weight</strong><br/>
                    Add known weight at reference position
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
                    <strong>Second Run</strong><br/>
                    Record vibration with trial weight
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">4</div>
                    <strong>Calculate</strong><br/>
                    Determine correction weight and position
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Diagrams */}
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Image className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800">Propeller System Diagrams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-amber-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-amber-800">Propeller System Schematics</p>
                    <p className="text-sm text-gray-600">Component diagrams and control system layouts</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Detailed diagrams showing propeller hub construction, pitch change mechanisms, and governor control systems
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}