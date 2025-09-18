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
  FileCheck,
  Settings,
  FileText,
  Video,
  Image,
  AlertTriangle,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import TopNav from "@/components/navigation/top-nav";

export default function TechnicalPublicationsStation() {
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
    title: "Technical Publications",
    category: "General",
    description: "Navigate and interpret technical manuals, service bulletins, and maintenance documentation effectively.",
    estimatedTime: "40-50 minutes",
    difficulty: "Beginner",
    topics: [
      "Manual Navigation",
      "Service Bulletins", 
      "Parts Catalogs",
      "Airworthiness Directives",
      "Documentation Standards"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Station Header with Back Button */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight mb-1">{stationInfo.title}</h1>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                      {stationInfo.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-purple-100 text-xs">
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
          
          {/* Manual Navigation */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Technical Manual Navigation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Manual Structure */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Standard Manual Structure</h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Table of Contents</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Chapter and section organization</li>
                        <li>• Page number references</li>
                        <li>• Subject index location</li>
                        <li>• Appendix listings</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Section Numbering</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• ATA chapter system (23-XX-XX)</li>
                        <li>• Hierarchical organization</li>
                        <li>• Cross-reference systems</li>
                        <li>• Revision tracking numbers</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Index Systems</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Alphabetical subject index</li>
                        <li>• Numerical part number index</li>
                        <li>• Illustrated parts breakdown</li>
                        <li>• Service bulletin references</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <h6 className="font-medium text-blue-700">Revision Control</h6>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Revision date tracking</li>
                        <li>• Change bar identification</li>
                        <li>• Temporary revision system</li>
                        <li>• Effectivity information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tips */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-3">Efficient Navigation Tips</h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Use Bookmarks</p>
                    <p>Mark frequently referenced sections for quick access</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Follow Cross-References</p>
                    <p>Use manual's internal linking system for related information</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium">Check Effectivity</p>
                    <p>Verify procedures apply to your specific aircraft serial number</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Bulletins */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileCheck className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Service Bulletins & Notices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Types of Publications */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-semibold text-yellow-700 mb-3">Mandatory Publications</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-yellow-100">
                      <p className="font-medium">Airworthiness Directives (ADs)</p>
                      <p className="text-sm text-gray-700">FAA-mandated actions affecting aircraft safety</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-yellow-100">
                      <p className="font-medium">Mandatory Service Bulletins</p>
                      <p className="text-sm text-gray-700">Manufacturer-required modifications or inspections</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-yellow-100">
                      <p className="font-medium">Type Certificate Data Sheets</p>
                      <p className="text-sm text-gray-700">Official aircraft specifications and limitations</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-700 mb-3">Advisory Publications</h5>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Service Bulletins</p>
                      <p className="text-sm text-gray-700">Recommended improvements or modifications</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Service Letters</p>
                      <p className="text-sm text-gray-700">Information and recommended practices</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-orange-100">
                      <p className="font-medium">Service Instructions</p>
                      <p className="text-sm text-gray-700">Detailed procedures for specific tasks</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Tracking */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Compliance Requirements
                </h5>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">AD Compliance</p>
                    <p>Must be accomplished within specified time limits</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Record Keeping</p>
                    <p>Document all compliance actions in aircraft records</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-700">Recurring Requirements</p>
                    <p>Track repetitive inspection and maintenance intervals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Catalog Usage */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Parts Catalog Navigation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Catalog Organization */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h5 className="font-semibold mb-3">Illustrated Parts Catalog Organization</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">System Breakdown</p>
                      <p className="text-sm text-gray-600">Parts organized by aircraft system (engine, landing gear, etc.)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Assembly Views</p>
                      <p className="text-sm text-gray-600">Exploded diagrams showing part relationships and assembly order</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Part Number Index</p>
                      <p className="text-sm text-gray-600">Alphabetical and numerical listing of all parts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Vendor Information</p>
                      <p className="text-sm text-gray-600">Manufacturer codes and supplier contact information</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part Identification */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-700 mb-3">Part Number Identification System</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border p-2 text-left">Part Number Format</th>
                        <th className="border p-2 text-left">Example</th>
                        <th className="border p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">AN Standard</td>
                        <td className="border p-2">AN525-10R8</td>
                        <td className="border p-2">Army-Navy standard hardware</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="border p-2">MS Standard</td>
                        <td className="border p-2">MS20470AD4-6</td>
                        <td className="border p-2">Military Standard specification</td>
                      </tr>
                      <tr>
                        <td className="border p-2">Manufacturer P/N</td>
                        <td className="border p-2">172-12345-001</td>
                        <td className="border p-2">Aircraft-specific part number</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Standards */}
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">Technical Documentation Reference</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border text-center">
                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Image className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-purple-800">Technical Documentation Guide</p>
                    <p className="text-sm text-gray-600">Standards and best practices for technical publications</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive guide to understanding technical publication formats, revision systems, and documentation standards
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}