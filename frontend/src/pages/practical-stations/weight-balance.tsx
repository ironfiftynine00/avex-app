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
  Scale,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Calculator
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function WeightBalanceStation() {
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
    title: "Weight & Balance",
    category: "General",
    description: "Master aircraft weight and balance calculations, center of gravity determinations, and loading procedures.",
    estimatedTime: "60-75 minutes",
    difficulty: "Advanced",
    topics: [
      "Weight Theory",
      "CG Calculations", 
      "Loading Charts",
      "Equipment Lists",
      "Moment Calculations"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Scale className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-100 text-xs">
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
          
          {/* Weight & Balance Theory */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Scale className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Weight & Balance Fundamentals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Basic Concepts */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Fundamental Concepts</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Center of Gravity (CG)</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Point where aircraft would balance if suspended</li>
                        <li>• Critical for aircraft stability and control</li>
                        <li>• Must remain within approved limits</li>
                        <li>• Changes with loading configuration</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Datum Line</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Reference point for all measurements</li>
                        <li>• Usually forward of the aircraft nose</li>
                        <li>• Provides consistent measurement system</li>
                        <li>• Arms measured from this point</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Arm</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Distance from datum to item's CG</li>
                        <li>• Measured in inches (positive aft of datum)</li>
                        <li>• Used to calculate moments</li>
                        <li>• Critical for balance calculations</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Moment</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Weight × Arm = Moment</li>
                        <li>• Expressed in inch-pounds</li>
                        <li>• Indicates turning tendency about CG</li>
                        <li>• Sum of moments determines final CG</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Categories */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Aircraft Weight Categories</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Empty Weight</p>
                    <p>Aircraft with fixed equipment, unusable fuel, and required fluids</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Useful Load</p>
                    <p>Maximum weight of crew, passengers, baggage, and usable fuel</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Gross Weight</p>
                    <p>Maximum allowable weight for takeoff (Empty + Useful Load)</p>
                  </div>
                </div>
              </div>

              {/* Critical Limits */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Operating Limits
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-red-100">
                    <p className="font-medium text-red-700">Forward CG Limit</p>
                    <p className="text-sm text-gray-700">May cause difficulty in raising nose during takeoff and flare</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-100">
                    <p className="font-medium text-red-700">Aft CG Limit</p>
                    <p className="text-sm text-gray-700">May cause unstable flight characteristics and difficulty recovering from stalls</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Methods */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Weight & Balance Calculations</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Basic Calculation Formula */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Basic Calculation Formula</h5>
                <div className="bg-white p-4 rounded border text-center">
                  <div className="text-lg font-mono font-bold text-blue-600 mb-2">
                    CG = Total Moments ÷ Total Weight
                  </div>
                  <div className="text-sm text-gray-600">
                    Where: Moment = Weight × Arm
                  </div>
                </div>
              </div>

              {/* Sample Calculation */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Sample Weight & Balance Calculation</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border p-2 text-left">Item</th>
                        <th className="border p-2 text-left">Weight (lbs)</th>
                        <th className="border p-2 text-left">Arm (in)</th>
                        <th className="border p-2 text-left">Moment (in-lbs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Empty Aircraft</td>
                        <td className="border p-2">1,850</td>
                        <td className="border p-2">80.0</td>
                        <td className="border p-2">148,000</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="border p-2">Pilot + Front Passenger</td>
                        <td className="border p-2">340</td>
                        <td className="border p-2">85.5</td>
                        <td className="border p-2">29,070</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Rear Passengers</td>
                        <td className="border p-2">300</td>
                        <td className="border p-2">118.1</td>
                        <td className="border p-2">35,430</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="border p-2">Baggage</td>
                        <td className="border p-2">50</td>
                        <td className="border p-2">142.8</td>
                        <td className="border p-2">7,140</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Fuel (48 gal)</td>
                        <td className="border p-2">288</td>
                        <td className="border p-2">75.0</td>
                        <td className="border p-2">21,600</td>
                      </tr>
                      <tr className="bg-blue-100 font-bold">
                        <td className="border p-2">TOTALS</td>
                        <td className="border p-2">2,828</td>
                        <td className="border p-2">—</td>
                        <td className="border p-2">241,240</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                  <p className="font-medium text-blue-700">CG Calculation: 241,240 ÷ 2,828 = 85.3 inches</p>
                  <p className="text-sm text-gray-700">Result must be within CG limits (typically 78" to 90" for this aircraft type)</p>
                </div>
              </div>

              {/* CG Movement */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Understanding CG Movement</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-green-100">
                    <p className="font-medium">Adding Weight Forward</p>
                    <p className="text-sm text-gray-700">Moves CG forward (smaller CG value)</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-green-100">
                    <p className="font-medium">Adding Weight Aft</p>
                    <p className="text-sm text-gray-700">Moves CG aft (larger CG value)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading Charts & Procedures */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Loading Charts & Procedures</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Chart Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-700 mb-3">Loading Envelope Chart</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Visual representation of acceptable weight and CG combinations</p>
                    <p><strong>Usage:</strong> Plot calculated weight and CG to verify within limits</p>
                    <p><strong>Boundaries:</strong> Forward/aft CG limits and maximum weights at various CG positions</p>
                    <p><strong>Safety:</strong> Must remain within envelope for all phases of flight</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Moment Index Charts</h5>
                  <div className="space-y-2 text-sm">
                    <p><strong>Purpose:</strong> Simplified calculation using moment indexes instead of actual moments</p>
                    <p><strong>Method:</strong> Use charts to find moment index for each weight and station</p>
                    <p><strong>Advantage:</strong> Eliminates large numbers and reduces calculation errors</p>
                    <p><strong>Result:</strong> Sum moment indexes and divide by total weight for CG index</p>
                  </div>
                </div>
              </div>

              {/* Loading Procedure */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-700 mb-3">Systematic Loading Procedure</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Start with Empty Weight</p>
                      <p className="text-sm">Use current empty weight and CG from aircraft records</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Add Fixed Items</p>
                      <p className="text-sm">Include required equipment, oil, and unusable fuel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Plan Loading Strategy</p>
                      <p className="text-sm">Consider fuel consumption effects on CG during flight</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Verify Final Configuration</p>
                      <p className="text-sm">Check that takeoff, cruise, and landing weights are within limits</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight & Balance Charts */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Image className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Weight & Balance Chart Reference</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-green-800">Weight & Balance Charts</p>
                    <p className="text-sm text-gray-600">Loading envelopes and calculation aids</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive charts showing loading envelopes, moment arms, and calculation worksheets for various aircraft types
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}