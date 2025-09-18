import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TopNav from "@/components/navigation/top-nav";
import { useAuth } from "@/hooks/useAuth";
import RealTimeAnalyticsModal from "@/components/admin/real-time-analytics-modal";
import { 
  Users, 
  UserCheck, 
  UserX, 
  BookOpen, 
  ClipboardCheck,
  Trophy,
  TrendingUp,
  AlertCircle,
  Settings,
  Database,
  Shield,
  Activity,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const { data: pendingUsers } = useQuery({
    queryKey: ["/api/admin/users/pending"],
  });

  const { data: allUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Calculate admin stats with proper type safety
  const totalUsers = Array.isArray(allUsers) ? allUsers.length : 0;
  const pendingCount = Array.isArray(pendingUsers) ? pendingUsers.length : 0;
  const approvedUsers = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.status === 'approved').length : 0;
  const premiumUsers = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.role === 'premium').length : 0;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access the admin dashboard.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" onClick={() => setLocation("/auth")}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage users, content, and monitor system performance
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              onClick={() => setShowAnalyticsModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Real-Time Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-avex-blue">{totalUsers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Approval</p>
                  <p className="text-2xl font-bold text-orange-500">{pendingCount}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-orange-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-green-500">{approvedUsers}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-green-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Premium Users</p>
                  <p className="text-2xl font-bold text-avex-purple">{premiumUsers}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Trophy className="text-purple-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Battle Mode Preview */}
        <Card className="bg-gradient-to-br from-avex-violet to-avex-purple text-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Battle Mode Preview</h3>
                <p className="text-purple-100">Test the real-time multiplayer battle system</p>
              </div>
              <div className="text-right">
                <div className="text-2xl">⚔️</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">Demo</div>
                <div className="text-xs text-purple-200">Mode</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">AI</div>
                <div className="text-xs text-purple-200">Opponent</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-lg font-bold">Test</div>
                <div className="text-xs text-purple-200">Session</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white text-avex-violet hover:scale-105 transition-transform"
                onClick={() => {
                  // Open Battle Mode with demo flag
                  const battleUrl = new URL('/battle', window.location.origin);
                  battleUrl.searchParams.set('demo', 'true');
                  window.open(battleUrl.toString(), '_blank');
                }}
              >
                Start Demo Battle
              </Button>
              <Button 
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors"
                onClick={() => {
                  window.open('/battle', '_blank');
                }}
              >
                View Live Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="avex-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-avex-blue" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Link href="/admin/access-requests">
                    <Card className="cursor-pointer hover:scale-105 transition-transform border-orange-200 dark:border-orange-800">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2" />
                        <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Access Requests</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Review pending user approvals</p>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                          {pendingCount} pending
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/users">
                    <Card className="cursor-pointer hover:scale-105 transition-transform border-blue-200 dark:border-blue-800">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">User Management</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Manage user accounts and roles</p>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                          {totalUsers} users
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/content">
                    <Card className="cursor-pointer hover:scale-105 transition-transform border-green-200 dark:border-green-800">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Content Manager</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Manage categories, subtopics & questions</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          {Array.isArray(categories) ? categories.length : 0} categories
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="cursor-pointer hover:scale-105 transition-transform border-purple-200 dark:border-purple-800">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
                      <h3 className="font-medium text-foreground mb-1 text-sm sm:text-base">Analytics</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">View system performance</p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">
                        Reports
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="avex-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-avex-blue" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!Array.isArray(pendingUsers) || pendingUsers.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <UserCheck className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground">No pending actions</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {pendingUsers.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center space-x-2 sm:space-x-3 p-2 border border-border rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pending approval • {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="avex-card mt-4 sm:mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-avex-blue" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Database</span>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Authentication</span>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">File Storage</span>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Real-Time Analytics Modal */}
      <RealTimeAnalyticsModal 
        isOpen={showAnalyticsModal} 
        onClose={() => setShowAnalyticsModal(false)} 
      />
    </div>
  );
}
