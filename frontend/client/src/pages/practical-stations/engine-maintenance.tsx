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
  Gauge
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function EngineMaintenanceStation() {
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
    title: "Engine Maintenance",
    category: "Powerplant",
    description: "Comprehensive guide to routine engine maintenance, servicing procedures, and preventive maintenance practices.",
    estimatedTime: "90-120 minutes",
    difficulty: "Advanced",
    topics: [
      "Oil Service",
      "Filter Changes", 
      "Component Inspection",
      "Maintenance Intervals",
      "Documentation"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
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
                    <div className="flex items-center gap-1 text-red-100 text-xs">
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
          
          {/* Engine Oil Service */}
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Gauge className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Engine Oil Service Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Oil Change Procedure */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Oil Change Procedure</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Warm Engine</p>
                      <p className="text-sm">Run engine to normal operating temperature for complete oil circulation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Drain Oil</p>
                      <p className="text-sm">Remove drain plug and allow complete oil drainage into proper container</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Replace Filter</p>
                      <p className="text-sm">Remove and inspect old filter, install new filter with proper torque</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Refill & Check</p>
                      <p className="text-sm">Add new oil to specified level, run engine, and check for leaks</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Oil Specifications */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Oil Specifications & Selection</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border p-2 text-left">Engine Type</th>
                        <th className="border p-2 text-left">Oil Grade</th>
                        <th className="border p-2 text-left">Capacity</th>
                        <th className="border p-2 text-left">Change Interval</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Lycoming O-320</td>
                        <td className="border p-2">15W-50 or 20W-50</td>
                        <td className="border p-2">8 Quarts</td>
                        <td className="border p-2">50 Hours</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border p-2">Continental O-200</td>
                        <td className="border p-2">15W-50</td>
                        <td className="border p-2">6 Quarts</td>
                        <td className="border p-2">50 Hours</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Rotax 912 ULS</td>
                        <td className="border p-2">15W-40</td>
                        <td className="border p-2">3.5 Liters</td>
                        <td className="border p-2">100 Hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safety Considerations */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Oil Service Safety
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Hot Oil Warning</p>
                    <p>Allow engine to cool slightly to prevent burns from hot oil</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Proper Disposal</p>
                    <p>Dispose of used oil and filters according to environmental regulations</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Fire Prevention</p>
                    <p>Keep fire extinguisher nearby and avoid ignition sources</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Maintenance */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Settings className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Filter Maintenance & Inspection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Filter Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-700 mb-3">Oil Filters</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Full-Flow Filters</p>
                      <p className="text-sm text-gray-700">All oil passes through filter before lubricating engine</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Bypass Filters</p>
                      <p className="text-sm text-gray-700">Filter portion of oil flow for extended cleaning</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-100">
                      <p className="font-medium">Screen Filters</p>
                      <p className="text-sm text-gray-700">Metal screen that can be cleaned and reused</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Air Filters</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Paper Element</p>
                      <p className="text-sm text-gray-700">Disposable paper filter for fine particle removal</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">Foam Element</p>
                      <p className="text-sm text-gray-700">Washable foam filter for dusty conditions</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="font-medium">K&N Style</p>
                      <p className="text-sm text-gray-700">Oiled gauze filter that can be cleaned and re-oiled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Inspection */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-700 mb-3">Filter Inspection Criteria</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Oil Filter</p>
                    <p>Cut open to check for metal particles, excessive contamination</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Air Filter</p>
                    <p>Check for dirt loading, damage, proper fit and seal</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Fuel Filter</p>
                    <p>Inspect for water, debris, and filter element condition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Intervals */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Maintenance Intervals & Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Routine Maintenance */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Routine Maintenance Tasks</h5>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h6 className="font-medium text-blue-700 mb-2">Daily/Pre-flight</h6>
                    <ul className="text-sm space-y-1">
                      <li>• Check oil level</li>
                      <li>• Visual inspection</li>
                      <li>• Fuel contamination check</li>
                      <li>• Control surface check</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h6 className="font-medium text-green-700 mb-2">50 Hour Inspection</h6>
                    <ul className="text-sm space-y-1">
                      <li>• Oil and filter change</li>
                      <li>• Spark plug inspection</li>
                      <li>• Compression check</li>
                      <li>• General lubrication</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h6 className="font-medium text-purple-700 mb-2">100 Hour Inspection</h6>
                    <ul className="text-sm space-y-1">
                      <li>• Detailed engine inspection</li>
                      <li>• Valve adjustment</li>
                      <li>• Ignition timing</li>
                      <li>• Component replacement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Record Keeping */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Maintenance Record Keeping</h5>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <p className="font-medium">Required Documentation</p>
                    <p className="text-sm text-gray-700">All maintenance must be recorded in aircraft and engine logbooks with proper signatures</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <p className="font-medium">Parts Traceability</p>
                    <p className="text-sm text-gray-700">Maintain records of parts used, including part numbers, serial numbers, and compliance</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-100">
                    <p className="font-medium">Service Intervals</p>
                    <p className="text-sm text-gray-700">Track time since last service and plan upcoming maintenance requirements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Diagrams */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Image className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-red-800">Engine Maintenance Diagrams</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-red-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-red-800">Engine Maintenance Reference</p>
                    <p className="text-sm text-gray-600">Service procedures and maintenance schedules</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive maintenance guides showing service access points, lubrication charts, and inspection procedures
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}