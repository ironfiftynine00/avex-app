import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  XCircle,
  Crown,
  Users
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

  const { data: premiumRequests, isLoading: premiumLoading } = useQuery({
    queryKey: ["/api/admin/premium-requests"],
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

  const approvePremiumMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest("POST", `/api/admin/premium-requests/${requestId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Premium Access Approved",
        description: "User has been granted premium access successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-requests"] });
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
        description: "Failed to approve premium access request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectPremiumMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest("POST", `/api/admin/premium-requests/${requestId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Premium Request Rejected",
        description: "Premium access request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-requests"] });
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
        description: "Failed to reject premium access request. Please try again.",
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

  const handleApprovePremium = (requestId: number) => {
    approvePremiumMutation.mutate(requestId);
  };

  const handleRejectPremium = (requestId: number) => {
    rejectPremiumMutation.mutate(requestId);
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

  if (isLoading || premiumLoading) {
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

        <Tabs defaultValue="app-access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app-access" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              App Access ({pendingUsers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="premium-access" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Premium Access ({premiumRequests?.filter((req: any) => req.status === 'pending')?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="app-access" className="mt-6">
            {/* App Access Stats */}
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

            {!pendingUsers || pendingUsers.length === 0 ? (
              <Card className="avex-card">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    All access requests have been processed. Check back later for new requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user: any) => (
                  <Card key={user.id} className="avex-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage 
                              src={user.profileImageUrl || ''} 
                              alt={`${user.firstName} ${user.lastName}`} 
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{user.email}</span>
                            </div>
                            {user.createdAt && (
                              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Requested on {new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Select 
                            value={selectedRole[user.id] || 'basic'} 
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            onClick={() => handleApprove(user.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="avex-button-primary"
                            size="sm"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            {approveMutation.isPending ? "Approving..." : "Approve"}
                          </Button>
                          
                          <Button
                            onClick={() => handleReject(user.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="premium-access" className="mt-6">
            {/* Premium Access Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="avex-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending Premium Requests</p>
                      <p className="text-2xl font-bold text-orange-500">{premiumRequests?.filter((req: any) => req.status === 'pending')?.length || 0}</p>
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
                      <p className="text-muted-foreground text-sm">Approved Premium</p>
                      <p className="text-2xl font-bold text-green-500">{premiumRequests?.filter((req: any) => req.status === 'approved')?.length || 0}</p>
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
                      <p className="text-muted-foreground text-sm">Rejected Premium</p>
                      <p className="text-2xl font-bold text-red-500">{premiumRequests?.filter((req: any) => req.status === 'rejected')?.length || 0}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <XCircle className="text-red-500 w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!premiumRequests || premiumRequests.filter((req: any) => req.status === 'pending').length === 0 ? (
              <Card className="avex-card">
                <CardContent className="p-8 text-center">
                  <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Premium Requests</h3>
                  <p className="text-muted-foreground">
                    All premium access requests have been processed. Check back later for new requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {premiumRequests?.filter((req: any) => req.status === 'pending').map((request: any) => (
                  <Card key={request.id} className="avex-card border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            <Crown className="text-white w-6 h-6" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {request.userFirstName} {request.userLastName}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{request.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            {request.requestMessage && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                <p className="text-sm text-muted-foreground font-medium mb-1">Request Message:</p>
                                <p className="text-sm">{request.requestMessage}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            Premium Request
                          </Badge>
                          
                          <Button
                            onClick={() => handleApprovePremium(request.id)}
                            disabled={approvePremiumMutation.isPending || rejectPremiumMutation.isPending}
                            className="avex-button-primary"
                            size="sm"
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            {approvePremiumMutation.isPending ? "Approving..." : "Grant Premium"}
                          </Button>
                          
                          <Button
                            onClick={() => handleRejectPremium(request.id)}
                            disabled={approvePremiumMutation.isPending || rejectPremiumMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            {rejectPremiumMutation.isPending ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}