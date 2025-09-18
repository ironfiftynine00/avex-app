import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Users, 
  Timer, 
  Trophy,
  Target,
  Clock,
  Plus,
  X,
  CheckCircle,
  Sword,
  Star
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  image?: string;
  interactive?: boolean;
  highlight?: string;
  action?: string;
}

interface BattleTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to Battle Mode!",
    content: "Battle Mode is where you compete against other students in real-time aviation knowledge battles. Test your skills and climb the leaderboards!",
    highlight: "competitive-learning"
  },
  {
    id: 2,
    title: "How Battles Work",
    content: "You'll face the same questions simultaneously with your opponents. Answer quickly and accurately to score points. The fastest correct answer gets bonus points!",
    highlight: "game-mechanics"
  },
  {
    id: 3,
    title: "Power-Up System",
    content: "Earn power-ups through great performance! Get 3 correct answers in a row OR answer faster than opponents 2-3 times consecutively to unlock special abilities.",
    highlight: "power-ups",
    interactive: true
  },
  {
    id: 4,
    title: "Power-Up Types",
    content: "Choose from 10 different power-ups: 50/50 (eliminate wrong answers), Time Freeze (+10 seconds), Speed Boost (double points), Shield (block sabotage), and more!",
    highlight: "power-up-variety"
  },
  {
    id: 5,
    title: "Room Creation",
    content: "Create private battle rooms with custom settings: choose categories, question count (10-30), player limits (2-8), and invite friends with room codes.",
    highlight: "room-creation",
    action: "create-room"
  },
  {
    id: 6,
    title: "Quick Match",
    content: "Want instant action? Use Quick Match to find opponents immediately. If no players are available, you'll battle against an AI opponent!",
    highlight: "quick-match",
    action: "quick-match"
  },
  {
    id: 7,
    title: "Battle Strategy",
    content: "Balance speed and accuracy. Wrong answers break your streak and reset power-up progress. Use power-ups strategically - save offensive ones for crucial moments!",
    highlight: "strategy"
  },
  {
    id: 8,
    title: "Ready to Battle?",
    content: "You're all set! Start with the Demo Battle to practice, create a room with friends, or jump into Quick Match. Good luck, pilot!",
    highlight: "getting-started"
  }
];

const powerUpExamples = [
  { id: "fifty_fifty", name: "50/50", icon: "🔍", description: "Eliminate 2 wrong answers" },
  { id: "time_freeze", name: "Time Freeze", icon: "⏰", description: "Add 10 seconds to timer" },
  { id: "speed_boost", name: "Speed Boost", icon: "⚡", description: "Double points next answer" },
  { id: "shield", name: "Shield", icon: "🛡️", description: "Block next sabotage" },
  { id: "sabotage", name: "Sabotage", icon: "💥", description: "Shake opponent's screen" }
];

export default function BattleTutorial({ isOpen, onClose, onComplete }: BattleTutorialProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPowerUpDemo, setShowPowerUpDemo] = useState(false);
  const [selectedPowerUp, setSelectedPowerUp] = useState<string | null>(null);

  const currentStepData = tutorialSteps.find(step => step.id === currentStep);
  const progress = (currentStep / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  // Interactive power-up demonstration
  const triggerPowerUpDemo = () => {
    setShowPowerUpDemo(true);
    setTimeout(() => setShowPowerUpDemo(false), 3000);
  };

  useEffect(() => {
    if (currentStep === 3 && currentStepData?.interactive) {
      // Auto-trigger power-up demo for step 3
      setTimeout(() => triggerPowerUpDemo(), 1000);
    }
  }, [currentStep]);

  if (!currentStepData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Sword className="w-6 h-6 text-avex-violet" />
              <span>Battle Mode Tutorial</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {tutorialSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {/* Step Content */}
            <Card className="border-avex-violet/20">
              <CardHeader>
                <CardTitle className="text-xl text-avex-violet">
                  {currentStepData.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    {currentStepData.content}
                  </p>

                  {/* Interactive Demonstrations */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                            Performance Triggers
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-800">3x Correct</Badge>
                            <span>Three correct answers in a row</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">2-3x Faster</Badge>
                            <span>Consecutive faster responses</span>
                          </div>
                        </div>
                      </div>

                      {showPowerUpDemo && (
                        <div className="bg-avex-violet/10 rounded-lg p-4 border border-avex-violet/30 animate-pulse">
                          <div className="text-center space-y-3">
                            <div className="text-lg font-bold text-avex-violet">
                              🔥 Streak Bonus Earned!
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {powerUpExamples.slice(0, 3).map((powerUp) => (
                                <div
                                  key={powerUp.id}
                                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-avex-violet/20 text-center cursor-pointer hover:bg-avex-violet/10 transition-colors"
                                  onClick={() => setSelectedPowerUp(powerUp.id)}
                                >
                                  <div className="text-2xl mb-1">{powerUp.icon}</div>
                                  <div className="text-sm font-medium">{powerUp.name}</div>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Click a power-up to add it to your arsenal!
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedPowerUp && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800 dark:text-green-200">
                              Power-Up Earned!
                            </span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {powerUpExamples.find(p => p.id === selectedPowerUp)?.name} added to your arsenal.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {powerUpExamples.map((powerUp) => (
                        <div key={powerUp.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-avex-violet to-avex-purple rounded-lg flex items-center justify-center">
                            <span className="text-lg">{powerUp.icon}</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{powerUp.name}</div>
                            <div className="text-xs text-muted-foreground">{powerUp.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="space-y-3">
                        <div className="font-semibold text-blue-800 dark:text-blue-200">
                          Room Settings You Can Customize:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>• Category selection</div>
                          <div>• Question count (10-30)</div>
                          <div>• Player limit (2-8)</div>
                          <div>• Game mode options</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <div className="space-y-3">
                        <div className="font-semibold text-purple-800 dark:text-purple-200">
                          Quick Match Features:
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4 text-purple-600" />
                            <span>Instant matchmaking</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span>AI opponent fallback</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-purple-600" />
                            <span>Competitive scoring</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                          <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            ✅ Do This
                          </div>
                          <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                            <li>• Answer accurately for streaks</li>
                            <li>• Use power-ups strategically</li>
                            <li>• Stay calm under pressure</li>
                          </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                          <div className="font-semibold text-red-800 dark:text-red-200 mb-2">
                            ❌ Avoid This
                          </div>
                          <ul className="text-sm space-y-1 text-red-700 dark:text-red-300">
                            <li>• Rushing and making mistakes</li>
                            <li>• Wasting power-ups early</li>
                            <li>• Ignoring opponent strategies</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 8 && (
                    <div className="text-center space-y-4">
                      <div className="text-4xl">🎯</div>
                      <div className="bg-gradient-to-r from-avex-violet to-avex-purple rounded-lg p-4 text-white">
                        <div className="font-bold text-lg mb-2">You're Ready for Battle!</div>
                        <div className="text-sm opacity-90">
                          Start with Demo Battle to practice, then challenge real opponents
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>📚 Demo Battle</div>
                        <div>🏠 Create Room</div>
                        <div>⚡ Quick Match</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button onClick={handleNext} className="avex-button-primary">
              {currentStep === tutorialSteps.length ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Start Battling!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}