import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressRing } from "@/components/ui/progress-ring";
import BadgeCard from "@/components/badges/badge-card";
import TopNav from "@/components/navigation/top-nav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User as UserIcon, 
  Settings, 
  Trophy, 
  BarChart3, 
  Calendar,
  Clock,
  Target,
  Flame,
  BookOpen,
  Award,
  Camera,
  Edit,
  Save,
  X
} from "lucide-react";
import { CATEGORIES, BADGES } from "@/lib/constants";
import { useState, useRef } from "react";
import React from "react";

// Types for user data
interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  profileImageUrl?: string;
  role: string;
  status: string;
}

export default function Profile() {
  const { user } = useAuth() as { user: UserData | null };
  const { toast } = useToast();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  
  // Check if we should show progress tab by default (when coming from category progress)
  const defaultTab = location.includes('?tab=progress') ? 'progress' : 'overview';

  // Profile editing state
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update nickname when user data changes
  React.useEffect(() => {
    setNickname(user?.nickname || "");
  }, [user?.nickname]);

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
  });

  const { data: examAttempts = [] } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/badges/user"],
  });

  const { data: streak = { studyStreak: 0, longestStreak: 0 } } = useQuery({
    queryKey: ["/api/study-sessions/streak"],
  });

  const { data: studySessions = [] } = useQuery({
    queryKey: ["/api/study-sessions"],
  });

  // Calculate stats with proper type handling
  const totalExams = Array.isArray(examAttempts) ? examAttempts.length : 0;
  const passedExams = Array.isArray(examAttempts) ? examAttempts.filter((exam: any) => exam.passed).length : 0;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const averageScore = totalExams > 0 && Array.isArray(examAttempts)
    ? Math.round(examAttempts.reduce((acc: number, exam: any) => acc + parseFloat(exam.score), 0) / totalExams)
    : 0;

  const overallProgress = Array.isArray(progress) && progress.length > 0 
    ? Math.round(progress.reduce((acc: number, p: any) => acc + (p.correctAnswers / p.totalAttempts * 100 || 0), 0) / progress.length)
    : 0;

  // Profile update mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profileImageUrl?: string; nickname?: string }) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      return await apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      setPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Password Change Failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await fetch("/api/user/upload-profile-image", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const { imageUrl } = await response.json();
        updateProfileMutation.mutate({ profileImageUrl: imageUrl });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNicknameSave = () => {
    if (nickname.trim()) {
      updateProfileMutation.mutate({ nickname: nickname.trim() });
      setIsEditingNickname(false);
    }
  };

  const handlePasswordChange = () => {
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ password });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="avex-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar with Upload */}
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={user?.profileImageUrl || ""} 
                      alt={`${user?.firstName || "User"} ${user?.lastName || ""}`}
                    />
                    <AvatarFallback className="bg-avex-blue text-white text-2xl">
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {user?.nickname || `${user?.firstName} ${user?.lastName}`}
                  </h1>
                  <p className="text-muted-foreground mb-2">{user?.firstName} {user?.lastName}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {user?.role} User
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {user?.status}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-avex-blue">{(streak as any)?.studyStreak || 0}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-avex-indigo">{Array.isArray(userBadges) ? userBadges.length : 0}</div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>

            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Stats */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="avex-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-avex-blue" />
                      <span>Performance Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold text-avex-blue">{totalExams}</div>
                        <div className="text-sm text-muted-foreground">Total Exams</div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold text-green-500">{passRate}%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold text-avex-indigo">{averageScore}%</div>
                        <div className="text-sm text-muted-foreground">Avg Score</div>
                      </div>
                      <div className="text-center p-4 border border-border rounded-lg">
                        <div className="text-2xl font-bold text-avex-purple">{overallProgress}%</div>
                        <div className="text-sm text-muted-foreground">Overall Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="avex-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-avex-blue" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!Array.isArray(examAttempts) || examAttempts.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No exam attempts yet</p>
                        <p className="text-sm text-muted-foreground">Start studying to see your progress here!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Array.isArray(examAttempts) ? examAttempts.slice(0, 5).map((attempt: any) => {
                          const category = CATEGORIES.find(c => c.id === attempt.categoryId);
                          return (
                            <div key={attempt.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <div className="font-medium text-sm">{category?.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(attempt.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>
                                  {Math.round(parseFloat(attempt.score))}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {attempt.correctAnswers}/{attempt.totalQuestions}
                                </div>
                              </div>
                            </div>
                          );
                        }) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Study Streak & Quick Actions */}
              <div className="space-y-6">
                <Card className="avex-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span>Study Streak</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">
                      {(streak as any)?.studyStreak || 0}
                    </div>
                    <div className="text-muted-foreground mb-4">days in a row</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Keep it up! Study today to maintain your streak.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="avex-card">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Studying
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Take Mock Exam
                    </Button>
                    <Button className="w-full avex-button-secondary">
                      <Trophy className="w-4 h-4 mr-2" />
                      Join Battle
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => {
                const categoryProgress = Array.isArray(progress) ? progress.find((p: any) => p.categoryId === category.id) : null;
                const progressPercent = categoryProgress 
                  ? (categoryProgress.correctAnswers / categoryProgress.totalAttempts * 100) || 0
                  : 0;
                
                const categoryAttempts = Array.isArray(examAttempts) ? examAttempts.filter((exam: any) => exam.categoryId === category.id) : [];
                const lastAttempt = categoryAttempts[0];
                const bestScore = categoryAttempts.length > 0 
                  ? Math.max(...categoryAttempts.map((a: any) => parseFloat(a.score)))
                  : 0;

                return (
                  <Card key={category.id} className="avex-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground text-sm">{category.name}</h4>
                        <ProgressRing percentage={progressPercent} size={40} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Attempts</span>
                          <span className="text-foreground">{categoryAttempts.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Best Score</span>
                          <span className={`font-medium ${bestScore >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                            {Math.round(bestScore)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Last Attempt</span>
                          <span className="text-foreground">
                            {lastAttempt ? new Date(lastAttempt.createdAt).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>



          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="max-w-4xl space-y-6">
              {/* Profile Picture Settings */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-avex-blue" />
                    <span>Profile Picture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage 
                        src={user?.profileImageUrl || ""} 
                        alt={`${user?.firstName || "User"} ${user?.lastName || ""}`}
                      />
                      <AvatarFallback className="bg-avex-blue text-white text-xl">
                        {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload a new profile picture. Recommended size: 400x400 pixels.
                      </p>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={updateProfileMutation.isPending}
                        className="avex-button"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {updateProfileMutation.isPending ? "Uploading..." : "Change Picture"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-avex-blue" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nickname */}
                  <div>
                    <Label htmlFor="nickname">Nickname (Display Name)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleNicknameSave}
                        disabled={!nickname.trim() || updateProfileMutation.isPending}
                        size="sm"
                        className="avex-button"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be displayed as your username in the app.
                    </p>
                  </div>

                  {/* Non-editable fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={user?.firstName || ""}
                        disabled
                        className="mt-1 bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={user?.lastName || ""}
                        disabled
                        className="mt-1 bg-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="mt-1 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact support to change your email address.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-avex-blue" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1"
                      />
                    </div>

                    <Button 
                      onClick={handlePasswordChange}
                      disabled={!password || !confirmPassword || changePasswordMutation.isPending}
                      className="w-full avex-button"
                    >
                      {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-avex-blue" />
                    <span>Account Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
