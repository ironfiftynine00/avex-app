import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TopNav from "@/components/navigation/top-nav";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Calendar,
  AlertCircle,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";

export default function AccessRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ["/api/admin/users/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/approve`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Approved",
        description: "User has been successfully approved and granted access.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Rejected",
        description: "User access request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (userId: string) => {
    const role = selectedRole[userId] || 'basic';
    approveMutation.mutate({ userId, role });
  };

  const handleReject = (userId: string) => {
    rejectMutation.mutate(userId);
  };

  const handleRoleChange = (userId: string, role: string) => {
    setSelectedRole(prev => ({ ...prev, [userId]: role }));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Requests</h1>
          <p className="text-muted-foreground">
            Review and approve user access requests to the AVEX platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-500">{pendingUsers?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Approved Today</p>
                  <p className="text-2xl font-bold text-green-500">0</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="avex-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Rejected Today</p>
                  <p className="text-2xl font-bold text-red-500">0</p>
                </div>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-500 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="avex-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Pending Access Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingUsers || pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  All user access requests have been processed. New requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((pendingUser: any) => (
                  <div key={pendingUser.id} className="border border-border rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* User Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage 
                            src={pendingUser.profileImageUrl || ""} 
                            alt={`${pendingUser.firstName} ${pendingUser.lastName}`}
                          />
                          <AvatarFallback className="bg-avex-blue text-white">
                            {pendingUser.firstName?.[0]}{pendingUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {pendingUser.firstName} {pendingUser.lastName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{pendingUser.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Requested {new Date(pendingUser.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <Select 
                            value={selectedRole[pendingUser.id] || 'basic'} 
                            onValueChange={(value) => handleRoleChange(pendingUser.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(pendingUser.id)}
                            disabled={rejectMutation.isPending}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleApprove(pendingUser.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Approval Guidelines:</strong> Basic users get access to standard study materials and mock exams. 
            Premium users additionally get access to the Practical Guide section and advanced features. 
            Users can be upgraded to premium later if needed.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
