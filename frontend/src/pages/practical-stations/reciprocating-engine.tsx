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
  Gauge,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Wrench
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function ReciprocatingEngineStation() {
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
    title: "Reciprocating Engine",
    category: "Powerplant",
    description: "Detailed guide to reciprocating engine maintenance, troubleshooting, and repair procedures.",
    estimatedTime: "100-120 minutes",
    difficulty: "Advanced",
    topics: [
      "Compression Testing",
      "Valve Adjustment", 
      "Engine Timing",
      "Fuel System",
      "Troubleshooting"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
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
                    <div className="flex items-center gap-1 text-emerald-100 text-xs">
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
          
          {/* Compression Testing */}
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Gauge className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Compression Testing Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Testing Equipment */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Required Equipment</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Compression Tester</p>
                    <p>Calibrated gauge with appropriate fittings for aircraft engines</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Adapter Fittings</p>
                    <p>Correct spark plug hole adapters for engine type</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Propeller Restraint</p>
                    <p>Proper device to prevent propeller rotation during test</p>
                  </div>
                </div>
              </div>

              {/* Testing Procedure */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Step-by-Step Procedure</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Engine Preparation</p>
                      <p className="text-sm">Warm engine to operating temperature, then shut down and remove spark plugs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Install Test Equipment</p>
                      <p className="text-sm">Connect compression tester to first cylinder, ensure proper sealing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Position Cylinder</p>
                      <p className="text-sm">Rotate engine to place test cylinder at top dead center compression stroke</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Apply Pressure & Read</p>
                      <p className="text-sm">Apply shop air (80 PSI) and record gauge reading after stabilization</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acceptable Readings */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Compression Standards</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border p-2 text-left">Condition</th>
                        <th className="border p-2 text-left">Pressure Reading</th>
                        <th className="border p-2 text-left">Action Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Excellent</td>
                        <td className="border p-2">75-80 PSI</td>
                        <td className="border p-2">Continue operation</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Good</td>
                        <td className="border p-2">65-74 PSI</td>
                        <td className="border p-2">Monitor closely</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Marginal</td>
                        <td className="border p-2">60-64 PSI</td>
                        <td className="border p-2">Investigation required</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Poor</td>
                        <td className="border p-2">Below 60 PSI</td>
                        <td className="border p-2">Maintenance action required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valve Adjustment */}
          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Valve Adjustment Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Valve Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Intake Valves</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Function:</strong> Control air/fuel mixture entry into cylinder</p>
                    <p><strong>Material:</strong> Typically steel, may have sodium-filled stems</p>
                    <p><strong>Common Issues:</strong> Carbon buildup, seat wear, stem wear</p>
                    <p><strong>Inspection:</strong> Check face condition, stem wear, and spring tension</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Exhaust Valves</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Function:</strong> Control exhaust gas exit from cylinder</p>
                    <p><strong>Material:</strong> Heat-resistant alloys, often sodium-cooled</p>
                    <p><strong>Common Issues:</strong> Heat damage, warping, seat burning</p>
                    <p><strong>Inspection:</strong> Check for warping, cracking, and seat condition</p>
                  </div>
                </div>
              </div>

              {/* Clearance Specifications */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Typical Valve Clearances (Cold Engine)</h5>
                <div className="grid md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <strong>Lycoming</strong><br/>
                    Intake: 0.006-0.010"<br/>
                    Exhaust: 0.016-0.020"
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <strong>Continental</strong><br/>
                    Intake: 0.008-0.012"<br/>
                    Exhaust: 0.018-0.022"
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <strong>Rotax</strong><br/>
                    Intake: 0.004-0.006"<br/>
                    Exhaust: 0.004-0.006"
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <strong>Note</strong><br/>
                    Always check<br/>
                    manufacturer specs
                  </div>
                </div>
              </div>

              {/* Adjustment Procedure */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Adjustment Points
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>Piston Position:</strong> Adjust only with piston at TDC compression stroke</p>
                    <p><strong>Engine Temperature:</strong> Always adjust on cold engine for accuracy</p>
                    <p><strong>Tool Requirements:</strong> Use proper feeler gauges and adjustment tools</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Sequence:</strong> Follow manufacturer's cylinder firing order</p>
                    <p><strong>Double Check:</strong> Verify all adjustments before reassembly</p>
                    <p><strong>Documentation:</strong> Record all clearances in maintenance logs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engine Timing & Ignition */}
          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Engine Timing & Ignition</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Ignition System Components */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Ignition System Components</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Magnetos</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Self-contained ignition units</li>
                        <li>• Independent of aircraft electrical system</li>
                        <li>• Dual magneto system for redundancy</li>
                        <li>• Requires proper timing to engine</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Spark Plugs</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Two plugs per cylinder</li>
                        <li>• Different heat ranges available</li>
                        <li>• Massive or fine wire electrodes</li>
                        <li>• Regular inspection and cleaning required</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing Procedures */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Ignition Timing Procedure</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Find TDC</p>
                      <p className="text-sm">Locate top dead center for #1 cylinder using timing marks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Set Timing Position</p>
                      <p className="text-sm">Rotate engine to specified BTDC position (typically 20-25°)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Adjust Magneto</p>
                      <p className="text-sm">Time magneto to fire exactly at specified engine position</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Verify Timing</p>
                      <p className="text-sm">Check timing with timing light during engine operation</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Diagrams */}
          <Card className="border-emerald-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Image className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Engine System Diagrams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-emerald-800">Reciprocating Engine Schematics</p>
                    <p className="text-sm text-gray-600">System diagrams and component relationships</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive diagrams showing engine systems, ignition timing, fuel flow, and maintenance access points
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}