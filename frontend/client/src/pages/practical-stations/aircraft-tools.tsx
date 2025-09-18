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
  Wrench,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function AircraftToolsStation() {
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
    title: "Aircraft Tools",
    category: "General",
    description: "Essential reference for proper tool usage, safety procedures, and specialized aircraft maintenance equipment.",
    estimatedTime: "30-45 minutes",
    difficulty: "Beginner",
    topics: [
      "Tool Safety",
      "Torque Procedures", 
      "Specialized Tools",
      "Tool Calibration",
      "Maintenance Best Practices"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wrench className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-cyan-100 text-xs">
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
          
          {/* Tool Safety & Procedures */}
          <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-cyan-800">Tool Safety & Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Critical Safety Rules */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Safety Rules
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Personal Protective Equipment (PPE)</p>
                      <p className="text-sm text-gray-700">Always wear appropriate safety glasses, gloves, and protective clothing when handling tools</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Tool Inspection</p>
                      <p className="text-sm text-gray-700">Inspect all tools before use for damage, wear, cracks, or defects that could cause failure</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Proper Storage</p>
                      <p className="text-sm text-gray-700">Store tools in designated areas, clean and properly organized to prevent damage</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Right Tool for Job</p>
                      <p className="text-sm text-gray-700">Use only the correct tool for each specific task - never improvise with inappropriate tools</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Handling Guidelines */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Proper Handling Guidelines</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Grip & Control</p>
                    <p>Maintain firm, secure grip. Use both hands when necessary for stability and control.</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Work Area</p>
                    <p>Keep work area clean, well-lit, and free from clutter and potential hazards.</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Body Position</p>
                    <p>Maintain stable stance and proper body mechanics to prevent injury.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Torque Procedures */}
          <Card className="border-cyan-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Settings className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-cyan-800">Torque Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Torque Specification Chart */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Standard Torque Specifications</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-cyan-100">
                        <th className="border p-2 text-left">Fastener Size</th>
                        <th className="border p-2 text-left">Material</th>
                        <th className="border p-2 text-left">Torque (ft-lbs)</th>
                        <th className="border p-2 text-left">Torque (Nm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">#6 Screw</td>
                        <td className="border p-2">Steel</td>
                        <td className="border p-2">0.7 - 1.2</td>
                        <td className="border p-2">0.9 - 1.6</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2">#8 Screw</td>
                        <td className="border p-2">Steel</td>
                        <td className="border p-2">1.5 - 2.5</td>
                        <td className="border p-2">2.0 - 3.4</td>
                      </tr>
                      <tr>
                        <td className="border p-2">#10 Screw</td>
                        <td className="border p-2">Steel</td>
                        <td className="border p-2">2.5 - 4.0</td>
                        <td className="border p-2">3.4 - 5.4</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2">1/4" Bolt</td>
                        <td className="border p-2">Steel</td>
                        <td className="border p-2">8 - 12</td>
                        <td className="border p-2">11 - 16</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Torque Application Steps */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Proper Torque Application Sequence</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Initial Alignment</p>
                        <p className="text-sm">Hand-tighten fasteners to ensure proper thread engagement and alignment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Sequence Pattern</p>
                        <p className="text-sm">Follow manufacturer's recommended tightening sequence (usually cross-pattern)</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Progressive Tightening</p>
                        <p className="text-sm">Apply torque in 2-3 progressive steps to final specification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <p className="font-medium">Final Verification</p>
                        <p className="text-sm">Verify final torque and document completion in maintenance records</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialized Tools */}
          <Card className="border-cyan-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-cyan-800">Specialized Aircraft Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Tool Categories */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Measuring Tools */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">Precision Measuring Tools</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Micrometers</p>
                      <p className="text-sm text-gray-700">For precise external, internal, and depth measurements (±0.001")</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Dial Indicators</p>
                      <p className="text-sm text-gray-700">For measuring runout, concentricity, and surface variations</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Feeler Gauges</p>
                      <p className="text-sm text-gray-700">For measuring small gaps and clearances in assemblies</p>
                    </div>
                  </div>
                </div>

                {/* Assembly Tools */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Assembly & Installation Tools</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Rivet Guns</p>
                      <p className="text-sm text-gray-700">Pneumatic tools for installing solid rivets in aircraft structures</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Bucking Bars</p>
                      <p className="text-sm text-gray-700">Used with rivet guns to form rivet heads during installation</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Cable Tensioners</p>
                      <p className="text-sm text-gray-700">For proper installation and tensioning of control cables</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Maintenance */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Tool Maintenance Requirements</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Daily Care</p>
                    <p>Clean tools after use, check for damage, proper storage in tool rooms</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Calibration</p>
                    <p>Precision tools require periodic calibration per manufacturer specifications</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Documentation</p>
                    <p>Maintain calibration records and tool service history per regulations</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tool Identification Guide */}
          <Card className="border-cyan-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Image className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-cyan-800">Visual Tool Identification Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-cyan-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-cyan-800">Aircraft Tool Identification Chart</p>
                    <p className="text-sm text-gray-600">Visual reference showing common aircraft maintenance tools</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive tool identification chart showing proper names, applications, and safety considerations for aircraft maintenance tools
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}