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
  Wrench
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function SheetMetalStation() {
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
    title: "Sheet Metal Work & Repairs",
    category: "Airframe",
    description: "Master sheet metal repair techniques, riveting procedures, and structural metalwork for aircraft maintenance.",
    estimatedTime: "75-90 minutes",
    difficulty: "Advanced",
    topics: [
      "Metal Forming",
      "Riveting Procedures", 
      "Damage Assessment",
      "Repair Techniques",
      "Tool Usage"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Hammer className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-orange-100 text-xs">
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
          
          {/* Metal Forming Techniques */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Hammer className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Metal Forming Techniques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Basic Forming Operations */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Basic Forming Operations</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Straight Line Bends</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Use brake or bending block</li>
                        <li>• Account for spring-back</li>
                        <li>• Maintain consistent radius</li>
                        <li>• Check bend angle with protractor</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Curved Bends</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Use forming blocks or dies</li>
                        <li>• Work gradually to avoid kinking</li>
                        <li>• Support material throughout process</li>
                        <li>• Check contour with templates</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Flanging</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Create flanges for reinforcement</li>
                        <li>• Use proper relief cuts</li>
                        <li>• Maintain flange height consistency</li>
                        <li>• File smooth edges after forming</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Stretching & Shrinking</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Stretch to form convex curves</li>
                        <li>• Shrink for concave curves</li>
                        <li>• Use specialized hammers and blocks</li>
                        <li>• Work in small increments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Properties */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Aircraft Sheet Metal Materials</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border p-2 text-left">Material</th>
                        <th className="border p-2 text-left">Alloy</th>
                        <th className="border p-2 text-left">Characteristics</th>
                        <th className="border p-2 text-left">Common Uses</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Aluminum</td>
                        <td className="border p-2">2024-T3</td>
                        <td className="border p-2">High strength, heat treatable</td>
                        <td className="border p-2">Structural components</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Aluminum</td>
                        <td className="border p-2">6061-T6</td>
                        <td className="border p-2">Good formability, welding</td>
                        <td className="border p-2">Fittings, brackets</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Steel</td>
                        <td className="border p-2">4130</td>
                        <td className="border p-2">High strength, weldable</td>
                        <td className="border p-2">Engine mounts, landing gear</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safety Precautions */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Metal Forming Safety
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Sharp Edges</p>
                    <p>Always deburr and file sharp edges to prevent cuts</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Eye Protection</p>
                    <p>Wear safety glasses when cutting, drilling, or filing</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Tool Security</p>
                    <p>Ensure workpiece is properly clamped before forming</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Riveting Procedures */}
          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Riveting Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Rivet Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">Solid Rivets</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Round Head (AN470)</p>
                      <p className="text-sm text-gray-700">Standard structural rivet for most applications</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Countersunk (AN426)</p>
                      <p className="text-sm text-gray-700">Flush rivet for smooth external surfaces</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Flat Head (AN442)</p>
                      <p className="text-sm text-gray-700">Used where clearance is limited</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Blind Rivets</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Pop Rivets</p>
                      <p className="text-sm text-gray-700">Single-sided installation, non-structural</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Cherry Rivets</p>
                      <p className="text-sm text-gray-700">Structural blind rivet for limited access</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Monel Rivets</p>
                      <p className="text-sm text-gray-700">Corrosion resistant for harsh environments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Installation Process */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Solid Rivet Installation Process</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Hole Preparation</p>
                      <p className="text-sm text-gray-600">Drill hole to rivet diameter, deburr both sides</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Rivet Selection</p>
                      <p className="text-sm text-gray-600">Choose correct length and diameter for application</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Installation</p>
                      <p className="text-sm text-gray-600">Insert rivet, use gun and bucking bar to form head</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Inspection</p>
                      <p className="text-sm text-gray-600">Check head formation and ensure proper shop head</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Damage Assessment & Repair */}
          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Damage Assessment & Repair</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Damage Types */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Common Sheet Metal Damage</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Dents</p>
                    <p>Localized deformation without cracking or tearing</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Scratches</p>
                    <p>Surface damage that may or may not require repair</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Cracks</p>
                    <p>Stress-induced fractures requiring immediate attention</p>
                  </div>
                </div>
              </div>

              {/* Repair Methods */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Repair Methods</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-orange-100">
                    <p className="font-medium">Patch Repairs</p>
                    <p className="text-sm text-gray-700">Overlapping patches for larger damaged areas with proper edge distance</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-100">
                    <p className="font-medium">Insert Repairs</p>
                    <p className="text-sm text-gray-700">Flush repairs using butt joints for smooth aerodynamic surfaces</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tool Reference */}
          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Image className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-800">Sheet Metal Tool Reference</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-orange-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-orange-800">Sheet Metal Tool Guide</p>
                    <p className="text-sm text-gray-600">Comprehensive tool identification and usage guide</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Visual guide showing proper tool selection, forming techniques, and quality standards for aircraft sheet metal work
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}