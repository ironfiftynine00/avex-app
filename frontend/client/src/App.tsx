import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { Clock } from "lucide-react";
import { ProgressDialogProvider } from "@/contexts/ProgressDialogContext";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Study from "@/pages/study";
import StudyModeSelection from "@/pages/study-mode-selection";
import CategorySelection from "@/pages/category-selection";
import SubtopicSelection from "@/pages/subtopic-selection";
import ReviewMode from "@/pages/review-mode";
import PracticeMode from "@/pages/practice-mode";
import QuizSetup from "@/pages/quiz-setup";
import QuizMode from "@/pages/quiz-mode";
import QuizResults from "@/pages/quiz-results";
import MockExam from "@/pages/mock-exam";
import ExamResults from "@/pages/exam-results";
import BattleMode from "@/pages/battle-mode";
import Profile from "@/pages/profile";
import PracticalExam from "@/pages/practical-exam";
import AdminDashboard from "@/pages/admin/dashboard";
import AccessRequests from "@/pages/admin/access-requests";
import UserManagement from "@/pages/admin/user-management";
import ContentManager from "@/pages/admin/content-manager";
import AircraftElectricalStation from "@/pages/practical-stations/aircraft-electrical";
import WeightBalanceStation from "@/pages/practical-stations/weight-balance";
import TechnicalPublicationsStation from "@/pages/practical-stations/technical-publications";
import SheetMetalStation from "@/pages/practical-stations/sheet-metal";
import EngineMaintenanceStation from "@/pages/practical-stations/engine-maintenance";
import AircraftToolsStation from "@/pages/practical-stations/aircraft-tools";
import PaintingCorrosionStation from "@/pages/practical-stations/painting-corrosion";
import LandingGearStation from "@/pages/practical-stations/landing-gear";
import PropellerStation from "@/pages/practical-stations/propeller";
import ReciprocatingEngineStation from "@/pages/practical-stations/reciprocating-engine";
import AircraftWalkaroundStation from "@/pages/practical-stations/aircraft-walkaround";
import BottomNav from "@/components/navigation/bottom-nav";
import { ErrorBoundary } from "@/components/error-boundary";

function Router() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Initialize session tracking for authenticated users
  const { updateActivity } = useSessionTracking();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={AuthPage} />
      </Switch>
    );
  }

  if ((user as any)?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-4">
            Your account is currently under review. You'll receive access once an administrator approves your request.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>What happens next?</strong><br />
              • An administrator will review your registration<br />
              • You'll be notified via email once approved<br />
              • You can then access all app features
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              logoutMutation.mutate();
              setLocation("/auth");
            }}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Signing out..." : "Back to Sign In"}
          </Button>
        </div>
      </div>
    );
  }

  if ((user as any)?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-times text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Your account request has been declined. Please contact support for more information.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              onClick={() => {
                logoutMutation.mutate();
                setLocation("/auth");
              }}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign In Again"}
            </Button>
            <Button variant="outline" onClick={() => window.open("mailto:support@avex.com", "_blank")}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-screen bg-background pb-16">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/study" component={StudyModeSelection} />
        <Route path="/study-old" component={Study} />
        <Route path="/study/:mode/categories" component={CategorySelection} />
        <Route path="/study/:mode/category/:categoryId/subtopics" component={SubtopicSelection} />
        <Route path="/study/review/category/:categoryId/subtopic/:subtopicId" component={ReviewMode} />
        <Route path="/study/practice/category/:categoryId/subtopic/:subtopicId" component={PracticeMode} />
        <Route path="/study/quiz/category/:categoryId/subtopic/:subtopicId" component={QuizSetup} />
        <Route path="/study/quiz/category/:categoryId/subtopic/:subtopicId/questions" component={QuizMode} />
        <Route path="/study/quiz-results" component={QuizResults} />
        <Route path="/mock-exam" component={MockExam} />
        <Route path="/exam-results" component={ExamResults} />
        <Route path="/battle" component={BattleMode} />
        <Route path="/profile" component={Profile} />
        <Route path="/practical-exam" component={PracticalExam} />
        
        {/* Practical Station routes */}
        <Route path="/practical/aircraft-electrical" component={AircraftElectricalStation} />
        <Route path="/practical/weight-balance" component={WeightBalanceStation} />
        <Route path="/practical/technical-publications" component={TechnicalPublicationsStation} />
        <Route path="/practical/sheet-metal" component={SheetMetalStation} />
        <Route path="/practical/engine-maintenance" component={EngineMaintenanceStation} />
        <Route path="/practical/aircraft-tools" component={AircraftToolsStation} />
        <Route path="/practical/painting-corrosion" component={PaintingCorrosionStation} />
        <Route path="/practical/landing-gear" component={LandingGearStation} />
        <Route path="/practical/propeller" component={PropellerStation} />
        <Route path="/practical/reciprocating-engine" component={ReciprocatingEngineStation} />
        <Route path="/practical/aircraft-walkaround" component={AircraftWalkaroundStation} />
        <Route path="/practical/aircraft-instruments" component={EngineMaintenanceStation} />
        
        {/* Admin routes */}
        {isAdmin && (
          <>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/access-requests" component={AccessRequests} />
            <Route path="/admin/users" component={UserManagement} />
            <Route path="/admin/content" component={ContentManager} />
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProgressDialogProvider>
            <ThemeProvider defaultTheme="light" storageKey="avex-ui-theme">
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </ProgressDialogProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
