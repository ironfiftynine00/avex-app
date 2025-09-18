import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import TopNav from "@/components/navigation/top-nav";
import BattleTutorial from "@/components/battle/battle-tutorial";
import ThemeSelector from "@/components/battle/theme-selector";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 

  Users, 
  Trophy, 
  Zap, 
  Plus,
  Copy,
  Crown,
  Target,
  Timer,
  Shield,
  Clock,
  Star,
  Flame,
  HelpCircle,
  Palette,
  LogOut,
  Home,
  Volume2,
  VolumeX,
  ArrowLeft,
  Eye,
  Gamepad,
  Settings2,
  Settings,
  X
} from "lucide-react";
import { CATEGORIES, POWER_UPS } from "@/lib/constants";
import { BattleTheme, getCurrentTheme, applyBattleTheme } from "@/lib/battle-themes";
import { battleSoundManager, playAnswerFeedback, playVictorySequence, playDefeatSequence } from "@/lib/battle-sounds";

interface BattleRoom {
  id: number;
  roomCode: string;
  hostUserId: number;
  gameMode: string;
  categoryId: number;
  questionCount: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'lobby' | 'waiting' | 'active' | 'finished' | 'abandoned';
  isLocked: boolean;
}

interface BattlePlayer {
  userId: number;
  userName: string;
  profileImageUrl?: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalAnswered: number;
  isReady: boolean;
  isHost: boolean;
  isActive: boolean;
}

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
}

type GameState = 'lobby' | 'waiting' | 'active' | 'rankings' | 'finished';

export default function BattleMode() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch battle statistics with auto-refresh after matches
  const { data: battleStats, refetch: refetchBattleStats } = useQuery({
    queryKey: ['/api/battle/stats'],
    enabled: !!user
  });
  
  // Check for demo mode
  const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
  const [roomCode, setRoomCode] = useState("");
  const [gameMode, setGameMode] = useState("classic");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubtopics, setSelectedSubtopics] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [battleCategory, setBattleCategory] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(
    localStorage.getItem('battle-tutorial-completed') === 'true'
  );
  const [createdRoom, setCreatedRoom] = useState<BattleRoom | null>(null);
  
  // Battle game state
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<BattlePlayer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [myScore, setMyScore] = useState(0);
  // Start with NO power-ups - they must be earned through performance
  const [availablePowerUps, setAvailablePowerUps] = useState<string[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<string[]>([]);
  const [showFiftyFifty, setShowFiftyFifty] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  const [gameResults, setGameResults] = useState<BattlePlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  // Performance tracking for power-up rewards
  const [correctAnswerStreak, setCorrectAnswerStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [consecutiveFasterAnswers, setConsecutiveFasterAnswers] = useState(0);
  
  // Power-up system state
  const [showPowerUpSelection, setShowPowerUpSelection] = useState(false);
  const [offeredPowerUps, setOfferedPowerUps] = useState<string[]>([]);
  const [powerUpInventory, setPowerUpInventory] = useState<string[]>([]);
  const [activePowerUpEffects, setActivePowerUpEffects] = useState<{[key: string]: any}>({});
  const [lastAnswerTime, setLastAnswerTime] = useState<number>(0);
  const [opponentAnswerTimes, setOpponentAnswerTimes] = useState<number[]>([]);
  
  // Power-ups can be used multiple times if earned (removed one-time restriction)
  const [streakProtectorActive, setStreakProtectorActive] = useState(false);
  const [secondChanceAvailable, setSecondChanceAvailable] = useState(false);
  const [powerUpLogs, setPowerUpLogs] = useState<{userId: string, powerUpId: string, timestamp: number, effect: string}[]>([]);
  const [availablePowerUpRewards, setAvailablePowerUpRewards] = useState<string[]>([]);
  const [lastAnswerTimes, setLastAnswerTimes] = useState<{[userId: string]: number}>({});
  
  // Enhanced power-up UI state

  const [powerUpAnimations, setPowerUpAnimations] = useState<{[key: string]: string}>({});

  const [multiplierActive, setMultiplierActive] = useState<{multiplier: number, questionsLeft: number} | null>(null);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  
  // Enhanced battle features
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showRankingAnimation, setShowRankingAnimation] = useState(false);
  const [previousRankings, setPreviousRankings] = useState<BattlePlayer[]>([]);
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [showIntermediateRankings, setShowIntermediateRankings] = useState(false);
  const [currentScores, setCurrentScores] = useState<{userId: string, userName: string, score: number}[]>([]);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [rankingAnimations, setRankingAnimations] = useState<{[userId: string]: 'up' | 'down' | 'same'}>({});

  
  // Score tracking
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [lastAnswerPoints, setLastAnswerPoints] = useState<number>(0);
  const [isInDemoMode, setIsInDemoMode] = useState(false);











  
  // Enhanced multiplayer state (2-10 players)
  const [isHost, setIsHost] = useState(false);
  const [currentPlayers, setCurrentPlayers] = useState(0);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<BattleRoom | null>(null);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [playerRankings, setPlayerRankings] = useState<BattlePlayer[]>([]);
  const [concededPlayers, setConcededPlayers] = useState<number[]>([]);
  const [roomFull, setRoomFull] = useState(false);
  
  // Advanced power-up mechanics
  const [fastestAnswerTime, setFastestAnswerTime] = useState<number>(Infinity);
  const [powerUpsUsedCount, setPowerUpsUsedCount] = useState(0);
  const [afterburnerActive, setAfterburnerActive] = useState(false);
  const [comebackUsed, setComebackUsed] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [fastCorrectStreak, setFastCorrectStreak] = useState(0);
  
  // Theme system
  const [currentTheme, setCurrentTheme] = useState<BattleTheme>(getCurrentTheme());
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Sound system
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  
  // Missing state variables for power-up effects
  const [isFrozen, setIsFrozen] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  
  // Power-Up System (smart hint removed)
  const [showHintDialog, setShowHintDialog] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(0);
  
  // ========= TRIGGER-BASED POWER-UP SYSTEM =========
  
  // Apply active power-up effects to scoring
  const applyActivePowerUpEffects = (basePoints: number, isCorrect: boolean) => {
    let finalPoints = basePoints;
    let pointsAdded = 0;
    
    if (isCorrect) {
      // Apply speed boost (2x multiplier for this question only)
      if (activePowerUpEffects.speed_boost?.usesLeft > 0) {
        finalPoints *= 2;
        pointsAdded = finalPoints - basePoints;
        setActivePowerUpEffects(prev => ({
          ...prev,
          speed_boost: { ...prev.speed_boost!, usesLeft: prev.speed_boost!.usesLeft - 1 }
        }));
        
        // Update scores immediately
        setMyScore(prev => prev + pointsAdded);
        setPlayerScore(prev => prev + pointsAdded);
        
        // Send real-time score update for ranking
        if (!isDemo && wsRef.current && currentRoom) {
          wsRef.current.send(JSON.stringify({
            type: 'score_update',
            data: {
              userId: user?.id.toString(),
              newScore: myScore + finalPoints,
              roomCode: currentRoom.roomCode
            }
          }));
        }
        
        toast({
          title: "⚡ Speed Boost Applied!",
          description: `Points doubled! +${pointsAdded} bonus points`,
          duration: 2000,
        });
      }
      
      // Apply score multiplier (3x multiplier for consecutive correct answers)
      if (activePowerUpEffects.score_multiplier?.usesLeft > 0) {
        const beforeMultiplier = finalPoints;
        finalPoints *= 3;
        pointsAdded = finalPoints - beforeMultiplier;
        setActivePowerUpEffects(prev => ({
          ...prev,
          score_multiplier: { ...prev.score_multiplier!, usesLeft: prev.score_multiplier!.usesLeft - 1 }
        }));
        
        // Update scores immediately
        setMyScore(prev => prev + pointsAdded);
        setPlayerScore(prev => prev + pointsAdded);
        
        // Send real-time score update for ranking
        if (!isDemo && wsRef.current && currentRoom) {
          wsRef.current.send(JSON.stringify({
            type: 'score_update',
            data: {
              userId: user?.id.toString(),
              newScore: myScore + finalPoints,
              roomCode: currentRoom.roomCode
            }
          }));
        }
        
        toast({
          title: "📈 Score Multiplier Applied!",
          description: `Points tripled! +${pointsAdded} bonus points`,
          duration: 2000,
        });
      }
    } else {
      // Reset score multiplier on wrong answer (must be consecutive)
      if (activePowerUpEffects.score_multiplier?.usesLeft > 0) {
        setActivePowerUpEffects(prev => {
          const newEffects = { ...prev };
          delete newEffects.score_multiplier;
          return newEffects;
        });
        
        toast({
          title: "📈 Score Multiplier Lost",
          description: "Wrong answer broke the consecutive streak",
          variant: "destructive",
          duration: 2000,
        });
      }
    }
    
    // Clean up expired effects
    setActivePowerUpEffects(prev => {
      const newEffects = { ...prev };
      if (newEffects.speed_boost?.usesLeft <= 0) delete newEffects.speed_boost;
      if (newEffects.score_multiplier?.usesLeft <= 0) delete newEffects.score_multiplier;
      return newEffects;
    });
    
    return finalPoints;
  };

  // Track trigger conditions for power-up rewards
  const checkPowerUpTriggers = (isCorrect: boolean, responseTime: number, wasFirstToAnswer: boolean) => {
    if (!isCorrect) {
      // Reset streaks on wrong answer
      setCorrectStreak(0);
      setFastCorrectStreak(0);
      return;
    }

    // Update correct answer streak
    const newCorrectStreak = correctStreak + 1;
    setCorrectStreak(newCorrectStreak);
    
    // Check for Defense/Support Arsenal Power-Up Reward: 3 consecutive correct answers
    if (newCorrectStreak >= 3 && newCorrectStreak % 3 === 0) {
      triggerDefenseSupportArsenalReward();
    }
    
    // Check for Boost Arsenal Power-Up Reward: 5 consecutive correct answers
    if (newCorrectStreak >= 5 && newCorrectStreak % 5 === 0) {
      triggerBoostArsenalReward();
    }
    
    // Update fast correct streak if was first to answer
    if (wasFirstToAnswer) {
      const newFastStreak = fastCorrectStreak + 1;
      setFastCorrectStreak(newFastStreak);
      
      // Check for Defense/Support Arsenal Reward: 3 consecutive fastest correct answers
      if (newFastStreak >= 3 && newFastStreak % 3 === 0) {
        triggerDefenseSupportArsenalReward();
      }
      
      // Check for Boost Arsenal Reward: 5 consecutive fastest correct answers
      if (newFastStreak >= 5 && newFastStreak % 5 === 0) {
        triggerBoostArsenalReward();
      }
    } else {
      setFastCorrectStreak(0);
    }
  };

  const triggerDefenseSupportArsenalReward = () => {
    // Don't show power-up selection on the last question
    if (questionNumber >= totalQuestions) {
      return;
    }
    
    // Defense and Support Arsenal power-ups for 3-streak rewards
    const supportArsenalPowerUps = ['fifty_fifty', 'extra_time'];
    const defenseArsenalPowerUps = ['streak_protector', 'second_chance'];
    const defenseSupportPowerUps = [...supportArsenalPowerUps, ...defenseArsenalPowerUps];
    
    // Filter out power-ups that are already in inventory
    const availableRewards = defenseSupportPowerUps.filter(
      powerUp => !powerUpInventory.includes(powerUp) // Only check if not already in inventory
    );
    
    console.log('Defense/Support Arsenal - Available rewards:', availableRewards);
    console.log('Current inventory:', powerUpInventory);
    
    if (availableRewards.length === 0) {
      toast({
        title: "No Power-ups Available",
        description: "All Defense/Support power-ups are already in your inventory!",
      });
      return;
    }
    
    // Ensure both Support and Defense arsenal options are represented when possible
    const availableSupport = supportArsenalPowerUps.filter(p => availableRewards.includes(p));
    const availableDefense = defenseArsenalPowerUps.filter(p => availableRewards.includes(p));
    
    let rewardOptions: string[] = [];
    
    // Try to include at least one from each arsenal if available
    if (availableSupport.length > 0 && availableDefense.length > 0) {
      // Pick one from each arsenal randomly
      const randomSupport = availableSupport[Math.floor(Math.random() * availableSupport.length)];
      const randomDefense = availableDefense[Math.floor(Math.random() * availableDefense.length)];
      rewardOptions = [randomSupport, randomDefense];
      
      // Add one more random option if space allows
      const remaining = availableRewards.filter(p => !rewardOptions.includes(p));
      if (remaining.length > 0 && rewardOptions.length < 3) {
        const randomRemaining = remaining[Math.floor(Math.random() * remaining.length)];
        rewardOptions.push(randomRemaining);
      }
    } else {
      // If only one arsenal available, pick up to 3 from available
      const shuffled = availableRewards.sort(() => Math.random() - 0.5);
      rewardOptions = shuffled.slice(0, Math.min(3, shuffled.length));
    }
    
    setAvailablePowerUpRewards(rewardOptions);
    setShowPowerUpSelection(true);
    
    // Show animated notification
    setPowerUpAnimations(prev => ({...prev, trigger_glow: 'trigger'}));
    setTimeout(() => {
      setPowerUpAnimations(prev => {
        const newAnimations = {...prev};
        delete newAnimations.trigger_glow;
        return newAnimations;
      });
    }, 3000);
    
    toast({
      title: "🛡️ Defense/Support Arsenal!",
      description: "3 consecutive achievements! Choose from Defense and Support power-ups!",
    });
  };

  const triggerBoostArsenalReward = () => {
    // Don't show power-up selection on the last question
    if (questionNumber >= totalQuestions) {
      return;
    }
    
    // Boost Arsenal power-ups (disabled for now)
    const boostArsenalPowerUps: string[] = [];
    
    // Filter out power-ups that are already in inventory
    const availableRewards = boostArsenalPowerUps.filter(
      powerUp => !powerUpInventory.includes(powerUp) // Only check if not already in inventory
    );
    
    console.log('Boost Arsenal - Available rewards:', availableRewards);
    console.log('Current inventory:', powerUpInventory);
    
    if (availableRewards.length === 0) {
      toast({
        title: "No Boost Power-ups Available",
        description: "All Boost Arsenal power-ups are already in your inventory!",
      });
      return;
    }
    
    // Offer all available boost arsenal power-ups
    setAvailablePowerUpRewards(availableRewards);
    setShowPowerUpSelection(true);
    
    // Show animated notification
    setPowerUpAnimations(prev => ({...prev, trigger_glow: 'trigger'}));
    setTimeout(() => {
      setPowerUpAnimations(prev => {
        const newAnimations = {...prev};
        delete newAnimations.trigger_glow;
        return newAnimations;
      });
    }, 3000);
    
    toast({
      title: "🚀 Boost Arsenal Unlocked!",
      description: "5 consecutive achievements! Choose a boost power-up!",
    });
  };
  
  const selectPowerUpReward = (powerUpId: string) => {
    console.log('Selecting power-up reward:', powerUpId);
    console.log('Current inventory before selection:', powerUpInventory);
    console.log('Power-up selection - multiple uses allowed');
    
    if (isDemo) {
      // Demo mode - handle locally
      setPowerUpInventory(prev => [...prev, powerUpId]);
    } else {
      // Multiplayer mode - sync with server
      if (wsRef.current && currentRoom) {
        wsRef.current.send(JSON.stringify({
          type: 'power_up_earned',
          data: {
            userId: user?.id?.toString(),
            powerUpId,
            roomCode: currentRoom.roomCode
          }
        }));
      }
      setPowerUpInventory(prev => [...prev, powerUpId]);
    }
    
    setShowPowerUpSelection(false);
    setAvailablePowerUpRewards([]);
    
    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
    
    // Add to HUD with animation
    setPowerUpAnimations(prev => ({...prev, [powerUpId]: 'earned'}));
    setTimeout(() => {
      setPowerUpAnimations(prev => {
        const newAnimations = {...prev};
        delete newAnimations[powerUpId];
        return newAnimations;
      });
    }, 2000);
    
    toast({
      title: `${powerUp?.icon} ${powerUp?.name} Added!`,
      description: `${powerUp?.description} Ready to activate!`,
      duration: 4000,
    });
    
    // Log the power-up acquisition
    setPowerUpLogs(prev => [...prev, {
      userId: user?.id?.toString() || '',
      powerUpId,
      timestamp: Date.now(),
      effect: `Acquired ${powerUp?.name}`
    }]);
    
    console.log('Power-up added to inventory. New inventory:', [...powerUpInventory, powerUpId]);
  };
  
  const usePowerUp = (powerUpId: string) => {
    if (!powerUpInventory.includes(powerUpId)) return;
    
    // Keep power-up in inventory for multiple uses - only consume from inventory temporarily
    // Power-up remains available for reuse as long as it was earned
    
    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
    
    // Execute power-up effect
    switch (powerUpId) {
      case 'fifty_fifty':
        handleFiftyFiftyPowerUp();
        break;
      case 'extra_time':
        handleExtraTimePowerUp();
        break;



      // Boost Arsenal power-ups disabled
      // case 'speed_boost':
      //   handleSpeedBoostPowerUp();
      //   break;
      // case 'score_multiplier':
      //   handleScoreMultiplierPowerUp();
      //   break;
      // case 'hydraulic_boost':
      //   handleHydraulicBoostPowerUp();
      //   break;

      case 'streak_protector':
        handleStreakProtectorPowerUp();
        break;
      case 'second_chance':
        handleSecondChancePowerUp();
        break;
    }
    
    // Log power-up usage
    setPowerUpLogs(prev => [...prev, {
      userId: user?.id?.toString() || '',
      powerUpId,
      timestamp: Date.now(),
      effect: `Used ${powerUp?.name}`
    }]);
    
    // Send to server for real-time sync
    if (wsRef.current && gameState === 'active') {
      wsRef.current.send(JSON.stringify({
        type: 'power_up_used',
        data: {
          userId: user?.id?.toString(),
          powerUpId,
          roomCode: currentRoom?.roomCode
        }
      }));
    }
  };
  
  // Network optimization state
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Power-Up Effect Handlers
  const handleFiftyFiftyPowerUp = () => {
    if (!currentQuestion) return;
    
    const options = ['A', 'B', 'C', 'D'];
    const correctOption = currentQuestion.correctAnswer;
    const incorrectOptions = options.filter(opt => opt !== correctOption);
    
    // Remove 2 random incorrect options
    const toEliminate = incorrectOptions.slice(0, 2);
    setEliminatedOptions(toEliminate);
    setShowFiftyFifty(true);
    
    toast({
      title: "🔍 50/50 Activated!",
      description: "2 incorrect answers eliminated!",
      duration: 3000,
    });
  };
  
  const handleExtraTimePowerUp = () => {
    setTimeRemaining(prev => prev + 15);
    toast({
      title: "➕ Extra Time!",
      description: "+15 seconds added to your timer!",
      duration: 3000,
    });
  };
  

  

  

  
  // Boost Arsenal power-ups removed from the system
  

  
  const handleStreakProtectorPowerUp = () => {
    setStreakProtectorActive(true);
    toast({
      title: "⭐ Streak Protector!",
      description: "Next wrong answer won't break your streak!",
      duration: 3000,
    });
  };
  
  const handleSecondChancePowerUp = () => {
    setSecondChanceAvailable(true);
    toast({
      title: "🔄 Second Chance Ready!",
      description: "You can retry your next wrong answer!",
      duration: 3000,
    });
  };
  

  


  // Fetch categories and subtopics
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: subtopics = [] } = useQuery({
    queryKey: ["/api/subtopics"],
    enabled: !!selectedCategory,
  });

  // Initialize theme and sound system on component mount
  useEffect(() => {
    applyBattleTheme(currentTheme);
    
    // Initialize sound system with error handling
    try {
      battleSoundManager.setSoundEnabled(soundEnabled);
      battleSoundManager.setMasterVolume(masterVolume);
    } catch (error) {
      console.warn('Sound system initialization failed:', error);
    }
    
    // Cleanup on unmount
    return () => {
      try {
        battleSoundManager.cleanup();
      } catch (error) {
        console.warn('Sound cleanup failed:', error);
      }
    };
  }, []);

  // Update sound settings when they change
  useEffect(() => {
    try {
      battleSoundManager.setSoundEnabled(soundEnabled);
    } catch (error) {
      console.warn('Failed to update sound enabled state:', error);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      battleSoundManager.setMasterVolume(masterVolume);
    } catch (error) {
      console.warn('Failed to update master volume:', error);
    }
    
    // Cleanup on unmount
    return () => {
      battleSoundManager.cleanup();
    };
  }, []);

  // Update sound settings when they change
  useEffect(() => {
    battleSoundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    battleSoundManager.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Enhanced WebSocket connection with network optimization
  useEffect(() => {
    if (!user?.id || gameState === 'lobby') return;
    
    // Initialize WebSocket connection with performance optimizations
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setWebSocketConnected(true);
      setReconnectAttempts(0); // Reset attempts on successful connection
      
      // Send keepalive ping every 25 seconds to maintain connection
      const keepaliveInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(keepaliveInterval);
        }
      }, 25000);
      
      // Store interval for cleanup
      (ws as any).keepaliveInterval = keepaliveInterval;
    };
    
    ws.onmessage = (event) => {
      try {
        // Performance optimization: Use requestAnimationFrame for smooth UI updates
        requestAnimationFrame(() => {
          const message = JSON.parse(event.data);
          
          // Ignore ping/pong messages
          if (message.type === 'pong') return;
          
          console.log('WebSocket message received:', message);
          handleWebSocketMessage(message);
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setWebSocketConnected(false);
      
      // Clear keepalive interval
      if ((ws as any).keepaliveInterval) {
        clearInterval((ws as any).keepaliveInterval);
      }
      
      // Attempt to reconnect after a delay if not a clean close (network optimization)
      // Don't reconnect if the user is in lobby state or if already attempting to reconnect
      if (event.code !== 1000 && (gameState === 'waiting' || gameState === 'active') && reconnectAttempts < 3) {
        const reconnectDelay = Math.min(3000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
        setTimeout(() => {
          // Only reconnect if we don't already have an active connection
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log(`Attempting to reconnect WebSocket... (attempt ${reconnectAttempts + 1})`);
            setReconnectAttempts(prev => prev + 1);
          }
        }, reconnectDelay);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWebSocketConnected(false);
    };
    
    return () => {
      if ((ws as any).keepaliveInterval) {
        clearInterval((ws as any).keepaliveInterval);
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [user?.id, gameState, reconnectAttempts]);

  // Auto-start demo if demo parameter is present
  useEffect(() => {
    if (isDemo && user) {
      setIsInDemoMode(true);
      handleDemoStart();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isDemo, user]);

  const connectWebSocket = (roomCode: string) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      wsRef.current?.send(JSON.stringify({
        type: 'join_battle',
        data: {
          roomCode,
          userId: user?.id.toString(),
          userName: `${user?.firstName} ${user?.lastName}`.trim()
        }
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to battle server.",
        variant: "destructive",
      });
    };
  };

  const handleWebSocketMessage = (message: any) => {
    const { type, ...data } = message;
    
    // Don't ignore any messages - let the game state handle them properly
    // This fixes the bug where users miss game progression messages
    
    switch (type) {
      case 'joined_battle':
        console.log('Joined battle data received:', data);
        console.log('Players data from server:', data.players);
        
        // Ensure player IDs are strings for consistent comparison
        const playersData = (data.players || []).map((p: any) => ({
          ...p,
          userId: p.userId?.toString()
        }));
        
        console.log('Setting players data with string IDs:', playersData);
        setPlayers(playersData);
        setGameState('waiting');
        setAvailablePowerUps([]);
        setShowRoomDialog(false);
        
        // Store the current room data for proper state management
        if (data.room) {
          setCurrentRoom(data.room);
          setCreatedRoom(data.room);
        }
        
        // Play room joined sound with error handling
        try {
          battleSoundManager.playSound('room_joined');
        } catch (error) {
          console.warn('Failed to play room joined sound:', error);
        }
        
        // Set the current player's ready status based on server data
        const currentUserId = user?.id?.toString();
        const currentPlayer = playersData.find((p: any) => p.userId === currentUserId);
        console.log('Current player found:', currentPlayer, 'for user ID:', currentUserId);
        setIsReady(currentPlayer?.isReady || false);
        console.log('Joined battle successfully, switching to waiting state');
        break;
        
      case 'player_joined':
        console.log('Player joined:', data.player);
        // Ensure player ID is string for consistency
        const newPlayer = {
          ...data.player,
          userId: data.player.userId?.toString()
        };
        setPlayers(prev => [...prev, newPlayer]);
        
        // Play player joined sound
        battleSoundManager.playSound('player_joined');
        
        toast({
          title: "Player Joined",
          description: `${data.player.userName} joined the battle!`,
        });
        break;
        
      case 'player_left':
        const leftPlayer = players.find(p => p.userId === data.userId);
        setPlayers(prev => prev.filter(p => p.userId !== data.userId));
        
        // Show notification when player leaves
        if (leftPlayer) {
          toast({
            title: "Player Left",
            description: `${leftPlayer.userName} has left the battle`,
            variant: "destructive",
            duration: 4000,
          });
        }
        
        // Check if only one player remains during active game
        const remainingPlayers = players.filter(p => p.userId !== data.userId);
        if (gameState === 'active' && remainingPlayers.length === 1) {
          // Show victory to remaining player
          const winner = remainingPlayers[0];
          const isCurrentUserWinner = winner.userId.toString() === user?.id?.toString();
          
          setTimeout(() => {
            setGameState('finished');
            setGameResults(remainingPlayers.map(p => ({ ...p, rank: 1 })));
            setShowFinalResults(true);
            
            if (isCurrentUserWinner) {
              // Victory celebration for the winner
              toast({
                title: "🏆 Victory by Default!",
                description: "You win! All opponents have left the battle.",
                duration: 8000,
              });
            }
          }, 1500);
        } else if (gameState === 'active' && remainingPlayers.length === 0) {
          // All players left - end the game
          setGameState('finished');
          setShowFinalResults(true);
          toast({
            title: "Game Ended",
            description: "All players have left the battle.",
            variant: "destructive",
            duration: 5000,
          });
        }
        break;
        
      case 'player_ready':
        console.log('Player ready event received:', data, 'Current user ID:', user?.id);
        setPlayers(prev => {
          const updated = prev.map(p => {
            const shouldUpdate = p.userId === data.userId || p.userId === data.userId.toString() || p.userId.toString() === data.userId;
            console.log(`Player ${p.userId} should update: ${shouldUpdate}, data.userId: ${data.userId}`);
            return shouldUpdate ? { ...p, isReady: true } : p;
          });
          console.log('Updated players after ready:', updated);
          return updated;
        });
        
        // Update local isReady state if this is the current user (handle both string and number comparison)
        const readyUserId = data.userId?.toString();
        const userIdForReady = user?.id?.toString();
        if (userIdForReady === readyUserId) {
          console.log('Setting local isReady to true for current user');
          setIsReady(true);
        }
        
        // Only play ready sound for current user, not for opponents
        if (readyUserId === user?.id?.toString()) {
          try {
            battleSoundManager.playSound('player_ready');
          } catch (error) {
            console.warn('Failed to play player ready sound:', error);
          }
        }
        break;
        
      case 'game_started':
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        setGameState('active');
        setCurrentQuestion(data.question);
        setQuestionNumber(data.questionNumber);
        setTotalQuestions(data.totalQuestions);
        setTimeRemaining(data.timeLimit ? data.timeLimit / 1000 : 30); // Use server-provided time limit
        setSelectedAnswer(null);
        setShowFiftyFifty(false);
        setEliminatedOptions([]);
        setHasAnswered(false);
        setWaitingForNextQuestion(false);
        setIsTimerWarning(false);
        questionStartTime.current = Date.now();
        startTimer();
        
        // Play game start sound and start background music with error handling
        try {
          battleSoundManager.playSound('game_started');
          setTimeout(() => {
            try {
              battleSoundManager.startBackgroundMusic();
            } catch (error) {
              console.warn('Failed to start background music:', error);
            }
          }, 500);
        } catch (error) {
          console.warn('Failed to play game started sound:', error);
        }
        break;
        
      case 'next_question':
        // Clear timer first to prevent conflicts
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Return to active game state and start next question
        setGameState('active');
        setCurrentQuestion(data.question);
        setQuestionNumber(data.questionNumber);
        setTimeRemaining(data.timeLimit ? data.timeLimit / 1000 : 30);
        setSelectedAnswer(null);
        setShowFiftyFifty(false);
        setEliminatedOptions([]);
        setHasAnswered(false);
        setWaitingForNextQuestion(false);
        setIsTimerWarning(false);
        setRankingAnimations({}); // Clear ranking animations
        questionStartTime.current = Date.now();
        startTimer();
        break;
        
      case 'answer_submitted':
        if (data.isCorrect) {
          const previousScore = myScore;
          const earnedPoints = data.points - previousScore;
          setMyScore(data.points);
          setLastAnswerPoints(earnedPoints);
          
          // Only play feedback sound for current user's own answers
          try {
            playAnswerFeedback(true);
          } catch (error) {
            console.warn('Failed to play correct answer sound:', error);
          }
          
          // Show real-time feedback for correct answer with earned points
          toast({
            title: "Correct! ✓",
            description: `+${earnedPoints} points`,
            duration: 2000,
          });
        } else {
          // Only play feedback sound for current user's own answers
          try {
            playAnswerFeedback(false);
          } catch (error) {
            console.warn('Failed to play incorrect answer sound:', error);
          }
          
          // Show feedback for incorrect answer - no points displayed
          console.log('Incorrect answer - playing buzzer sound');
          toast({
            title: "Incorrect ✗",
            description: `Correct answer: ${data.correctAnswer}`,
            variant: "destructive",
            duration: 3000,
          });
        }
        
        // Mark that we're waiting for next question after answer submission
        setHasAnswered(true);
        setWaitingForNextQuestion(true);
        
        // Clear the timer since we've answered
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        break;
        
      case 'live_rankings':
        // Update live rankings immediately as players answer - just update scores
        if (data.scores && data.scores.length > 0) {
          setCurrentScores(data.scores);
          
          // Don't play sounds for live ranking updates - these are opponent interactions
          setPlayers(prev => prev.map(p => {
            const updated = data.scores.find((s: any) => s.userId === p.userId);
            return updated ? { ...p, score: updated.score } : p;
          }));
        }
        break;
        
      case 'question_results':
        // Switch to rankings page after all players have answered or time expired
        if (data.scores && data.scores.length > 0) {
          // Calculate ranking changes for animations  
          const newRankingAnimations: {[userId: string]: 'up' | 'down' | 'same'} = {};
          data.scores.forEach((player: any, newIndex: number) => {
            const oldIndex = players.findIndex(p => p.userId === player.userId);
            if (oldIndex !== -1) {
              if (newIndex < oldIndex) {
                newRankingAnimations[player.userId.toString()] = 'up';
              } else if (newIndex > oldIndex) {
                newRankingAnimations[player.userId.toString()] = 'down';
              } else {
                newRankingAnimations[player.userId.toString()] = 'same';
              }
            } else {
              newRankingAnimations[player.userId.toString()] = 'same';
            }
          });
          setRankingAnimations(newRankingAnimations);
          
          setCurrentScores(data.scores);
          setPlayers(prev => prev.map(p => {
            const updated = data.scores.find((s: any) => s.userId === p.userId);
            return updated ? { ...p, score: updated.score } : p;
          }));
          
          // Switch to rankings page
          setGameState('rankings');
        }
        break;
        
      case 'game_finished':
        setGameState('finished');
        setGameResults(data.results);
        setPlayers(data.results);
        setShowFinalResults(true);
        
        // Auto-refresh battle statistics after match completion
        refetchBattleStats();
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        // Stop background music
        battleSoundManager.stopBackgroundMusic();
        
        // Enhanced victory handling with different completion reasons
        const myResult = data.results.find((r: any) => r.userId === user?.id);
        const completionReason = data.reason || 'quiz_complete';
        
        if (myResult) {
          const isVictory = myResult.rank === 1 || completionReason === 'all_players_left' || completionReason === 'last_player_standing';
          
          // Play appropriate sound
          if (isVictory) {
            playVictorySequence();
          } else {
            playDefeatSequence();
          }
          
          if (completionReason === 'all_players_left') {
            // Handle case where all other players left
            toast({
              title: "🏆 Victory by Default!",
              description: "You win! All opponents have left the battle.",
              duration: 8000,
            });
          } else if (completionReason === 'last_player_standing') {
            // Handle case where user is the last remaining player
            toast({
              title: "🏆 Victory by Default!",
              description: "You're the last player remaining!",
              duration: 8000,
            });
          } else if (myResult.rank === 1) {
            // Normal victory
            toast({
              title: "🎉 Victory!",
              description: `You finished in 1st place with ${myResult.score} points!`,
              duration: 6000,
            });
          } else {
            // Normal completion
            const rankSuffix = myResult.rank === 2 ? 'nd' : myResult.rank === 3 ? 'rd' : 'th';
            toast({
              title: `🏆 Battle Complete!`,
              description: `You finished in ${myResult.rank}${rankSuffix} place with ${myResult.score} points`,
              duration: 5000,
            });
          }
        }
        
        // Special celebration for quiz completion
        if (completionReason === 'quiz_complete' && data.results.length > 1) {
          setTimeout(() => {
            toast({
              title: "📊 Final Rankings",
              description: "All players have completed the quiz!",
              duration: 4000,
            });
          }, 2000);
        }
        break;
        
      case 'opponent_conceded':
        // Handle victory when opponent concedes in 2-player game
        const isWinner = data.winnerUserId?.toString() === user?.id?.toString();
        if (isWinner) {
          // Clear timer since game is over
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Play victory sound
          battleSoundManager.playSound('opponent_conceded');
          
          // Show victory message
          toast({
            title: "🎉 Victory!",
            description: data.message || "Your opponent conceded the match!",
            duration: 5000,
          });
          
          // Game will end via game_finished message shortly
        }
        break;
        
      case 'player_left_notification':
        // Handle notification when player leaves in multi-player game (3+ players)
        toast({
          title: "📢 Player Left",
          description: data.message || `A player left the battle. Game continues with ${data.remainingPlayers} players.`,
          duration: 4000,
        });
        
        // Update players list by removing the left player
        setPlayers(prev => prev.filter(p => p.userName !== data.playerName));
        // Game continues normally
        break;
        
      case 'powerup_activated':
        handlePowerUpActivated(data);
        break;
        
      case 'powerup_received':
        // Only apply effects if this user is the target
        if (data.targetUserId === user?.id?.toString()) {
          if (data.effect === 'screen_shake') {
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), data.duration);
            
            // Play sabotage sound only for the affected user
            try {
              battleSoundManager.playSound('sabotage_received');
            } catch (error) {
              console.warn('Failed to play sabotage sound:', error);
            }
            
            toast({
              title: "💥 Sabotaged!",
              description: "An opponent used sabotage on you!",
              variant: "destructive",
              duration: 2000,
            });
          }
        }
        break;

      case 'powerup_reward_offered':
        // Only show power-up selection for the current user
        if (data.userId === user?.id?.toString()) {
          const rewardPowerUps = data.options || [];
          setAvailablePowerUpRewards(rewardPowerUps);
          setShowPowerUpSelection(true);
          
          // Play power-up earned sound only for current user
          try {
            battleSoundManager.playSound('powerup_earned');
          } catch (error) {
            console.warn('Failed to play power-up earned sound:', error);
          }
          
          toast({
            title: data.reason === 'streak' ? "🔥 Streak Bonus!" : "⚡ Speed Bonus!",
            description: data.message,
          });
        }
        break;

      case 'powerup_reward_selected':
        // Only update state for the current user
        if (data.userId === user?.id?.toString()) {
          setAvailablePowerUps(prev => [...prev, data.powerUp]);
          setShowPowerUpSelection(false);
          setAvailablePowerUpRewards([]);
          
          // Play power-up activated sound only for current user
          try {
            battleSoundManager.playSound('powerup_activated');
          } catch (error) {
            console.warn('Failed to play power-up activated sound:', error);
          }
          
          toast({
            title: "Power-Up Added!",
            description: `${POWER_UPS.find(p => p.id === data.powerUp)?.name} ready to use!`,
            duration: 3000,
          });
        }
        break;



      case 'power_up_used':
        // Handle power-up usage notifications from other players
        if (data.userId !== user?.id?.toString()) {
          const powerUp = POWER_UPS.find(p => p.id === data.powerUpId);
          const player = players.find(p => p.userId === data.userId);
          
          if (powerUp && player) {
            toast({
              title: `${powerUp.icon} ${powerUp.name}`,
              description: `${player.userName} used ${powerUp.name}!`,
              duration: 2000,
            });
          }
        }
        break;

      default:
        console.log('Unhandled WebSocket message type:', type, data);
        break;
    }
  };

  // Handle power-up activation events
  const handlePowerUpActivated = (data: any) => {
    // Add visual effects or notifications for power-up activations
    const powerUp = POWER_UPS.find(p => p.id === data.powerUpId);
    if (powerUp) {
      setPowerUpAnimations(prev => ({
        ...prev,
        [data.powerUpId]: 'activate'
      }));
      
      setTimeout(() => {
        setPowerUpAnimations(prev => {
          const newAnimations = {...prev};
          delete newAnimations[data.powerUpId];
          return newAnimations;
        });
      }, 2000);
    }
  };



  const calculateRankingChanges = (newScores: any[]) => {
    const animations: {[key: string]: string} = {};
    
    // Compare with previous rankings to show changes
    players.forEach(player => {
      const oldRank = players
        .sort((a, b) => b.score - a.score)
        .findIndex(p => p.userId === player.userId) + 1;
      
      const newRank = newScores
        .sort((a, b) => b.score - a.score)
        .findIndex(s => s.userId === player.userId) + 1;
      
      if (newRank < oldRank) {
        animations[player.userId] = 'rank-up';
      } else if (newRank > oldRank) {
        animations[player.userId] = 'rank-down';
      }
    });
    
    return animations;
  };

  const playAnswerFeedback = (isCorrect: boolean) => {
    try {
      if (isCorrect) {
        battleSoundManager.playSound('correct_answer');
      } else {
        battleSoundManager.playSound('wrong_answer');
      }
    } catch (error) {
      console.warn('Failed to play answer feedback sound:', error);
    }
  };

  const playVictorySequence = () => {
    try {
      battleSoundManager.playSound('victory');
      setTimeout(() => {
        try {
          battleSoundManager.playSound('applause');
        } catch (error) {
          console.warn('Failed to play applause sound:', error);
        }
      }, 1000);
    } catch (error) {
      console.warn('Failed to play victory sound:', error);
    }
  };

  const playDefeatSequence = () => {
    try {
      battleSoundManager.playSound('defeat');
    } catch (error) {
      console.warn('Failed to play defeat sound:', error);
    }
  };





  // Question submission handler with power-up integration
  const handleAnswerSubmit = (answer: string | null) => {
    if (hasAnswered || waitingForNextQuestion) return;
    
    const timeSpent = Date.now() - questionStartTime.current;
    setHasAnswered(true);
    setSelectedAnswer(answer);
    
    // Apply active power-up effects to scoring
    let finalPoints = 0;
    const basePoints = currentQuestion ? 100 : 0;
    
    const isCorrect = answer === currentQuestion?.correctAnswer;
    
    if (isCorrect) {
      finalPoints = applyActivePowerUpEffects(basePoints, true);
      setCorrectAnswerStreak(prev => prev + 1);
      
      // Check trigger-based power-up rewards
      checkPowerUpTriggers(true, timeSpent, true);
      
      // Check for power-up rewards based on performance
      checkPerformanceForPowerUpReward(true, timeSpent);
    } else {
      // Apply power-up effects for wrong answers (mainly to reset score multiplier)
      applyActivePowerUpEffects(0, false);
      
      // Check trigger-based power-up rewards
      checkPowerUpTriggers(false, timeSpent, false);
      
      // Handle streak protector
      if (streakProtectorActive) {
        setStreakProtectorActive(false);
        // Don't reset streak
        toast({
          title: "🛡️ Streak Protected!",
          description: "Your streak continues!",
          duration: 2000,
        });
      } else {
        setCorrectAnswerStreak(0);
      }
      
      // Handle second chance
      if (secondChanceAvailable && !answer) {
        setSecondChanceAvailable(false);
        setHasAnswered(false);
        toast({
          title: "🔄 Second Chance!",
          description: "Try again!",
          duration: 2000,
        });
        return;
      }
    }
    
    // Update answer times for competitive analysis
    setLastAnswerTimes(prev => ({
      ...prev,
      [user?.id?.toString() || '']: timeSpent
    }));
    
    // Submit answer to server
    if (wsRef.current && !isDemo) {
      wsRef.current.send(JSON.stringify({
        type: 'submit_answer',
        data: {
          roomCode: currentRoom?.roomCode,
          userId: user?.id.toString(),
          answer,
          timeSpent,
          finalPoints
        }
      }));
    } else if (isDemo) {
      // Handle demo mode locally
      setTimeout(() => {
        if (answer === currentQuestion?.correctAnswer) {
          setMyScore(prev => prev + finalPoints);
          setLastAnswerPoints(finalPoints);
          playAnswerFeedback(true);
          
          toast({
            title: "Correct! ✓",
            description: `+${finalPoints} points`,
            duration: 2000,
          });
        } else {
          playAnswerFeedback(false);
          toast({
            title: "Incorrect ✗",
            description: `Correct answer: ${currentQuestion?.correctAnswer}`,
            variant: "destructive",
            duration: 3000,
          });
        }
        
        // Continue to next question in demo
        setTimeout(() => {
          if (questionNumber < totalQuestions) {
            // Load next question
            setQuestionNumber(prev => prev + 1);
            setSelectedAnswer(null);
            setHasAnswered(false);
            setWaitingForNextQuestion(false);
            setTimeRemaining(30);
            questionStartTime.current = Date.now();
            startTimer();
            
            // Reset power-up effects
            setShowFiftyFifty(false);
            setEliminatedOptions([]);
          } else {
            // End demo
            setGameState('finished');
            setShowFinalResults(true);
          }
        }, 2000);
      }, 1000);
    }
  };

  // Initialize game systems
  useEffect(() => {
    // Initialize sound system with error handling
    try {
      battleSoundManager.setSoundEnabled(soundEnabled);
      battleSoundManager.setMasterVolume(masterVolume);
    } catch (error) {
      console.warn('Sound system initialization failed:', error);
    }
    
    // Cleanup on unmount
    return () => {
      try {
        battleSoundManager.cleanup();
      } catch (error) {
        console.warn('Sound cleanup failed:', error);
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update sound settings when they change
  useEffect(() => {
    try {
      battleSoundManager.setSoundEnabled(soundEnabled);
    } catch (error) {
      console.warn('Failed to update sound enabled state:', error);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      battleSoundManager.setMasterVolume(masterVolume);
    } catch (error) {
      console.warn('Failed to update master volume:', error);
    }
  }, [masterVolume]);

  // Comprehensive power-up system starts here - implementing all required functionality
  
  // Power-up UI state and handlers for floating components and bottom drawer


  // Apply power-up effects immediately when activated
  const applyPowerUpEffect = (powerUpId: string) => {
    console.log('Applying power-up effect immediately:', powerUpId);
    
    switch (powerUpId) {
      case 'fifty_fifty':
        if (currentQuestion) {
          const correctAnswer = currentQuestion.correctAnswer;
          const options = ['A', 'B', 'C', 'D'];
          const wrongOptions = options.filter(opt => opt !== correctAnswer);
          const eliminated = wrongOptions.slice(0, 2);
          setEliminatedOptions(eliminated);
          setShowFiftyFifty(true);
        }
        break;
        
      case 'time_freeze':
        setTimeRemaining(prev => prev + 10);
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 5000);
        break;
        
      case 'extra_time':
        setTimeRemaining(prev => prev + 15);
        break;
        
      case 'afterburner':
        setAfterburnerActive(true);
        break;
        
      case 'circuit_swap':
        if (currentQuestion) {
          const correctOpt = currentQuestion.correctAnswer;
          const opts = ['A', 'B', 'C', 'D'];
          const wrongOpts = opts.filter(opt => 
            opt !== correctOpt && !eliminatedOptions.includes(opt)
          );
          if (wrongOpts.length > 0) {
            const swapOption = wrongOpts[0];
            setEliminatedOptions(prev => [...prev, swapOption]);
          }
        }
        break;
        
      case 'hydraulic_boost':
        const newScore = myScore + 500;
        setMyScore(newScore);
        setPlayerScore(newScore);
        
        // Update rankings immediately when hydraulic boost is used
        if (!isDemo && wsRef.current && currentRoom) {
          wsRef.current.send(JSON.stringify({
            type: 'score_update',
            data: {
              userId: user?.id.toString(),
              newScore: newScore,
              roomCode: currentRoom.roomCode
            }
          }));
        }
        
        toast({ title: "🔧 Hydraulic Boost!", description: "Instant +500 points added!" });
        break;
        
      case 'speed_boost':
        setActivePowerUpEffects(prev => ({
          ...prev,
          speed_boost: { multiplier: 2, usesLeft: 1 }
        }));
        toast({ title: "⚡ Speed Boost!", description: "Double points for next correct answer" });
        break;
        
      case 'score_multiplier':
        setActivePowerUpEffects(prev => ({
          ...prev,
          score_multiplier: { multiplier: 3, usesLeft: 2 }
        }));
        toast({ title: "📈 Score Multiplier!", description: "3x points for next two correct answers" });
        break;
        
      case 'streak_protector':
        setStreakProtectorActive(true);
        toast({ title: "⭐ Streak Protector!", description: "Next wrong answer won't break your streak" });
        break;
        
      case 'second_chance':
        setSecondChanceAvailable(true);
        toast({ title: "🔄 Second Chance!", description: "You can retry if you get the next question wrong" });
        break;
        
      case 'sabotage':
        if (!isDemo && wsRef.current) {
          // Send sabotage to random opponent
          wsRef.current.send(JSON.stringify({
            type: 'sabotage_attack',
            data: {
              userId: user?.id.toString(),
              roomCode: createdRoom?.roomCode
            }
          }));
        }
        break;
        
      default:
        console.warn('Unknown power-up effect:', powerUpId);
    }
  };

  // Comprehensive power-up activation with real-time sync
  const activatePowerUp = async (powerUpId: string) => {
    if (!powerUpInventory.includes(powerUpId) || activePowerUps.includes(powerUpId)) return;
    
    console.log('Activating power-up:', powerUpId);
    
    // Remove from inventory and add to active
    setPowerUpInventory(prev => {
      const newInventory = [...prev];
      const index = newInventory.indexOf(powerUpId);
      if (index > -1) {
        newInventory.splice(index, 1);
      }
      return newInventory;
    });
    
    setActivePowerUps(prev => [...prev, powerUpId]);
    
    // Play power-up sound
    try {
      battleSoundManager.playSound('powerup_activated');
    } catch (error) {
      console.warn('Failed to play power-up activation sound:', error);
    }
    
    // Apply power-up effect immediately
    applyPowerUpEffect(powerUpId);
    
    // Send to server for multiplayer
    if (!isDemo && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'power_up_used',
        data: {
          userId: user?.id.toString(),
          powerUpId: powerUpId
        }
      }));
    }
    
    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
    toast({
      title: `${powerUp?.icon} ${powerUp?.name} Activated!`,
      description: "Effect applied instantly - check your advantages!",
      duration: 2500,
    });
  };

  // Add admin testing panel functionality
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPowerUpToTest, setAdminPowerUpToTest] = useState<string>('');

  const testPowerUpInAdmin = (powerUpId: string) => {
    setPowerUpInventory(prev => [...prev, powerUpId]);
    toast({
      title: "Admin Test",
      description: `${POWER_UPS.find(p => p.id === powerUpId)?.name} added for testing`,
      duration: 2000,
    });
  };



  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setHasAnswered(false);
    setWaitingForNextQuestion(false);
    setIsTimerWarning(false);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        // Timer warning for last 5 seconds
        if (prev <= 5 && prev > 0 && !isTimerWarning) {
          setIsTimerWarning(true);
          try {
            battleSoundManager.playSound('timer_warning');
          } catch (error) {
            console.warn('Failed to play timer warning sound:', error);
          }
        }
        
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Play time up sound and stop background music momentarily
          try {
            battleSoundManager.playSound('time_up');
          } catch (error) {
            console.warn('Failed to play time up sound:', error);
          }
          
          // Time up - player missed the question, wait for server to advance
          setWaitingForNextQuestion(true);
          toast({
            title: "Time's Up!",
            description: "Waiting for next question...",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [toast]);



  // Power-up effect handlers system
  const handlePowerUpEffects = (effectData: any) => {
    const { powerUpType, activatorId, isCurrentUserActivator } = effectData;
    
    // Handle different power-up effects with real-time sync
    switch (powerUpType) {
      case 'fifty_fifty':
        if (isCurrentUserActivator && currentQuestion) {
          const options = ['A', 'B', 'C', 'D'];
          const incorrectOptions = options.filter(opt => opt !== currentQuestion.correctAnswer);
          const toEliminate = incorrectOptions.slice(0, 2);
          setEliminatedOptions(toEliminate);
          setShowFiftyFifty(true);
        }
        break;
      case 'time_freeze':
        if (timerRef.current) {
          clearInterval(timerRef.current);
          setTimeout(() => startTimer(), 5000);
        }
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 5000);
        break;
      case 'speed_boost':
        if (isCurrentUserActivator) {
          setActivePowerUps(prev => [...prev, 'speed_boost']);
          setTimeout(() => {
            setActivePowerUps(prev => prev.filter(p => p !== 'speed_boost'));
          }, 30000);
        }
        break;

      case 'extra_time':
        if (isCurrentUserActivator) {
          setTimeRemaining(prev => prev + 10);
        }
        break;
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    // Prevent multiple selections or selections after time is up
    if (hasAnswered || waitingForNextQuestion || gameState !== 'active' || timeRemaining <= 0) return;
    

    
    // Stop the timer immediately when answer is selected
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    setWaitingForNextQuestion(true);
    // Audio feedback for selection
    
    // Add visual feedback animation
    const element = document.querySelector(`[data-answer="${answer}"]`);
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => element.classList.remove('animate-pulse'), 300);
    }
    
    const timeSpent = Date.now() - questionStartTime.current;
    
    // Universal scoring system - applies to both demo and multiplayer modes
    const isCorrect = answer === currentQuestion?.correctAnswer;
    const timeElapsed = (timeSpent / 1000); // Convert to seconds
    let points = 0;
    
    // New time-based scoring system
    if (isCorrect) {
      if (timeElapsed <= 20) {
        points = 150; // 150 points if answered correctly within 20 seconds (fastest tier)
      } else if (timeElapsed <= 25) {
        points = 100; // 100 points if answered correctly within 25 seconds (medium tier)
      } else {
        points = 50; // 50 points for the rest of the remaining time if answered correctly
      }
      
      // Apply power-up multipliers
      const speedMultiplier = activePowerUpEffects.speed_boost?.multiplier || 1;
      const scoreMultiplier = activePowerUpEffects.score_multiplier?.multiplier || 1;
      
      // Apply Afterburner bonus (+50%)
      if (afterburnerActive) {
        points = Math.round(points * 1.5);
        setAfterburnerActive(false);
        setAvailablePowerUps(prev => prev.filter(p => p !== 'afterburner'));
        toast({
          title: "🚀 Afterburner Applied!",
          description: `+50% bonus! Base ${Math.round(points / 1.5)} → ${points} points`,
          duration: 3000,
        });
      }
      
      // Apply speed and score multipliers
      points = Math.round(points * speedMultiplier * scoreMultiplier);
      
      setPlayerScore(prev => prev + points);
      setMyScore(prev => prev + points);
      setLastAnswerPoints(points);
      
      // Update fastest answer time
      if (timeElapsed < fastestAnswerTime) {
        setFastestAnswerTime(timeElapsed);
      }
      
      // Reduce active power-up effects
      if (activePowerUpEffects.speed_boost) {
        setActivePowerUpEffects(prev => ({
          ...prev,
          speed_boost: {
            ...prev.speed_boost,
            questionsLeft: prev.speed_boost.questionsLeft - 1
          }
        }));
        if (activePowerUpEffects.speed_boost.questionsLeft <= 1) {
          setActivePowerUpEffects(prev => {
            const newEffects = { ...prev };
            delete newEffects.speed_boost;
            return newEffects;
          });
          setActivePowerUps(prev => prev.filter(p => p !== 'speed_boost'));
        }
      }
      
      if (activePowerUpEffects.score_multiplier) {
        setActivePowerUpEffects(prev => ({
          ...prev,
          score_multiplier: {
            ...prev.score_multiplier,
            questionsLeft: prev.score_multiplier.questionsLeft - 1
          }
        }));
        if (activePowerUpEffects.score_multiplier.questionsLeft <= 1) {
          setActivePowerUpEffects(prev => {
            const newEffects = { ...prev };
            delete newEffects.score_multiplier;
            return newEffects;
          });
          setActivePowerUps(prev => prev.filter(p => p !== 'score_multiplier'));
        }
      }
    }
    
    if (isDemo || isInDemoMode) {
      // Demo mode specific handling
      
      // Check trigger-based power-up rewards
      const wasFirstToAnswer = true; // In demo mode, assume player is always first
      checkPowerUpTriggers(isCorrect, timeSpent, wasFirstToAnswer);
      
      // Check performance for additional power-up rewards
      checkPerformanceForPowerUpReward(isCorrect, timeSpent);
      
      // Update power-up tracking
      if (isCorrect) {
        setLastAnswerTime(timeSpent);
        
        // Apply active power-up effects
        applyActivePowerUpEffects(points, isCorrect);
      } else {
        // Reset points display for wrong answers
        setLastAnswerPoints(0);
        
        // Handle incorrect answer with defense power-ups
        if (streakProtectorActive) {
          setStreakProtectorActive(false);
          toast({
            title: "⭐ Streak Protected!",
            description: "Your streak wasn't broken by this wrong answer!",
            duration: 3000,
          });
        } else {
          setCorrectAnswerStreak(0);
        }
        
        // Check for second chance
        if (secondChanceAvailable) {
          setSecondChanceAvailable(false);
          setHasAnswered(false);
          setSelectedAnswer(null);
          setWaitingForNextQuestion(false);
          
          // Restart timer
          setTimeRemaining(30);
          questionStartTime.current = Date.now();
          
          toast({
            title: "🔄 Second Chance!",
            description: "Try again! Timer restarted.",
            duration: 3000,
          });
          return; // Exit early to allow retry
        }
      }
      
      // Simulate opponent scoring for demo
      if (isCorrect) {
        const opponentTime = Math.random() * 6 + 2; // 2-8 seconds
        let opponentPoints = 0;
        if (opponentTime < 3) {
          opponentPoints = 1000;
        } else if (opponentTime <= 8) {
          opponentPoints = Math.round(800 - ((opponentTime - 3) / 5) * 400);
        }
        setOpponentScore(prev => prev + opponentPoints);
      }
      
      // Enhanced notification system with proper score feedback
      if (isCorrect && points > 0) {
        let speedTier = "";
        let multiplierInfo = "";
        
        // Determine speed tier
        if (timeElapsed <= 20) {
          speedTier = "Lightning Fast! ⚡";
        } else if (timeElapsed <= 25) {
          speedTier = "Good Speed! 🎯";
        } else {
          speedTier = "Correct! ✅";
        }
        
        // Show multiplier info if active
        const totalMultiplier = (activePowerUpEffects.speed_boost?.multiplier || 1) * (activePowerUpEffects.score_multiplier?.multiplier || 1);
        if (totalMultiplier > 1) {
          multiplierInfo = ` (x${totalMultiplier} multiplier applied!)`;
        }
        
        toast({
          title: speedTier,
          description: `+${points} points added to your score${multiplierInfo}`,
          duration: 3000,
        });
      } else if (isCorrect) {
        toast({
          title: "Correct but too slow!",
          description: "Answer faster for more points",
          duration: 2500,
        });
      } else {
        // Wrong answer - no points awarded, no plus points display
        toast({
          title: "Incorrect ❌",
          description: `Correct answer was ${currentQuestion?.correctAnswer}`,
          variant: "destructive",
          duration: 3000,
        });
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Show answer feedback, then wait for manual next question or automatic progression
      setTimeout(() => {
        if (questionNumber < totalQuestions) {
          const nextQuestionNum = questionNumber + 1;
          setQuestionNumber(nextQuestionNum);
          loadNextDemoQuestion(nextQuestionNum);
          setSelectedAnswer(null);
          setShowFiftyFifty(false);
          setEliminatedOptions([]);
          setTimeRemaining(30); // Demo mode uses 30 seconds
          setHasAnswered(false);
          setWaitingForNextQuestion(false);
          setIsTimerWarning(false);
          questionStartTime.current = Date.now();
          startTimer();
        } else {
          // End demo game
          setGameState('finished');
          // Results are handled by the new results screen
        }
      }, 2000); // Reduced to 2 seconds
    } else {
      // Real multiplayer mode - apply same comprehensive logic as demo
      
      // Check trigger-based power-up rewards
      const wasFirstToAnswer = true; // Assume first until ranking data arrives
      checkPowerUpTriggers(isCorrect, timeSpent, wasFirstToAnswer);
      
      // Check performance for additional power-up rewards
      checkPerformanceForPowerUpReward(isCorrect, timeSpent);
      
      // Update power-up tracking and handle streaks
      if (isCorrect) {
        setLastAnswerTime(timeSpent);
        
        // Apply active power-up effects
        applyActivePowerUpEffects(points, isCorrect);
      } else {
        // Reset points display for wrong answers
        setLastAnswerPoints(0);
        
        // Handle incorrect answer with defense power-ups
        if (streakProtectorActive) {
          setStreakProtectorActive(false);
          toast({
            title: "⭐ Streak Protected!",
            description: "Your streak wasn't broken by this wrong answer!",
            duration: 3000,
          });
        } else {
          setCorrectAnswerStreak(0);
        }
        
        // Check for second chance
        if (secondChanceAvailable) {
          setSecondChanceAvailable(false);
          setHasAnswered(false);
          setSelectedAnswer(null);
          setWaitingForNextQuestion(false);
          
          // Restart timer
          setTimeRemaining(30);
          questionStartTime.current = Date.now();
          
          toast({
            title: "🔄 Second Chance!",
            description: "Try again! Timer restarted.",
            duration: 3000,
          });
          return; // Exit early to allow retry
        }
      }
      
      // Enhanced notification system with proper score feedback
      if (isCorrect && points > 0) {
        let speedTier = "";
        let multiplierInfo = "";
        
        // Determine speed tier
        if (timeElapsed <= 20) {
          speedTier = "Lightning Fast! ⚡";
        } else if (timeElapsed <= 25) {
          speedTier = "Good Speed! 🎯";
        } else {
          speedTier = "Correct! ✅";
        }
        
        // Show multiplier info if active
        const totalMultiplier = (activePowerUpEffects.speed_boost?.multiplier || 1) * (activePowerUpEffects.score_multiplier?.multiplier || 1);
        if (totalMultiplier > 1) {
          multiplierInfo = ` (x${totalMultiplier} multiplier applied!)`;
        }
        
        toast({
          title: speedTier,
          description: `+${points} points added to your score${multiplierInfo}`,
          duration: 3000,
        });
      } else if (isCorrect) {
        toast({
          title: "Correct but too slow!",
          description: "Answer faster for more points",
          duration: 2500,
        });
      } else {
        // Wrong answer - no points awarded, no plus points display
        toast({
          title: "Incorrect ❌",
          description: `Correct answer was ${currentQuestion?.correctAnswer}`,
          variant: "destructive",
          duration: 3000,
        });
      }
      
      // Real multiplayer mode specific handling
      wsRef.current?.send(JSON.stringify({
        type: 'submit_answer',
        data: {
          roomCode: createdRoom?.roomCode,
          userId: user?.id.toString(),
          answer,
          timeSpent
        }
      }));
    }
  };

  const handleConcede = () => {
    setShowExitDialog(false);
    
    // Clean up timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Immediately set to lobby to prevent WebSocket reconnection
    setGameState('lobby');
    
    // Close WebSocket connection immediately
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (!isDemo) {
        // Send concede message for real multiplayer mode
        wsRef.current.send(JSON.stringify({
          type: 'concede_match',
          data: {
            roomCode: createdRoom?.roomCode,
            userId: user?.id.toString()
          }
        }));
      }
      
      // Close WebSocket with clean close code
      wsRef.current.close(1000, 'User exited battle');
      wsRef.current = null;
    }
    
    if (isDemo) {
      toast({
        title: "Demo Ended",
        description: "Thanks for trying battle mode!",
        variant: "default",
      });
    } else {
      toast({
        title: "Battle Exited",
        description: "You have left the battle room",
        variant: "destructive",
      });
    }
    
    // Reset all game state immediately
    setCurrentQuestion(null);
    setPlayers([]);
    setGameResults([]);
    setCreatedRoom(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setWaitingForNextQuestion(false);
    setIsTimerWarning(false);
    setAvailablePowerUps([]);
    setTimeRemaining(15);
    setMyScore(0);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setCurrentRoomCode('');
    setReconnectAttempts(0);
    setWebSocketConnected(false);
    setStreakProtectorActive(false);
    setSecondChanceAvailable(false);
    setActivePowerUpEffects({});
    
    // Clear any existing WebSocket message handlers to prevent further processing
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
    }
    
    // Also clear any power-up states
    setShowFiftyFifty(false);
    setEliminatedOptions([]);
    setIsScreenShaking(false);
    setShowPowerUpSelection(false);
    setAvailablePowerUpRewards([]);
    setShowFinalResults(false);
    // Power-ups remain available for multiple uses
  };

  const handleThemeChange = (theme: BattleTheme) => {
    setCurrentTheme(theme);
    applyBattleTheme(theme);
  };

  const showRankingUpdate = (newScores: BattlePlayer[]) => {
    setPreviousRankings([...players]);
    setPlayers(newScores);
    setShowRankingAnimation(true);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowRankingAnimation(false);
    }, 3000);
  };

  // Enhanced power-up earning system
  const checkPerformanceForPowerUpReward = (isCorrect: boolean, timeSpent: number) => {
    const timeElapsed = timeSpent / 1000; // Convert to seconds
    
    if (isCorrect) {
      // Fast answer streak (for Afterburner)
      if (timeElapsed < 4) {
        const newFastStreak = fastCorrectStreak + 1;
        setFastCorrectStreak(newFastStreak);
        
        if (newFastStreak >= 2 && !availablePowerUps.includes('afterburner') && availablePowerUps.length < 5) {
          setAvailablePowerUps(prev => [...prev, 'afterburner']);
          setFastCorrectStreak(0);
          toast({
            title: "⚡ Afterburner Earned!",
            description: "2 fast correct answers! +50% next points",
          });
        }
      } else {
        setFastCorrectStreak(0);
      }
      
      // Correct answer streak (for random power-up)
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      
      if (newStreak >= 3 && availablePowerUps.length < 5) {
        const availablePowerUpTypes = ['fifty_fifty', 'extra_time', 'streak_protector', 'second_chance'];
        const validPowerUps = availablePowerUpTypes.filter(p => 
          !powerUpInventory.includes(p)
        );
        
        if (validPowerUps.length > 0) {
          const randomPowerUp = validPowerUps[Math.floor(Math.random() * validPowerUps.length)];
          setAvailablePowerUps(prev => [...prev, randomPowerUp]);
          setCorrectStreak(0);
          
          const powerUpData = POWER_UPS.find(p => p.id === randomPowerUp);
          toast({
            title: "🎯 Streak Bonus!",
            description: `${powerUpData?.name || randomPowerUp} earned!`,
          });
        }
      }
      
      // Comeback mechanic (if 2000+ pts behind, once per game)
      if (!comebackUsed && (opponentScore - playerScore >= 2000) && availablePowerUps.length < 5) {
        if (Math.random() < 0.25) { // 25% chance
          const availablePowerUpTypes = ['hydraulic_boost', 'afterburner', 'double_tap'];
          const validPowerUps = availablePowerUpTypes.filter(p => !availablePowerUps.includes(p));
          
          if (validPowerUps.length > 0) {
            const randomPowerUp = validPowerUps[Math.floor(Math.random() * validPowerUps.length)];
            setAvailablePowerUps(prev => [...prev, randomPowerUp]);
            setComebackUsed(true);
            toast({
              title: "💪 Comeback Power-Up!",
              description: "Fighting back from behind!",
            });
          }
        }
      }
    } else {
      // Reset streaks on incorrect answer
      setCorrectStreak(0);
      setFastCorrectStreak(0);
    }
  };





  const handlePowerUpUse = (powerUpType: string) => {
    if (!availablePowerUps.includes(powerUpType) || !currentQuestion || hasAnswered || waitingForNextQuestion) return;
    
    console.log('Using power-up:', powerUpType);
    
    // Power-up can be used multiple times - keep it available
    
    // Play power-up activation sound
    try {
      battleSoundManager.playSound('powerup_activated');
    } catch (error) {
      console.warn('Failed to play power-up activation sound:', error);
    }
    
    // Power-up activation feedback
    
    switch (powerUpType) {
      // Support Arsenal
      case 'fifty_fifty':
        const correctAnswer = currentQuestion.correctAnswer;
        const options = ['A', 'B', 'C', 'D'];
        const wrongOptions = options.filter(opt => opt !== correctAnswer);
        const eliminated = wrongOptions.slice(0, 2);
        setEliminatedOptions(eliminated);
        setShowFiftyFifty(true);
        toast({ title: "🔍 FiftyFifty Activated!", description: "Two wrong answers eliminated" });
        break;
        
      case 'extra_time':
        setTimeRemaining(prev => prev + 15);
        toast({ title: "➕ Extra Time!", description: "+15 seconds added to your timer" });
        break;
        

        

        
      // Boost Arsenal
      case 'speed_boost':
        setActivePowerUpEffects(prev => ({
          ...prev,
          speed_boost: { multiplier: 2, usesLeft: 1 }
        }));
        toast({ title: "⚡ Speed Boost!", description: "Double points for next correct answer" });
        break;
        
      case 'score_multiplier':
        setActivePowerUpEffects(prev => ({
          ...prev,
          score_multiplier: { multiplier: 3, usesLeft: 2 }
        }));
        toast({ title: "📈 Score Multiplier!", description: "3x points for next two correct answers" });
        break;
        
      case 'hydraulic_boost':
        const newScore = myScore + 500;
        setMyScore(newScore);
        setPlayerScore(newScore);
        
        // Update rankings immediately when hydraulic boost is used
        if (!isDemo && wsRef.current && currentRoom) {
          wsRef.current.send(JSON.stringify({
            type: 'score_update',
            data: {
              userId: user?.id.toString(),
              newScore: newScore,
              roomCode: currentRoom.roomCode
            }
          }));
        }
        
        toast({ title: "🔧 Hydraulic Boost!", description: "Instant +500 points added!" });
        break;
        

        
      case 'streak_protector':
        setStreakProtectorActive(true);
        toast({ title: "⭐ Streak Protector!", description: "Next wrong answer won't break your streak" });
        break;
        
      case 'second_chance':
        setSecondChanceAvailable(true);
        toast({ title: "🔄 Second Chance!", description: "You can retry if you get the next question wrong" });
        break;
        
      case 'sabotage':
        if (!isDemo) {
          toast({ title: "Sabotage Sent!", description: "Opponent's screen is shaking!" });
        }
        break;
    }
    
    // Track power-up usage
    setPowerUpsUsedCount(prev => prev + 1);
    
    // Send to other players if in multiplayer mode
    if (!isDemo && !isInDemoMode) {
      wsRef.current?.send(JSON.stringify({
        type: 'use_powerup',
        data: {
          roomCode: createdRoom?.roomCode,
          userId: user?.id.toString(),
          powerUpType
        }
      }));
    }
  };

  const handlePlayerReady = async () => {
    console.log('handlePlayerReady called for user:', user?.id);
    setIsReady(true);
    

    
    // Send ready message to server
    const message = {
      type: 'player_ready',
      data: {
        roomCode: createdRoom?.roomCode || currentRoom?.roomCode,
        userId: user?.id.toString()
      }
    };
    console.log('Sending player ready message:', message);
    wsRef.current?.send(JSON.stringify(message));
  };

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: any) => {
      const response = await apiRequest("POST", "/api/battle/rooms", roomData);
      return response.json();
    },
    onSuccess: (room) => {
      console.log('Room created successfully:', room);
      setCreatedRoom(room);
      setShowRoomDialog(true);
      // Connect to WebSocket after room creation
      setTimeout(() => {
        connectWebSocket(room.roomCode);
      }, 500);
      toast({
        title: "Room Created!",
        description: `Room code: ${room.roomCode}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (roomCode: string) => {
      const response = await apiRequest("POST", `/api/battle/rooms/${roomCode}/join`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join room');
      }
      return response.json();
    },
    onSuccess: (data, roomCode) => {
      console.log('Successfully joined room:', roomCode, data);
      setCreatedRoom(data.room || { roomCode, id: Date.now() });
      setShowRoomDialog(true);
      // Connect to WebSocket after successful join
      setTimeout(() => {
        connectWebSocket(roomCode);
      }, 500);
      toast({
        title: "Joined Room!",
        description: "You have successfully joined the battle room.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to join room:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join room. Please check the room code.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = () => {
    // Auto-select random category if none selected
    const categoryArray = Array.isArray(categories) ? categories : [];
    const finalCategory = selectedCategory || categoryArray[Math.floor(Math.random() * categoryArray.length)]?.id || 26;
    const categoryData = categoryArray.find((c: any) => c.id === finalCategory);
    
    setBattleCategory(categoryData);
    setShowFlashcard(true);
    
    // Start battle after flashcard display
    setTimeout(() => {
      setShowFlashcard(false);
      createRoomMutation.mutate({
        gameMode,
        categoryId: finalCategory,
        subtopicIds: selectedSubtopics,
        questionCount,
        maxPlayers,
      });
    }, 3000);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code.",
        variant: "destructive",
      });
      return;
    }
    joinRoomMutation.mutate(roomCode.toUpperCase());
  };



  // Demo Battle functionality for Admin
  const handleDemoStart = () => {
    // Auto-select random category if none selected
    const categoryArray = Array.isArray(categories) ? categories : [];
    const finalCategory = selectedCategory || categoryArray[Math.floor(Math.random() * categoryArray.length)]?.id || 26;
    const categoryData = categoryArray.find((c: any) => c.id === finalCategory);
    
    setBattleCategory(categoryData);
    setShowFlashcard(true);
    
    toast({
      title: "Demo Battle Started",
      description: `Category: ${categoryData?.name || 'Aviation Questions'}`,
    });

    // Start demo game after flashcard display
    setTimeout(() => {
      setShowFlashcard(false);
      setGameState('waiting');
      setPlayers([
        {
          userId: user?.id || 1,
          userName: `${user?.firstName} ${user?.lastName}`.trim() || 'Admin',
          score: 0,
          rank: 1,
          isReady: true,
          correctAnswers: 0,
          totalAnswered: 0,
          isHost: true,
          isActive: true
        },
        {
          userId: 'ai-bot' as any,
          userName: 'AI Opponent',
          score: 0,
          rank: 2,
          isReady: true,
          correctAnswers: 0,
          totalAnswered: 0,
          isHost: false,
          isActive: true
        }
      ]);

      // Start demo game after 2 seconds
      setTimeout(() => {
        setGameState('active');
        setTotalQuestions(10);
        setQuestionNumber(1);
        // Start with NO power-ups - they must be earned through performance
        
        // Load first demo question
        loadNextDemoQuestion(1);
        
        setTimeRemaining(30);
        questionStartTime.current = Date.now();
        startTimer();
        
        // Simulate AI opponent answering after random delay
        setTimeout(() => {
          setPlayers(prev => prev.map(p => 
            (p.userId as any) === 'ai-bot' ? { ...p, score: Math.floor(Math.random() * 50) + 10 } : p
          ));
        }, Math.random() * 10000 + 8000);
      }, 2000);
    }, 3000);
  };

  // Load next demo question with realistic aviation content
  const loadNextDemoQuestion = (questionNum?: number) => {
    const currentQ = questionNum ? questionNum - 1 : questionNumber - 1;
    const demoQuestions = [
      {
        id: 1,
        questionText: "What is the maximum takeoff weight for a standard Cessna 172?",
        optionA: "2,450 lbs",
        optionB: "2,300 lbs", 
        optionC: "2,550 lbs",
        optionD: "2,400 lbs",
        correctAnswer: "A",
        explanation: "The Cessna 172 has a maximum takeoff weight of 2,450 lbs."
      },
      {
        id: 2,
        questionText: "What type of engine does a Boeing 737 typically use?",
        optionA: "Turboprop",
        optionB: "Turbofan",
        optionC: "Turbojet",
        optionD: "Piston",
        correctAnswer: "B",
        explanation: "The Boeing 737 uses turbofan engines for efficient fuel consumption and reduced noise."
      },
      {
        id: 3,
        questionText: "What is the standard approach speed for most light aircraft?",
        optionA: "1.3 times stall speed",
        optionB: "1.5 times stall speed",
        optionC: "2.0 times stall speed",
        optionD: "1.1 times stall speed",
        correctAnswer: "A",
        explanation: "Standard approach speed is typically 1.3 times the stall speed (Vs0) for safe landing."
      },
      {
        id: 4,
        questionText: "What does the acronym MEL stand for in aviation?",
        optionA: "Maximum Equipment List",
        optionB: "Minimum Equipment List",
        optionC: "Mandatory Equipment List",
        optionD: "Master Equipment List",
        correctAnswer: "B",
        explanation: "MEL stands for Minimum Equipment List, which specifies minimum equipment required for flight."
      },
      {
        id: 5,
        questionText: "What is the primary purpose of winglets on aircraft?",
        optionA: "Increase lift",
        optionB: "Reduce drag",
        optionC: "Improve stability",
        optionD: "Enhance appearance",
        correctAnswer: "B",
        explanation: "Winglets reduce wingtip vortices, thereby reducing induced drag and improving fuel efficiency."
      }
    ];
    
    console.log('Loading demo question:', currentQ, 'Total questions:', demoQuestions.length);
    
    if (currentQ < demoQuestions.length && currentQ >= 0) {
      console.log('Setting question:', demoQuestions[currentQ]);
      setCurrentQuestion(demoQuestions[currentQ]);
    } else {
      console.log('Demo battle finished, showing results');
      // End demo battle
      setGameState('finished');
      setGameResults([
        { userId: user?.id || 1, userName: `${user?.firstName} ${user?.lastName}`.trim() || 'You', score: myScore, rank: 1, isReady: true, correctAnswers: 0, totalAnswered: 0, isHost: true, isActive: true },
        { userId: 'ai-bot' as any, userName: 'AI Bot', score: Math.floor(Math.random() * (myScore * 0.8)) + (myScore * 0.2), rank: 2, isReady: true, correctAnswers: 0, totalAnswered: 0, isHost: false, isActive: true }
      ]);
    }
  };

  const copyRoomCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.roomCode);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard.",
      });
    }
  };

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    localStorage.setItem('battle-tutorial-completed', 'true');
    toast({
      title: "Tutorial Complete!",
      description: "You're ready to battle. Good luck, pilot!",
    });
  };

  const startTutorial = () => {
    setShowTutorial(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Enhanced Header with Battle Theme */}
        <div className="mb-8">
          <div 
            className="rounded-xl p-6 text-white relative overflow-hidden"
            style={{ background: 'var(--battle-gradient-header)' }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-6xl">⚔️</div>
              <div className="absolute bottom-4 left-4 text-4xl">🛡️</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">⚡</div>
            </div>
            
            <div className="relative z-10">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold">Battle Mode</h1>
                  </div>
                  <div className="space-y-2 text-purple-100">
                    <p className="text-lg">
                      Compete with other students in real-time knowledge battles
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>2-10 Players</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Power-Up System</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4" />
                        <span>Real-Time Scoring</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4" />
                        <span>Timed Questions</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Reorganized */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                  {!tutorialCompleted && (
                    <Button
                      onClick={startTutorial}
                      variant="outline"
                      size="sm"
                      className="bg-amber-500/20 border-amber-400/40 text-amber-100 hover:bg-amber-500/30 hover:border-amber-400/60 transition-all"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Battle Tutorial
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowThemeSelector(true)}
                    variant="outline"
                    size="sm"
                    className="bg-violet-500/20 border-violet-400/40 text-violet-100 hover:bg-violet-500/30 hover:border-violet-400/60 transition-all"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Battle Themes
                  </Button>
                </div>
              </div>

              {/* Enhanced Battle Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                    <div className="text-xl font-bold">
                      {(battleStats as any)?.battlesWon ?? 0}
                    </div>
                  </div>
                  <div className="text-xs text-purple-200">Battles Won</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-green-400 mr-2" />
                    <div className="text-xl font-bold">
                      {(battleStats as any)?.winRate ?? 0}%
                    </div>
                  </div>
                  <div className="text-xs text-purple-200">Win Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-blue-400 mr-2" />
                    <div className="text-xl font-bold">
                      {(battleStats as any)?.powerUpsUsed ?? 0}
                    </div>
                  </div>
                  <div className="text-xs text-purple-200">Power-Ups Used</div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="w-full">
          {/* Main Battle Panel */}
          <div className="w-full">
            {gameState === 'lobby' && (
            <Card className="avex-card">
              <CardHeader>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={activeTab === "join" ? "default" : "outline"}
                    onClick={() => setActiveTab("join")}
                    className={activeTab === "join" ? "avex-button-primary" : ""}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Battle
                  </Button>
                  <Button
                    variant={activeTab === "create" ? "default" : "outline"}
                    onClick={() => setActiveTab("create")}
                    className={activeTab === "create" ? "avex-button-primary" : ""}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "join" ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Room Code
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter 6-digit room code"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="text-center text-lg font-mono tracking-wider"
                        />
                        <Button 
                          onClick={handleJoinRoom}
                          disabled={joinRoomMutation.isPending || !roomCode.trim()}
                          className="avex-button-primary px-8"
                        >
                          {joinRoomMutation.isPending ? "Joining..." : "Join"}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">How to Join:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Get a room code from a friend or instructor</li>
                        <li>• Enter the 6-digit code above</li>
                        <li>• Wait for the host to start the battle</li>
                        <li>• Use power-ups strategically during the game</li>
                      </ul>
                    </div>



                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Game Mode
                        </label>
                        <Select value={gameMode} onValueChange={setGameMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classic">Classic Race</SelectItem>
                            <SelectItem value="sudden_death">Sudden Death</SelectItem>
                            <SelectItem value="team">Team Mode (2v2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Category
                        </label>
                        <Select 
                          value={selectedCategory?.toString() || ""} 
                          onValueChange={(value) => {
                            const categoryId = value ? parseInt(value) : null;
                            setSelectedCategory(categoryId);
                            setSelectedSubtopics([]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Random category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="random">Random Category</SelectItem>
                            {Array.isArray(categories) && categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Questions
                        </label>
                        <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                            <SelectItem value="20">20 Questions</SelectItem>
                            <SelectItem value="30">30 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Max Players
                        </label>
                        <Select value={maxPlayers.toString()} onValueChange={(value) => setMaxPlayers(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3">3 Players</SelectItem>
                            <SelectItem value="4">4 Players</SelectItem>
                            <SelectItem value="5">5 Players</SelectItem>
                            <SelectItem value="6">6 Players</SelectItem>
                            <SelectItem value="7">7 Players</SelectItem>
                            <SelectItem value="8">8 Players</SelectItem>
                            <SelectItem value="9">9 Players</SelectItem>
                            <SelectItem value="10">10 Players</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedCategory && Array.isArray(subtopics) && subtopics.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Subtopics (Optional)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/20">
                          {subtopics
                            .filter((subtopic: any) => subtopic.categoryId === selectedCategory)
                            .map((subtopic: any) => (
                              <label key={subtopic.id} className="flex items-center space-x-2 cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 dark:border-gray-600"
                                  checked={selectedSubtopics.includes(subtopic.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSubtopics(prev => [...prev, subtopic.id]);
                                    } else {
                                      setSelectedSubtopics(prev => prev.filter(id => id !== subtopic.id));
                                    }
                                  }}
                                />
                                <span className="text-foreground">{subtopic.name}</span>
                              </label>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to include all subtopics from this category
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handleCreateRoom}
                      disabled={createRoomMutation.isPending}
                      className="w-full avex-button-primary"
                    >
                      {createRoomMutation.isPending ? (
                        "Creating Room..."
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Battle Room
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Game Modes Information */}
            {gameState === 'lobby' && (
              <Card className="avex-card mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-avex-violet flex items-center">
                    <Gamepad className="w-6 h-6 mr-2" />
                    Battle Game Modes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Choose your preferred battle style and difficulty level
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Classic Race Mode */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Trophy className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-600 dark:text-blue-400">Classic Race</h4>
                          <p className="text-xs text-blue-500 dark:text-blue-300">Standard Mode</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                        Race to answer questions correctly. Fastest and most accurate player wins.
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-foreground">30 seconds per question</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-foreground">Points for speed and accuracy</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-foreground">Power-ups available</span>
                        </div>
                      </div>
                    </div>

                    {/* Sudden Death Mode */}
                    <div className="bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-lg p-4 border border-red-500/30 hover:border-red-400/50 transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Flame className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400">Sudden Death</h4>
                          <p className="text-xs text-red-500 dark:text-red-300">High Stakes</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                        One wrong answer eliminates you. Last player standing wins the battle.
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span className="text-foreground">20 seconds per question</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span className="text-foreground">Elimination on wrong answer</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span className="text-foreground">Limited power-ups</span>
                        </div>
                      </div>
                    </div>

                    {/* Team Battle Mode */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-600 dark:text-green-400">Team Battle</h4>
                          <p className="text-xs text-green-500 dark:text-green-300">Cooperative</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">
                        Work together in teams. Combined team score determines the winner.
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-foreground">25 seconds per question</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-foreground">Team-shared power-ups</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-foreground">Combined scoring</span>
                        </div>
                      </div>
                    </div>






                  </div>

                  {/* Mode Selection Note */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-avex-violet/10 to-avex-purple/10 rounded-lg border border-avex-violet/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-avex-violet" />
                      <span className="font-semibold text-avex-violet text-sm">Mode Selection</span>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                      Game mode is set by the room host during room creation. Join existing rooms to experience different battle styles, or create your own room to choose your preferred mode.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Power-Up Arsenal Display for Lobby */}
            {gameState === 'lobby' && (
              <Card className="avex-card mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-avex-violet flex items-center">
                    <Zap className="w-6 h-6 mr-2" />
                    Power-Up Arsenal
                  </CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Discover the strategic weapons at your disposal in battle mode
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Power-Up Categories Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Support & Offensive */}
                    <div className="space-y-4">
                      {/* Support Power-Ups */}
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Support Arsenal
                        </h4>
                        <div className="space-y-2">
                          {POWER_UPS.filter(p => p.type === 'support').map((powerUp) => (
                            <div
                              key={powerUp.id}
                              className="bg-gradient-to-r from-blue-900/30 to-blue-800/40 rounded-lg p-3 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 group"
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{powerUp.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-white dark:text-white">{powerUp.name}</div>
                                  <p className="text-xs text-blue-200 dark:text-blue-300 mt-1">{powerUp.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>


                    </div>

                    {/* Defense Only */}
                    <div className="space-y-4">
                      {/* Defense Power-Ups */}
                      <div>
                        <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Defense Arsenal
                        </h4>
                        <div className="space-y-2">
                          {POWER_UPS.filter(p => p.type === 'defense').map((powerUp) => (
                            <div
                              key={powerUp.id}
                              className="bg-gradient-to-r from-purple-900/30 to-purple-800/40 rounded-lg p-3 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 group"
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-2xl group-hover:scale-110 transition-transform">{powerUp.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-white dark:text-white">{powerUp.name}</div>
                                  <p className="text-xs text-purple-200 dark:text-purple-300 mt-1">{powerUp.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Power-Up Earning Rules */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-avex-violet/10 to-avex-purple/10 rounded-lg border border-avex-violet/20">
                    <h5 className="font-semibold text-avex-violet mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      How to Earn Power-Ups
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-green-400 text-xs font-bold">3✓</span>
                        </div>
                        <span className="text-foreground">Get 3 correct answers in a row</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-xs font-bold">⚡3</span>
                        </div>
                        <span className="text-foreground">Answer 3 questions faster than opponents</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground dark:text-muted-foreground mt-3">
                      Use power-ups strategically to gain the upper hand and secure victory!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Enhanced Waiting Room for 2-10 Players */}
            {gameState === 'waiting' && (
              <Card className="avex-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-6 h-6 text-avex-violet" />
                      <span>Battle Room: {createdRoom?.roomCode || currentRoom?.roomCode}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Mode: <strong className="text-avex-purple">{gameMode}</strong></span>
                      <span>•</span>
                      <span>Questions: <strong>{questionCount}</strong></span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Enhanced Player Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">
                          Players ({players.length}/{currentRoom?.maxPlayers || maxPlayers})
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(createdRoom?.roomCode || currentRoom?.roomCode || '');
                              toast({ title: "Room code copied!", description: "Share it with friends to join" });
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Code
                          </Button>
                          
                          {/* Sound Control Panel */}
                          <div className="flex items-center space-x-2 border rounded-lg p-2 bg-background/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSoundEnabled(!soundEnabled)}
                              className="h-8 w-8 p-0 relative"
                              title={soundEnabled ? "Click to mute sound" : "Click to unmute sound"}
                            >
                              <Volume2 className="w-4 h-4" />
                              {!soundEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <X className="w-3 h-3 text-red-500 stroke-2 bg-background rounded-full" />
                                </div>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dynamic Player Grid Layout */}
                      <div className={`grid gap-3 ${
                        players.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                        players.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
                        players.length <= 6 ? 'grid-cols-2 md:grid-cols-3' :
                        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      }`}>
                        {players.map((player) => (
                          <div 
                            key={player.userId} 
                            className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${
                              player.userId === user?.id 
                                ? 'bg-avex-purple/10 border-avex-purple' 
                                : 'bg-muted border-border hover:border-avex-purple/50'
                            }`}
                          >
                            {/* Profile Image or Avatar */}
                            <div className="relative">
                              {player.profileImageUrl ? (
                                <img 
                                  src={player.profileImageUrl} 
                                  alt={player.userName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-avex-violet text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {player.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {player.isHost && (
                                <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-sm truncate">
                                  {player.userName}
                                  {player.userId === user?.id && ' (You)'}
                                </span>
                              </div>
                              <div className="text-xs">
                                {player.isReady ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Ready
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Waiting
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty Slots Indicator */}
                        {Array.from({ length: (currentRoom?.maxPlayers || maxPlayers) - players.length }).map((_, index) => (
                          <div 
                            key={`empty-${index}`}
                            className="flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50"
                          >
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                              <Plus className="w-5 h-5 text-muted-foreground/50" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground">Waiting for player...</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Room Status & Actions */}
                    <div className="space-y-4">
                      {/* Progress Indicator */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Ready Status</span>
                          <span className="text-avex-purple font-medium">
                            {players.filter(p => p.isReady).length} / {players.length} Ready
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-avex-purple to-avex-violet h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${players.length > 0 ? (players.filter(p => p.isReady).length / players.length) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Ready Button */}
                      <div className="text-center">
                        {(() => {
                          // Find current player in the players array with proper ID comparison
                          const currentUserId = user?.id?.toString();
                          const currentPlayer = players.find(p => p.userId?.toString() === currentUserId);
                          const playerIsReady = currentPlayer?.isReady || false;
                          
                          console.log('Ready button render - Current user ID:', currentUserId, 'Current player:', currentPlayer, 'Is ready:', playerIsReady, 'Players array:', players);
                          
                          return !playerIsReady ? (
                            <Button onClick={handlePlayerReady} className="avex-button-primary">
                              <Shield className="w-4 h-4 mr-2" />
                              Ready to Battle!
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <Badge className="bg-green-100 text-green-800">You are ready!</Badge>
                              <p className="text-sm text-muted-foreground">
                                Waiting for {players.filter(p => !p.isReady).length} more player(s)...
                              </p>
                              {/* Auto-start info for host */}
                              {isHost && players.length >= 2 && (
                                <p className="text-xs text-avex-purple">
                                  ⚡ Game will start automatically when all players are ready (minimum 2 players)
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Rankings Page - Displays between questions */}
            {gameState === 'rankings' && (
              <div className="min-h-screen bg-gradient-to-br from-avex-blue via-avex-purple to-avex-violet flex items-center justify-center p-4">
                <div className="max-w-4xl w-full">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                    <CardHeader className="text-center pb-8">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-400" />
                        <CardTitle className="text-4xl font-bold text-white">
                          Question {questionNumber} Results
                        </CardTitle>
                      </div>
                      <p className="text-white/80 text-lg">
                        {questionNumber < totalQuestions 
                          ? `Next question starting soon...` 
                          : 'Final battle results!'
                        }
                      </p>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-8">
                      <div className="space-y-4">
                        {currentScores
                          .sort((a, b) => b.score - a.score)
                          .map((player, index) => {
                            const isCurrentUser = player.userId?.toString() === user?.id?.toString();
                            const animation = rankingAnimations[player.userId];
                            const rankColors = [
                              'from-yellow-400 to-yellow-600', // 1st - Gold
                              'from-gray-300 to-gray-500',     // 2nd - Silver  
                              'from-orange-400 to-orange-600', // 3rd - Bronze
                              'from-blue-400 to-blue-600',     // 4th+
                              'from-purple-400 to-purple-600',
                              'from-green-400 to-green-600',
                              'from-red-400 to-red-600',
                              'from-pink-400 to-pink-600',
                              'from-indigo-400 to-indigo-600',
                              'from-teal-400 to-teal-600'
                            ];
                            
                            return (
                              <div
                                key={player.userId}
                                className={`relative p-6 rounded-2xl border-2 transform transition-all duration-1000 ${
                                  isCurrentUser 
                                    ? 'border-yellow-400 bg-white/20 scale-105 ring-4 ring-yellow-400/50' 
                                    : 'border-white/30 bg-white/10'
                                } ${
                                  animation === 'up' ? 'animate-climb-up' :
                                  animation === 'down' ? 'animate-climb-down' : ''
                                }`}
                              >
                                {/* Rank Badge */}
                                <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br ${
                                  rankColors[index] || 'from-gray-400 to-gray-600'
                                } flex items-center justify-center border-4 border-white shadow-lg`}>
                                  <span className="text-2xl font-bold text-white">
                                    #{index + 1}
                                  </span>
                                </div>
                                
                                {/* Animation Indicator */}
                                {animation === 'up' && (
                                  <div className="absolute -top-2 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                    ↗️ CLIMBED UP!
                                  </div>
                                )}
                                {animation === 'down' && (
                                  <div className="absolute -top-2 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                    ↘️ DROPPED DOWN
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between ml-8">
                                  <div className="flex items-center space-x-4">
                                    {/* Player Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-avex-blue to-avex-purple rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-xl">
                                        {(isCurrentUser ? 'You' : player.userName).charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    
                                    {/* Player Info */}
                                    <div>
                                      <h3 className="text-xl font-bold text-white">
                                        {isCurrentUser ? 'You' : player.userName}
                                        {isCurrentUser && (
                                          <span className="ml-2 text-yellow-400 text-sm">(You)</span>
                                        )}
                                      </h3>
                                      <div className="flex items-center space-x-4 text-white/80">
                                        <span className="text-3xl font-bold text-white">
                                          {player.score.toLocaleString()} pts
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Performance Indicators */}
                                  <div className="text-right">
                                    {index === 0 && (
                                      <div className="flex items-center space-x-2 text-yellow-400">
                                        <Crown className="w-6 h-6" />
                                        <span className="font-bold">LEADER</span>
                                      </div>
                                    )}
                                    {index === 1 && (
                                      <div className="text-gray-300 font-semibold">
                                        2ND PLACE
                                      </div>
                                    )}
                                    {index === 2 && (
                                      <div className="text-orange-400 font-semibold">
                                        3RD PLACE
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-4 ml-8">
                                  <div className="w-full bg-white/20 rounded-full h-3">
                                    <div 
                                      className={`h-3 rounded-full bg-gradient-to-r ${
                                        rankColors[index] || 'from-gray-400 to-gray-600'
                                      } transition-all duration-1000 ease-out`}
                                      style={{ 
                                        width: `${Math.min(100, (player.score / Math.max(...currentScores.map(p => p.score), 1)) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* Next Question Countdown */}
                      <div className="mt-8 text-center">
                        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                          <Clock className="w-5 h-5 text-white" />
                          <span className="text-white font-medium">
                            {questionNumber < totalQuestions 
                              ? 'Preparing next question...' 
                              : 'Battle complete!'
                            }
                          </span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Active Game - Redesigned Interface */}
            {gameState === 'active' && currentQuestion && (
              <div className="space-y-4">

                {/* Minimal Power-Up Panel Above Question */}
                {powerUpInventory.length > 0 && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-background/90 border-2 border-border/70 rounded-xl backdrop-blur-sm shadow-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Zap className="w-5 h-5 text-avex-purple" />
                      <span>Power-ups:</span>
                    </div>
                    <div className="flex gap-3">
                      {powerUpInventory.slice(0, 5).map((powerUpId) => {
                        const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                        if (!powerUp) return null;
                        
                        return (
                          <Button
                            key={powerUpId}
                            variant="outline"
                            size="default"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              activatePowerUp(powerUpId);
                            }}
                            disabled={hasAnswered || !currentQuestion}
                            className="h-12 px-4 flex items-center gap-2 text-sm font-medium hover:bg-avex-purple/20 hover:border-avex-purple hover:scale-105 transition-all duration-200 shadow-md border-2"
                            title={`${powerUp.name}: ${powerUp.description}`}
                          >
                            <span className="text-lg">{powerUp.icon}</span>
                            <span className="inline min-w-[80px] truncate">{powerUp.name}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Question Card */}
                <Card className="avex-card">
                  <CardHeader className="bg-gradient-to-r from-avex-violet to-avex-purple text-white">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        Question {questionNumber} of {totalQuestions}
                      </CardTitle>
                      
                      {/* Timer */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-6 h-6" />
                          <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                            timeRemaining <= 5 ? 'bg-red-500 animate-pulse' :
                            timeRemaining <= 10 ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {timeRemaining}s
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Network Connection Status */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${webSocketConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                          <span className="text-white text-xs">
                            {webSocketConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => setShowExitDialog(true)}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Exit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 relative">


                    
                    {/* Question Text - Enhanced Layout */}
                    <div className="text-center mb-8 px-4 question-container">
                      <div className="max-w-4xl mx-auto">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground leading-relaxed break-words hyphens-auto battle-question-text question-text">
                          {currentQuestion.questionText}
                        </h2>
                        {currentQuestion.imageUrl && (
                          <div className="mt-6">
                            <img 
                              src={currentQuestion.imageUrl} 
                              alt="Question illustration"
                              className="max-w-full h-auto rounded-lg border border-border mx-auto shadow-md"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Answer Options - Enhanced Layout with Text Wrapping */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-8 px-2 choices-container">
                      {['A', 'B', 'C', 'D'].map((option, index) => {
                        const isEliminated = eliminatedOptions.includes(option);
                        const isSelected = selectedAnswer === option;
                        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                        const hoverColors = ['hover:bg-red-600', 'hover:bg-blue-600', 'hover:bg-green-600', 'hover:bg-yellow-600'];
                        
                        if (isEliminated && showFiftyFifty) return null;
                        
                        const optionText = currentQuestion[`option${option}` as keyof Question] as string;
                        const isLongText = optionText && optionText.length > 50;
                        
                        return (
                          <Button
                            key={option}
                            variant="outline"
                            className={`p-4 sm:p-6 ${isLongText ? 'min-h-20' : 'h-16 sm:h-20'} text-left justify-start text-white font-bold transition-all transform ${
                              colors[index]
                            } ${hoverColors[index]} ${
                              isSelected ? 'ring-4 ring-white scale-105' : 'hover:scale-102'
                            } ${hasAnswered || waitingForNextQuestion || timeRemaining <= 0 ? 'opacity-60' : ''}`}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={hasAnswered || waitingForNextQuestion || timeRemaining <= 0}
                          >
                            <div className="flex items-start space-x-3 sm:space-x-4 w-full">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0 mt-1">
                                {option}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`block leading-tight break-words hyphens-auto battle-choice-text choice-option ${
                                  isLongText ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                                }`}>
                                  {optionText}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0 mt-1">
                                  <span className="text-xl sm:text-2xl">✓</span>
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Instant Feedback */}
                    {hasAnswered && (
                      <div className={`text-center p-6 rounded-xl mb-6 ${
                        selectedAnswer === currentQuestion.correctAnswer 
                          ? 'bg-green-100 border-2 border-green-500' 
                          : 'bg-red-100 border-2 border-red-500'
                      }`}>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          {selectedAnswer === currentQuestion.correctAnswer ? (
                            <>
                              <span className="text-4xl">✅</span>
                              <span className="text-2xl font-bold text-green-700">Correct!</span>
                            </>
                          ) : (
                            <>
                              <span className="text-4xl">❌</span>
                              <span className="text-2xl font-bold text-red-700">Wrong!</span>
                            </>
                          )}
                        </div>
                        {selectedAnswer !== currentQuestion.correctAnswer && (
                          <p className="text-sm sm:text-lg text-red-600 break-words battle-choice-text">
                            Correct answer: <strong>{currentQuestion.correctAnswer}</strong> - {currentQuestion[`option${currentQuestion.correctAnswer}` as keyof Question]}
                          </p>
                        )}
                        {lastAnswerPoints && lastAnswerPoints > 0 && selectedAnswer === currentQuestion.correctAnswer && (
                          <div className="text-lg font-bold text-green-600 mt-2 animate-bounce">
                            +{lastAnswerPoints} points!
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>


              </div>
            )}
            
            {/* Intermediate Rankings Display */}
            {showIntermediateRankings && currentScores.length > 0 && (
              <Card className="avex-card">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-avex-violet">Current Rankings</h2>
                    <div className="space-y-3">
                      {currentScores
                        .sort((a, b) => b.score - a.score)
                        .map((player, index) => {
                          const isCurrentUser = player.userId === user?.id?.toString();
                          const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
                          const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];
                          
                          return (
                            <div
                              key={player.userId}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                isCurrentUser 
                                  ? 'bg-avex-purple/10 border-avex-purple shadow-lg scale-105' 
                                  : bgColors[index] || 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  rankColors[index] || 'text-avex-purple'
                                }`}>
                                  #{index + 1}
                                </div>
                                <span className="font-semibold">
                                  {player.userName}
                                  {isCurrentUser && ' (You)'}
                                </span>
                              </div>
                              <div className="text-xl font-bold text-avex-violet">
                                {player.score}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Final Results */}
            {gameState === 'finished' && showFinalResults && gameResults.length > 0 && (
              <div className="space-y-6">
                {/* Winner Announcement */}
                <Card className="avex-card text-center">
                  <CardContent className="p-8">
                    <div className="text-8xl mb-4">🏆</div>
                    <h1 className="text-3xl font-bold mb-2">Battle Complete!</h1>
                    <p className="text-xl text-muted-foreground mb-6">
                      Final Rankings
                    </p>
                    
                    {/* Final Rankings with Highlighted Personal Result */}
                    <div className="space-y-3 max-w-md mx-auto">
                      {gameResults.map((player, index) => {
                        const isCurrentUser = player.userId === user?.id;
                        const rankEmojis = ['🥇', '🥈', '🥉'];
                        const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
                        
                        return (
                          <div
                            key={player.userId}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              isCurrentUser 
                                ? 'bg-avex-purple/20 border-avex-purple shadow-xl scale-110 ring-4 ring-avex-purple/30' 
                                : 'bg-muted border-border'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {rankEmojis[index] || `#${index + 1}`}
                              </div>
                              <div className="text-left">
                                <div className={`font-bold ${isCurrentUser ? 'text-avex-purple text-lg' : 'text-foreground'}`}>
                                  {player.userName}
                                  {isCurrentUser && ' (You)'}
                                </div>
                                <div className={`text-sm ${isCurrentUser ? 'text-avex-purple' : 'text-muted-foreground'}`}>
                                  Rank #{player.rank}
                                </div>
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${isCurrentUser ? 'text-avex-purple' : 'text-foreground'}`}>
                              {player.score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Highlights */}
                <Card className="avex-card">
                  <CardHeader>
                    <CardTitle className="text-center">Performance Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-bold">Speed Points</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(playerScore * 0.6)} from fast answers
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-bold">Accuracy Bonus</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(playerScore * 0.3)} from correct answers
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl mb-2">🚀</div>
                        <div className="font-bold">Power-up Bonus</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.floor(playerScore * 0.1)} from power-ups
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1 avex-button-primary"
                    onClick={() => {
                      // Stop all sounds immediately when exiting
                      try {
                        battleSoundManager.stopBackgroundMusic();
                        battleSoundManager.cleanup();
                      } catch (error) {
                        console.warn('Failed to stop sounds on exit:', error);
                      }
                      
                      // Send exit signal to server if still connected
                      if (wsRef.current && currentRoom) {
                        wsRef.current.send(JSON.stringify({
                          type: 'leave_room',
                          roomCode: currentRoom.roomCode,
                          userId: user?.id?.toString()
                        }));
                      }
                      
                      // Immediately exit to lobby for this user
                      setGameState('lobby');
                      setCurrentQuestion(null);
                      setPlayers([]);
                      setGameResults([]);
                      setCreatedRoom(null);
                      setCurrentRoom(null);
                      setPlayerScore(0);
                      setOpponentScore(0);
                      setCorrectAnswerStreak(0);
                      setTotalAnswered(0);
                      setAvailablePowerUps([]);
                      setActivePowerUps([]);
                      setFastestAnswerTime(Infinity);
                      setPowerUpsUsedCount(0);
                      setAfterburnerActive(false);
                      setComebackUsed(false);
                      setCorrectStreak(0);
                      setFastCorrectStreak(0);
                      setCurrentScores([]);
                      setQuestionNumber(0);
                      setTotalQuestions(0);
                      setSelectedAnswer(null);
                      setHasAnswered(false);
                      setWaitingForNextQuestion(false);
                      setTimeRemaining(30);
                      setIsReady(false);
                      setWebSocketConnected(false);
                      setReconnectAttempts(0);
                      
                      // Clean up resources
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      if (wsRef.current) {
                        wsRef.current.close(1000, 'Starting rematch');
                      }
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Rematch
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Stop all sounds immediately when exiting
                      try {
                        battleSoundManager.stopBackgroundMusic();
                        battleSoundManager.cleanup();
                      } catch (error) {
                        console.warn('Failed to stop sounds on exit:', error);  
                      }
                      
                      // Send exit signal to server if still connected
                      if (wsRef.current && currentRoom) {
                        wsRef.current.send(JSON.stringify({
                          type: 'leave_room',
                          roomCode: currentRoom.roomCode,
                          userId: user?.id?.toString()
                        }));
                      }
                      
                      // Clean up resources before navigating
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      if (wsRef.current) {
                        wsRef.current.close(1000, 'Returning to dashboard');
                      }
                      
                      // Reset game state and return to lobby
                      setGameState('lobby');
                      setCurrentRoom(null);
                      setCreatedRoom(null);
                      setShowFinalResults(false);
                      setCurrentQuestion(null);
                      setPlayers([]);
                      setMyScore(0);
                      setLastAnswerPoints(0);
                      setQuestionNumber(0);
                      setGameResults([]);
                      setIsReady(false);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lobby
                  </Button>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* Room Created Dialog */}
        <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-avex-violet" />
                <span>Battle Room Created!</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Room Code</div>
                <div className="text-3xl font-mono font-bold text-avex-violet tracking-wider">
                  {createdRoom?.roomCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomCode}
                  className="mt-2"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Code
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Mode:</span>
                    <span className="font-medium capitalize">{createdRoom?.gameMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{createdRoom?.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Players:</span>
                    <span className="font-medium">{createdRoom?.maxPlayers}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Share the room code with other players
                </p>
                <Button className="w-full avex-button-primary">
                  Start Battle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Flashcard Intro Screen */}
      {showFlashcard && battleCategory && (
        <Dialog open={showFlashcard} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="sr-only">Battle Category Introduction</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-avex-violet rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Battle Category</h2>
              <div className="bg-avex-violet/10 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-semibold text-avex-violet mb-1">
                  {battleCategory.name}
                </h3>
                {battleCategory.description && (
                  <p className="text-sm text-muted-foreground">
                    {battleCategory.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Questions from this category will be randomized</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-avex-violet rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-avex-violet rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-avex-violet rounded-full animate-pulse delay-200"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Preparing battle...</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}



      {/* Power-Up Selection Dialog */}
      {showPowerUpSelection && (
        <Dialog open={showPowerUpSelection} onOpenChange={setShowPowerUpSelection}>
          <DialogContent className="max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold flex items-center justify-center space-x-2">
                <Zap className="w-6 h-6 text-avex-violet" />
                <span>Choose Your Power-Up!</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-center text-sm text-muted-foreground">
                Great performance! Select a power-up to add to your arsenal:
              </p>
              <div className="grid gap-3">
                {offeredPowerUps.length > 0 ? 
                  offeredPowerUps.map((powerUpId) => {
                    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                    if (!powerUp) return null;
                    
                    return (
                      <Button
                        key={powerUpId}
                        variant="outline"
                        className="h-auto p-4 hover:bg-avex-violet/10 hover:border-avex-violet transition-all"
                        onClick={() => selectPowerUpReward(powerUpId)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="w-10 h-10 bg-gradient-to-br from-avex-violet to-avex-purple rounded-lg flex items-center justify-center">
                            <span className="text-lg">{powerUp.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-sm">{powerUp.name}</h4>
                            <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                          </div>
                        </div>
                      </Button>
                    );
                  }) :
                  availablePowerUpRewards.map((powerUpId) => {
                    const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                    if (!powerUp) return null;
                    
                    return (
                      <Button
                        key={powerUpId}
                        variant="outline"
                        className="h-auto p-4 hover:bg-avex-violet/10 hover:border-avex-violet transition-all"
                        onClick={() => selectPowerUpReward(powerUpId)}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="w-10 h-10 bg-gradient-to-br from-avex-violet to-avex-purple rounded-lg flex items-center justify-center">
                            <span className="text-lg">{powerUp.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-sm">{powerUp.name}</h4>
                            <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                          </div>
                        </div>
                      </Button>
                    );
                  })
                }
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Power-ups can be used strategically during the battle
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Smart Hint Dialog */}
      <Dialog open={showHintDialog} onOpenChange={setShowHintDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">👁️</span>
              <span>Smart Hint</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentQuestion?.explanation && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Hint:</h4>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.explanation.substring(0, Math.floor(currentQuestion.explanation.length * 0.5))}...
                </p>
              </div>
            )}
            
            <div className="text-center">
              <Button onClick={() => setShowHintDialog(false)} className="avex-button-primary">
                Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit/Concede Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-destructive">
              <Target className="w-6 h-6" />
              <span>Exit Battle?</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {isDemo 
                ? "Are you sure you want to exit this demo battle?"
                : players.length > 2 
                  ? "Are you sure you want to leave the game? The battle will continue for the remaining players."
                  : "Are you sure you want to concede this match? Your opponent will win automatically."
              }
            </p>
            
            {!isDemo && players.length > 1 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Other players will be notified: "<strong>{user?.firstName || 'Player'} has left the match.</strong>"
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowExitDialog(false)}
              >
                Stay in Game
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleConcede}
              >
                {isDemo ? "End Demo" : "Leave Battle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ranking Animation Overlay */}
      {showRankingAnimation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-center mb-4">Score Update!</h3>
            <div className="space-y-2">
              {players.slice().sort((a, b) => b.score - a.score).map((player, index) => {
                const previousRank = previousRankings.findIndex(p => p.userId === player.userId) + 1;
                const currentRank = index + 1;
                const rankChange = previousRank - currentRank;
                
                return (
                  <div key={player.userId} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-avex-violet text-white'
                    }`}>
                      {currentRank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{player.userName}</div>
                      <div className="text-sm text-muted-foreground">{player.score} points</div>
                    </div>
                    {rankChange !== 0 && (
                      <div className={`text-sm font-bold ${rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Theme Selector */}
      <ThemeSelector
        open={showThemeSelector}
        onOpenChange={setShowThemeSelector}
        onThemeSelect={handleThemeChange}
      />

      {/* Battle Tutorial */}
      <BattleTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* ========= COMPREHENSIVE POWER-UP SYSTEM UI COMPONENTS ========= */}
      






      {/* Admin Testing Panel */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-purple-500" />
              <span>Power-Up Admin Testing Panel</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Test Actions */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Quick Test Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    POWER_UPS.slice(0, 5).forEach(powerUp => testPowerUpInAdmin(powerUp.id));
                  }}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  Add All Support Power-Ups
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    POWER_UPS.filter(p => p.type === 'attack').forEach(powerUp => testPowerUpInAdmin(powerUp.id));
                  }}
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  Add All Attack Power-Ups
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPowerUpInventory([])}
                  className="border-gray-500 text-gray-600 hover:bg-gray-50"
                >
                  Clear All Power-Ups
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActivePowerUps(['shield', 'speed_boost']);
                    toast({
                      title: "Admin Test",
                      description: "Shield and Speed Boost activated for testing",
                    });
                  }}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Test Active Effects
                </Button>
              </div>
            </div>

            {/* Individual Power-Up Testing */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Individual Power-Up Testing</h4>
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {POWER_UPS.map((powerUp) => (
                  <div
                    key={powerUp.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center mb-2">
                      <div className="text-2xl mb-1">{powerUp.icon}</div>
                      <div className="text-sm font-medium leading-tight text-wrap break-words px-1">
                        {powerUp.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 leading-relaxed text-wrap">
                        {powerUp.type}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => testPowerUpInAdmin(powerUp.id)}
                    >
                      Add to Inventory
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current State Display */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Current Power-Up State</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">Inventory ({powerUpInventory.length} items):</div>
                  <div className="flex flex-wrap gap-1">
                    {powerUpInventory.length > 0 ? (
                      powerUpInventory.map((powerUpId, index) => {
                        const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                        return powerUp ? (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {powerUp.icon} {powerUp.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No power-ups in inventory</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">Active Effects ({activePowerUps.length} active):</div>
                  <div className="flex flex-wrap gap-1">
                    {activePowerUps.length > 0 ? (
                      activePowerUps.map((powerUpId, index) => {
                        const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                        return powerUp ? (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {powerUp.icon} {powerUp.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-gray-500 text-sm">No active effects</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Sync Testing */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">Real-time Sync Testing</h4>
              <div className="grid grid-cols-2 gap-3">

                <Button
                  variant="outline"
                  onClick={() => {
                    // Test WebSocket connection status
                    const status = wsRef.current?.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected';
                    toast({
                      title: "WebSocket Status",
                      description: `Connection is ${status}`,
                    });
                  }}
                  className="border-blue-500 text-blue-600"
                >
                  Check WebSocket Status
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trigger-Based Power-Up Selection Modal - Only During Active Game */}
      {gameState === 'active' && (
        <Dialog open={showPowerUpSelection} onOpenChange={() => {}}>
          <DialogContent className="max-w-lg mx-auto border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gradient bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🎯 Power-Up Earned!
              </DialogTitle>
              <p className="text-center text-gray-600 mt-2 text-wrap">
                Choose 1 power-up to add to your arsenal:
              </p>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              {availablePowerUpRewards.map((powerUpId) => {
                const powerUp = POWER_UPS.find(p => p.id === powerUpId);
                if (!powerUp) return null;
                
                return (
                  <Button
                    key={powerUpId}
                    onClick={() => selectPowerUpReward(powerUpId)}
                    className="w-full min-h-[70px] flex items-center justify-start space-x-4 bg-white hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 border-2 border-gray-200 hover:border-purple-400 transition-all duration-200 text-left p-4"
                    variant="outline"
                  >
                    <div className="text-3xl shrink-0">{powerUp.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base leading-tight mb-1 text-wrap">
                        {powerUp.name}
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed text-wrap break-words">
                        {powerUp.description}
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium shrink-0">
                      {powerUp.type}
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <div className="text-center text-xs text-gray-500 mt-4 text-wrap">
              Single-use per trigger • Real-time responsive
            </div>
          </DialogContent>
        </Dialog>
      )}




    </div>
  );
}
