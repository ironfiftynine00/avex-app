import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Book, Trophy, Users, Shield, Star } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-avex-blue to-avex-indigo rounded-lg flex items-center justify-center">
              <Plane className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-avex-blue">AVEX</h1>
          </div>
          <Button onClick={handleLogin} className="avex-button-primary">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Master Your AMT
            <span className="text-avex-blue"> Certification</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The most comprehensive Aviation Maintenance Technician study platform with 
            gamified learning, mock exams, and real-time competition modes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="avex-button-primary text-lg px-8 py-3">
              Start Learning Free
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Pass Your AMT Exam
          </h3>
          <p className="text-xl text-muted-foreground">
            Comprehensive study tools designed specifically for aviation maintenance certification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Study Modes */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Book className="text-white w-6 h-6" />
              </div>
              <CardTitle>Multiple Study Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive infographics, flashcards, and timed quizzes across 8 AMT categories 
                with intelligent subtopic filtering.
              </p>
            </CardContent>
          </Card>

          {/* Mock Exams */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-white w-6 h-6" />
              </div>
              <CardTitle>Realistic Mock Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fixed-length exams with smart skip limits, real-time scoring, and comprehensive 
                pass tracking for each category.
              </p>
            </CardContent>
          </Card>

          {/* Battle Mode */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white w-6 h-6" />
              </div>
              <CardTitle>Competitive Battle Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time multiplayer quizzes with power-ups, live leaderboards, and different 
                game modes including Sudden Death.
              </p>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="text-white w-6 h-6" />
              </div>
              <CardTitle>Gamified Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Achievement badges, study streaks, and comprehensive progress tracking to 
                keep you motivated throughout your certification journey.
              </p>
            </CardContent>
          </Card>

          {/* Admin Controls */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-white w-6 h-6" />
              </div>
              <CardTitle>Secure & Controlled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Admin-controlled access, single device sessions, and screenshot protection 
                ensure exam integrity and content security.
              </p>
            </CardContent>
          </Card>

          {/* Premium Content */}
          <Card className="avex-card">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Star className="text-white w-6 h-6" />
              </div>
              <CardTitle>Premium Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Exclusive practical guides, advanced study materials, and premium-only 
                features for serious AMT candidates.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-avex-blue to-avex-indigo text-white">
          <CardContent className="text-center py-16">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Ace Your AMT Certification?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who have successfully passed their AMT exams with AVEX
            </p>
            <Button 
              onClick={handleLogin}
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 AVEX. All rights reserved. Aviation Maintenance Technician Reviewer Platform.</p>
        </div>
      </footer>
    </div>
  );
}
