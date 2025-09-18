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
  Paintbrush,
  AlertTriangle,
  FileText,
  Video,
  Image,
  Shield,
  Droplets
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function PaintingCorrosionStation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

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
    title: "Airframe Painting and Corrosion Identification",
    category: "Airframe",
    description: "Comprehensive guide to aircraft painting procedures, corrosion detection, and prevention techniques.",
    estimatedTime: "60-80 minutes",
    difficulty: "Intermediate",
    topics: [
      "Surface Preparation",
      "Paint Application", 
      "Corrosion Types",
      "Prevention Methods",
      "Inspection Techniques"
    ]
  };

  const studyMaterials = [
    {
      id: "surface-prep",
      title: "Surface Preparation",
      type: "document",
      icon: Shield,
      description: "Proper surface preparation techniques for aircraft painting applications"
    },
    {
      id: "paint-application",
      title: "Paint Application Procedures",
      type: "document", 
      icon: Paintbrush,
      description: "Step-by-step painting procedures and spray techniques"
    },
    {
      id: "corrosion-identification",
      title: "Corrosion Identification",
      type: "document",
      icon: AlertTriangle,
      description: "Visual identification of different types of aircraft corrosion"
    },
    {
      id: "prevention-methods",
      title: "Corrosion Prevention",
      type: "document",
      icon: CheckCircle,
      description: "Effective corrosion prevention techniques and protective coatings"
    },
    {
      id: "inspection-guide",
      title: "Corrosion Inspection Guide",
      type: "infographic",
      icon: Image,
      description: "Visual guide for systematic corrosion inspection procedures"
    },
    {
      id: "demonstration",
      title: "Painting & Treatment Demonstrations",
      type: "video",
      icon: Video,
      description: "Live demonstrations of painting techniques and corrosion treatment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Paintbrush className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-pink-100 text-xs">
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
          
          {/* Surface Preparation */}
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Paintbrush className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-pink-800">Surface Preparation Techniques</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Preparation Steps */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Essential Preparation Steps</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Surface Cleaning</p>
                        <p className="text-sm">Remove all dirt, grease, oils, and existing loose paint using appropriate solvents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Corrosion Removal</p>
                        <p className="text-sm">Sand or chemically treat corroded areas down to bare metal</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Surface Abrading</p>
                        <p className="text-sm">Create proper surface texture for paint adhesion using appropriate grit sandpaper</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <div>
                        <p className="font-medium">Final Cleaning</p>
                        <p className="text-sm">Remove all sanding dust and contaminants with tack cloth</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Types */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h6 className="font-semibold text-green-700 mb-2">Aluminum Surfaces</h6>
                  <ul className="text-sm space-y-1">
                    <li>• Use aluminum-safe cleaners</li>
                    <li>• Apply conversion coating</li>
                    <li>• Use primer within 4 hours</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h6 className="font-semibold text-yellow-700 mb-2">Steel Surfaces</h6>
                  <ul className="text-sm space-y-1">
                    <li>• Remove all rust completely</li>
                    <li>• Apply primer immediately</li>
                    <li>• Use corrosion inhibitors</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h6 className="font-semibold text-purple-700 mb-2">Composite Surfaces</h6>
                  <ul className="text-sm space-y-1">
                    <li>• Light sanding only</li>
                    <li>• Use appropriate primers</li>
                    <li>• Avoid aggressive chemicals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Corrosion Control */}
          <Card className="border-pink-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-pink-800">Corrosion Prevention & Control</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Types of Corrosion */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3">Types of Aircraft Corrosion</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Uniform Surface Corrosion</p>
                      <p className="text-sm text-gray-700">Even corrosion across metal surface, typically from environmental exposure</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Pitting Corrosion</p>
                      <p className="text-sm text-gray-700">Localized deep holes in metal, often caused by chloride contamination</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Galvanic Corrosion</p>
                      <p className="text-sm text-gray-700">Occurs when dissimilar metals are in contact with electrolyte</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-100">
                      <p className="font-medium text-red-700">Stress Corrosion</p>
                      <p className="text-sm text-gray-700">Combination of tensile stress and corrosive environment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prevention Methods */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Prevention Methods</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Protective Coatings</p>
                    <p>Primers, paints, and sealants that barrier moisture and contaminants</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Proper Drainage</p>
                    <p>Design and maintain drainage to prevent water accumulation</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Regular Inspection</p>
                    <p>Frequent inspection and early detection of corrosion initiation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paint Systems */}
          <Card className="border-pink-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Droplets className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-pink-800">Aircraft Paint Systems</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Paint System Layers */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Complete Paint System Layers</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-gray-800 rounded"></div>
                    <div>
                      <p className="font-medium">Base Metal</p>
                      <p className="text-sm text-gray-600">Clean, properly prepared substrate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-yellow-500 rounded"></div>
                    <div>
                      <p className="font-medium">Primer</p>
                      <p className="text-sm text-gray-600">Corrosion protection and paint adhesion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-blue-500 rounded"></div>
                    <div>
                      <p className="font-medium">Base Color</p>
                      <p className="text-sm text-gray-600">Primary color coat providing coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 bg-transparent border-2 border-gray-400 rounded"></div>
                    <div>
                      <p className="font-medium">Clear Coat (Optional)</p>
                      <p className="text-sm text-gray-600">UV protection and gloss finish</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paint Types */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-700 mb-3">Primer Types</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="font-medium">Wash Primer</p>
                      <p className="text-sm text-gray-700">Acid-etch primer for aluminum surfaces</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="font-medium">Zinc Chromate</p>
                      <p className="text-sm text-gray-700">Traditional corrosion-inhibiting primer</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="font-medium">Epoxy Primer</p>
                      <p className="text-sm text-gray-700">Two-part primer with excellent adhesion</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Topcoat Types</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Acrylic Lacquer</p>
                      <p className="text-sm text-gray-700">Fast-drying, easy to repair and touch up</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Polyurethane</p>
                      <p className="text-sm text-gray-700">Durable, chemical-resistant finish</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Acrylic Enamel</p>
                      <p className="text-sm text-gray-700">Good durability and color retention</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Content Viewer */}
        {selectedContent && (
          <Card className="mt-8 border-pink-200 bg-pink-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-pink-700">
                {studyMaterials.find(m => m.id === selectedContent)?.title}
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedContent(null)}
                size="sm"
              >
                Close
              </Button>
            </CardHeader>
            <CardContent>
              {selectedContent === 'surface-prep' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Surface Preparation</h4>
                    
                    <div className="space-y-6">
                      <div className="border-l-4 border-pink-400 pl-4">
                        <h5 className="font-semibold text-pink-700 mb-3">1. Cleaning Procedures</h5>
                        <div className="space-y-2 text-sm">
                          <p><strong>Degreasing:</strong> Remove oils, grease, and contaminants with approved solvents</p>
                          <p><strong>Washing:</strong> Clean with appropriate detergent and rinse thoroughly</p>
                          <p><strong>Drying:</strong> Allow complete drying or use compressed air</p>
                          <p className="text-pink-600"><strong>Note:</strong> Use only approved cleaning agents per aircraft manufacturer</p>
                        </div>
                      </div>

                      <div className="border-l-4 border-blue-400 pl-4">
                        <h5 className="font-semibold text-blue-700 mb-3">2. Surface Preparation Methods</h5>
                        <div className="space-y-2 text-sm">
                          <p><strong>Mechanical Abrasion:</strong> Sanding with appropriate grit (320-400 for primers)</p>
                          <p><strong>Chemical Etching:</strong> Use etching primers for aluminum surfaces</p>
                          <p><strong>Blast Cleaning:</strong> Media blasting for heavy corrosion removal</p>
                          <p className="text-blue-600"><strong>Important:</strong> Follow manufacturer's surface preparation requirements</p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h5 className="font-semibold text-yellow-700 mb-3">⚠️ Critical Preparation Steps</h5>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Temperature & Humidity Control</p>
                              <p className="text-sm">Maintain proper environmental conditions during preparation</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Contamination Prevention</p>
                              <p className="text-sm">Protect prepared surfaces from contamination before coating</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Time Limits</p>
                              <p className="text-sm">Apply primer within specified time limits after preparation</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'paint-application' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Paint Application Procedures</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-3">🎨 Spray Gun Setup</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium text-blue-600 mb-2">Gun Settings:</h6>
                            <ul className="text-sm space-y-1">
                              <li>• Air pressure: 25-30 PSI at gun</li>
                              <li>• Fluid needle: Properly adjusted</li>
                              <li>• Fan pattern: 6-8 inches wide</li>
                              <li>• Gun distance: 6-10 inches from surface</li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-blue-600 mb-2">Material Preparation:</h6>
                            <ul className="text-sm space-y-1">
                              <li>• Strain paint through proper filter</li>
                              <li>• Mix according to specifications</li>
                              <li>• Check viscosity with flow cup</li>
                              <li>• Maintain proper pot life</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <h5 className="font-semibold text-green-700 mb-3">Application Technique</h5>
                        <div className="space-y-2 text-sm">
                          <p><strong>Spray Pattern:</strong> Maintain consistent overlap (50% minimum)</p>
                          <p><strong>Movement:</strong> Keep gun perpendicular and maintain steady speed</p>
                          <p><strong>Coverage:</strong> Apply thin, even coats rather than thick single coat</p>
                          <p className="text-green-600"><strong>Tip:</strong> Practice spray technique on test panel first</p>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-3">📋 Coating System</h5>
                        <div className="space-y-4">
                          <div className="border-l-4 border-orange-400 pl-4">
                            <h6 className="font-medium text-orange-700">Primer Application</h6>
                            <p className="text-sm text-orange-600">Apply corrosion-inhibiting primer in thin, even coats</p>
                          </div>
                          <div className="border-l-4 border-orange-400 pl-4">
                            <h6 className="font-medium text-orange-700">Base Coat</h6>
                            <p className="text-sm text-orange-600">Apply color coats with proper flash time between coats</p>
                          </div>
                          <div className="border-l-4 border-orange-400 pl-4">
                            <h6 className="font-medium text-orange-700">Top Coat</h6>
                            <p className="text-sm text-orange-600">Final protective coating for UV and environmental protection</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'corrosion-identification' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Corrosion Identification</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h5 className="font-semibold text-red-700 mb-3">🔍 Types of Corrosion</h5>
                        <div className="space-y-4">
                          <div className="border-l-4 border-red-400 pl-4">
                            <h6 className="font-medium text-red-700">Surface Corrosion</h6>
                            <p className="text-sm text-red-600">White powdery deposits on aluminum surfaces, easily removable</p>
                          </div>
                          <div className="border-l-4 border-red-400 pl-4">
                            <h6 className="font-medium text-red-700">Pitting Corrosion</h6>
                            <p className="text-sm text-red-600">Deep, localized attacks creating small holes in metal</p>
                          </div>
                          <div className="border-l-4 border-red-400 pl-4">
                            <h6 className="font-medium text-red-700">Intergranular Corrosion</h6>
                            <p className="text-sm text-red-600">Attacks grain boundaries, weakens metal structure</p>
                          </div>
                          <div className="border-l-4 border-red-400 pl-4">
                            <h6 className="font-medium text-red-700">Galvanic Corrosion</h6>
                            <p className="text-sm text-red-600">Occurs between dissimilar metals in electrolyte presence</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h5 className="font-semibold text-yellow-700 mb-3">⚠️ Common Corrosion Areas</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="font-medium text-yellow-600 mb-2">High-Risk Locations:</h6>
                            <ul className="text-sm space-y-1">
                              <li>• Battery compartments</li>
                              <li>• Exhaust areas</li>
                              <li>• Landing gear wells</li>
                              <li>• Wing root areas</li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-medium text-yellow-600 mb-2">Environmental Factors:</h6>
                            <ul className="text-sm space-y-1">
                              <li>• Salt air exposure</li>
                              <li>• High humidity</li>
                              <li>• Industrial pollution</li>
                              <li>• Temperature cycling</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-3">✅ Inspection Techniques</h5>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Visual Inspection</p>
                              <p className="text-sm text-green-600">Look for discoloration, pitting, or white powdery deposits</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Tap Testing</p>
                              <p className="text-sm text-green-600">Light tapping to detect structural integrity</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Borescope Inspection</p>
                              <p className="text-sm text-green-600">Internal inspection of inaccessible areas</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'prevention-methods' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Corrosion Prevention Methods</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-3">🛡️ Protective Coatings</h5>
                        <div className="space-y-4">
                          <div className="border-l-4 border-blue-400 pl-4">
                            <h6 className="font-medium text-blue-700">Conversion Coatings</h6>
                            <p className="text-sm text-blue-600">Alodine/chromate conversion for aluminum protection</p>
                          </div>
                          <div className="border-l-4 border-blue-400 pl-4">
                            <h6 className="font-medium text-blue-700">Primer Systems</h6>
                            <p className="text-sm text-blue-600">Corrosion-inhibiting primers containing chromates or zinc</p>
                          </div>
                          <div className="border-l-4 border-blue-400 pl-4">
                            <h6 className="font-medium text-blue-700">Topcoats</h6>
                            <p className="text-sm text-blue-600">Polyurethane or acrylic topcoats for UV and chemical protection</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-3">🔧 Preventive Maintenance</h5>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Regular Cleaning</p>
                              <p className="text-sm text-green-600">Remove salt, dirt, and contaminants regularly</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Drainage Maintenance</p>
                              <p className="text-sm text-green-600">Keep drain holes clear to prevent water accumulation</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Lubrication</p>
                              <p className="text-sm text-green-600">Apply corrosion preventive compounds to moving parts</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Touch-up Painting</p>
                              <p className="text-sm text-green-600">Repair paint damage promptly to prevent corrosion</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-700 mb-3">⚡ Cathodic Protection</h5>
                        <div className="space-y-2 text-sm">
                          <p><strong>Sacrificial Anodes:</strong> Zinc or magnesium anodes to protect steel structures</p>
                          <p><strong>Impressed Current:</strong> External power source for active protection systems</p>
                          <p><strong>Application:</strong> Used on fuel tanks and critical structural components</p>
                          <p className="text-purple-600"><strong>Note:</strong> Requires regular monitoring and maintenance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'inspection-guide' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Corrosion Inspection Guide</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-700 mb-3">📋 Inspection Checklist</h5>
                        <div className="bg-white p-6 rounded border-2 border-dashed border-gray-300">
                          <div className="text-center mb-4">
                            <h6 className="font-medium text-gray-800">Systematic Inspection Areas</h6>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="text-center p-3 bg-red-100 rounded">
                              <strong>CRITICAL AREAS</strong><br/>
                              Battery Compartment<br/>
                              Exhaust Areas<br/>
                              Landing Gear
                            </div>
                            <div className="text-center p-3 bg-yellow-100 rounded">
                              <strong>PRONE AREAS</strong><br/>
                              Wing Roots<br/>
                              Control Surfaces<br/>
                              Antenna Mounts
                            </div>
                            <div className="text-center p-3 bg-blue-100 rounded">
                              <strong>INSPECTION TOOLS</strong><br/>
                              Flashlight<br/>
                              Mirror<br/>
                              Borescope
                            </div>
                            <div className="text-center p-3 bg-green-100 rounded">
                              <strong>DOCUMENTATION</strong><br/>
                              Photo Evidence<br/>
                              Measurement<br/>
                              Location Notes
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-3">📸 Documentation Standards</h5>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Image className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Photographic Evidence</p>
                              <p className="text-sm text-orange-600">Take clear photos with proper lighting and scale reference</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Detailed Records</p>
                              <p className="text-sm text-orange-600">Document location, extent, and severity of corrosion</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Measurements</p>
                              <p className="text-sm text-orange-600">Record dimensions and depth of corrosion damage</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedContent === 'demonstration' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-pink-200">
                    <h4 className="text-lg font-semibold text-pink-800 mb-4">Painting & Treatment Demonstrations</h4>
                    
                    <div className="space-y-6">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-700 mb-3">🎥 Video Demonstrations</h5>
                        <div className="space-y-4">
                          <div className="border-l-4 border-purple-400 pl-4">
                            <h6 className="font-medium text-purple-700">Surface Preparation Techniques</h6>
                            <p className="text-sm text-purple-600">Complete surface prep process from cleaning to final preparation</p>
                          </div>
                          <div className="border-l-4 border-purple-400 pl-4">
                            <h6 className="font-medium text-purple-700">Spray Gun Operation</h6>
                            <p className="text-sm text-purple-600">Proper spray gun setup, adjustment, and painting technique</p>
                          </div>
                          <div className="border-l-4 border-purple-400 pl-4">
                            <h6 className="font-medium text-purple-700">Corrosion Treatment</h6>
                            <p className="text-sm text-purple-600">Step-by-step corrosion removal and treatment procedures</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-3">📝 Hands-On Exercises</h5>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Exercise 1: Corrosion Identification</p>
                              <p className="text-sm text-green-600">Practice identifying different types of corrosion on sample panels</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Exercise 2: Surface Preparation</p>
                              <p className="text-sm text-green-600">Practice proper cleaning and surface preparation techniques</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Exercise 3: Paint Application</p>
                              <p className="text-sm text-green-600">Practice spray painting technique on test panels</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}