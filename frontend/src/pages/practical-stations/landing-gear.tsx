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
  Cog,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Wrench
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function LandingGearStation() {
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
    title: "Landing Gear Systems",
    category: "Airframe",
    description: "Complete guide to landing gear inspection, maintenance, and troubleshooting procedures.",
    estimatedTime: "70-90 minutes",
    difficulty: "Advanced",
    topics: [
      "Gear Inspection",
      "Hydraulic Systems", 
      "Strut Maintenance",
      "Tire & Wheel Service",
      "System Troubleshooting"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Cog className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-indigo-100 text-xs">
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
          
          {/* Landing Gear Inspection */}
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-indigo-800">Landing Gear Inspection Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Inspection Checklist */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Pre-flight Inspection Checklist</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Main Gear Inspection</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check tire condition and pressure</li>
                        <li>• Inspect for hydraulic leaks</li>
                        <li>• Examine strut extension</li>
                        <li>• Verify gear door operation</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Nose Gear Inspection</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check steering mechanism</li>
                        <li>• Inspect shimmy damper</li>
                        <li>• Examine wheel alignment</li>
                        <li>• Verify centering cam</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Brake System</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Check brake disc condition</li>
                        <li>• Inspect brake lines for leaks</li>
                        <li>• Test brake pedal operation</li>
                        <li>• Verify anti-skid system</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Warning Systems</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Test gear position indicators</li>
                        <li>• Check warning horn operation</li>
                        <li>• Verify squat switch function</li>
                        <li>• Test gear door warning lights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Safety Points */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Safety Points
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Hydraulic Pressure</p>
                    <p>Always release hydraulic pressure before maintenance work</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Safety Pins</p>
                    <p>Install gear pins before working under aircraft</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Jack Points</p>
                    <p>Use only approved aircraft jack points and procedures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hydraulic System Maintenance */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Settings className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-indigo-800">Hydraulic System Maintenance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* System Components */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">System Components</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Hydraulic Pump</p>
                      <p className="text-sm text-gray-700">Engine-driven or electric pump providing system pressure</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Accumulator</p>
                      <p className="text-sm text-gray-700">Stores pressurized fluid for emergency operation</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Selector Valve</p>
                      <p className="text-sm text-gray-700">Controls flow direction for gear operation</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Actuating Cylinders</p>
                      <p className="text-sm text-gray-700">Convert hydraulic pressure to mechanical motion</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Maintenance Procedures</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Fluid Level Check</p>
                        <p className="text-sm">Check reservoir with gear retracted and system pressure off</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Leak Inspection</p>
                        <p className="text-sm">Check all fittings, lines, and actuators for external leakage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Pressure Test</p>
                        <p className="text-sm">Test system pressure per manufacturer specifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <p className="font-medium">Filter Service</p>
                        <p className="text-sm">Replace filters per maintenance schedule or pressure differential</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Guide */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Common Issues & Solutions</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border p-2 text-left">Problem</th>
                        <th className="border p-2 text-left">Possible Cause</th>
                        <th className="border p-2 text-left">Solution</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Slow gear retraction</td>
                        <td className="border p-2">Low fluid level</td>
                        <td className="border p-2">Check and refill reservoir</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Gear won't extend</td>
                        <td className="border p-2">Pump failure</td>
                        <td className="border p-2">Use manual extension procedure</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Gear door malfunction</td>
                        <td className="border p-2">Sequence valve issue</td>
                        <td className="border p-2">Check valve operation and timing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tire and Wheel Service */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-indigo-800">Tire & Wheel Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Service Procedures */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-700 mb-3">Tire Service Procedures</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h6 className="font-medium text-purple-600">Tire Pressure</h6>
                    <ul className="text-sm space-y-1">
                      <li>• Check pressure when tires are cool</li>
                      <li>• Use calibrated pressure gauges</li>
                      <li>• Follow manufacturer specifications</li>
                      <li>• Account for temperature variations</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h6 className="font-medium text-purple-600">Tire Inspection</h6>
                    <ul className="text-sm space-y-1">
                      <li>• Check tread depth and wear patterns</li>
                      <li>• Inspect sidewalls for cracks or bulges</li>
                      <li>• Look for foreign object damage</li>
                      <li>• Examine bead area for proper seating</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Wheel Maintenance */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Wheel Assembly Maintenance</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Bearing Service</p>
                    <p>Clean, inspect, and repack wheel bearings per schedule</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Bolt Torque</p>
                    <p>Verify wheel bolt torque to specification using proper pattern</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Balance Check</p>
                    <p>Check wheel/tire assembly balance if vibration occurs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Diagrams */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Image className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-indigo-800">Landing Gear System Diagrams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-indigo-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-indigo-800">Landing Gear System Schematics</p>
                    <p className="text-sm text-gray-600">Hydraulic system diagrams and component layouts</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive system diagrams showing hydraulic flow, electrical connections, and mechanical linkages for landing gear operation
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}