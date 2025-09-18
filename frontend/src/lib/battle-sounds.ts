// Battle Mode Sound Effects System
// This module provides dynamic sound effects for battle mode interactions

export interface SoundEffect {
  name: string;
  url: string;
  volume: number;
  loop?: boolean;
}

export const BATTLE_SOUNDS: Record<string, SoundEffect> = {
  // Game State Sounds
  room_joined: {
    name: 'Room Joined',
    url: '/sounds/battle/room-joined.mp3',
    volume: 0.6
  },
  game_started: {
    name: 'Game Started',
    url: '/sounds/battle/game-start.mp3',
    volume: 0.7
  },
  countdown: {
    name: 'Countdown',
    url: '/sounds/battle/countdown.mp3',
    volume: 0.8
  },
  
  // Answer Feedback Sounds
  correct_answer: {
    name: 'Correct Answer',
    url: '/sounds/battle/correct.mp3',
    volume: 0.7
  },
  incorrect_answer: {
    name: 'Incorrect Answer',
    url: '/sounds/battle/incorrect.mp3',
    volume: 0.6
  },
  
  // Timing Sounds
  timer_warning: {
    name: 'Timer Warning',
    url: '/sounds/battle/timer-warning.mp3',
    volume: 0.5
  },
  time_up: {
    name: 'Time Up',
    url: '/sounds/battle/time-up.mp3',
    volume: 0.8
  },
  
  // Power-up Sounds
  powerup_earned: {
    name: 'Power-up Earned',
    url: '/sounds/battle/powerup-earned.mp3',
    volume: 0.7
  },
  powerup_activated: {
    name: 'Power-up Activated',
    url: '/sounds/battle/powerup-activated.mp3',
    volume: 0.8
  },
  sabotage_received: {
    name: 'Sabotage Received',
    url: '/sounds/battle/sabotage.mp3',
    volume: 0.6
  },
  
  // Player Interaction Sounds
  player_joined: {
    name: 'Player Joined',
    url: '/sounds/battle/player-joined.mp3',
    volume: 0.5
  },
  player_ready: {
    name: 'Player Ready',
    url: '/sounds/battle/player-ready.mp3',
    volume: 0.6
  },
  
  // Victory/Defeat Sounds
  victory: {
    name: 'Victory',
    url: '/sounds/battle/victory.mp3',
    volume: 0.8
  },
  defeat: {
    name: 'Defeat',
    url: '/sounds/battle/defeat.mp3',
    volume: 0.6
  },
  opponent_conceded: {
    name: 'Opponent Conceded',
    url: '/sounds/battle/opponent-conceded.mp3',
    volume: 0.7
  },
  
  // Streak Sounds
  streak_bonus: {
    name: 'Streak Bonus',
    url: '/sounds/battle/streak-bonus.mp3',
    volume: 0.7
  },
  
  // Background Music
  battle_music: {
    name: 'Battle Music',
    url: '/sounds/battle/battle-background.mp3',
    volume: 0.3,
    loop: true
  }
};

class BattleSoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 1.0;
  private soundEnabled: boolean = true;
  private backgroundMusic: HTMLAudioElement | null = null;

  constructor() {
    // Preload critical sounds
    this.preloadSounds(['correct_answer', 'incorrect_answer', 'timer_warning', 'game_started']);
  }

  private async preloadSounds(soundKeys: string[]) {
    const promises = soundKeys.map(key => this.loadSound(key));
    await Promise.allSettled(promises);
  }

  private async loadSound(soundKey: string): Promise<HTMLAudioElement | null> {
    if (this.audioCache.has(soundKey)) {
      return this.audioCache.get(soundKey)!;
    }

    const soundConfig = BATTLE_SOUNDS[soundKey];
    if (!soundConfig) {
      console.warn(`Sound not found: ${soundKey}`);
      return null;
    }

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = soundConfig.volume * this.masterVolume;
      
      // Use fallback URL generation for missing sound files
      audio.src = this.generateFallbackTone(soundKey);
      
      if (soundConfig.loop) {
        audio.loop = true;
      }

      // Handle loading errors gracefully
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${soundKey}`);
      });

      this.audioCache.set(soundKey, audio);
      return audio;
    } catch (error) {
      console.warn(`Error loading sound ${soundKey}:`, error);
      return null;
    }
  }

  private generateFallbackTone(soundKey: string): string {
    // Generate simple tones using Web Audio API for fallback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.3;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // Different frequencies for different sound types
    const frequencies: Record<string, number> = {
      correct_answer: 800,
      incorrect_answer: 300,
      timer_warning: 600,
      game_started: 500,
      powerup_earned: 900,
      victory: 1000,
      defeat: 200,
      player_joined: 400,
      player_ready: 550
    };

    const frequency = frequencies[soundKey] || 440;
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
    }

    // Convert buffer to data URL
    const wave = this.audioBufferToWave(buffer);
    return URL.createObjectURL(new Blob([wave], { type: 'audio/wav' }));
  }

  private audioBufferToWave(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert audio data
    const data = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }

  async playSound(soundKey: string, options?: { volume?: number; delay?: number }): Promise<void> {
    if (!this.soundEnabled) return;

    try {
      const audio = await this.loadSound(soundKey);
      if (!audio) return;

      // Apply custom volume if specified
      if (options?.volume !== undefined) {
        audio.volume = options.volume * this.masterVolume;
      }

      // Apply delay if specified
      if (options?.delay) {
        setTimeout(() => {
          audio.currentTime = 0;
          audio.play().catch(e => console.warn('Sound play failed:', e));
        }, options.delay);
      } else {
        audio.currentTime = 0;
        await audio.play();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundKey}:`, error);
    }
  }

  async startBackgroundMusic(): Promise<void> {
    if (!this.soundEnabled || this.backgroundMusic) return;

    try {
      this.backgroundMusic = await this.loadSound('battle_music');
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = 0.2 * this.masterVolume;
        await this.backgroundMusic.play();
      }
    } catch (error) {
      console.warn('Failed to start background music:', error);
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all cached audio volumes
    this.audioCache.forEach((audio, key) => {
      const soundConfig = BATTLE_SOUNDS[key];
      if (soundConfig) {
        audio.volume = soundConfig.volume * this.masterVolume;
      }
    });

    // Update background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 0.2 * this.masterVolume;
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    
    if (!enabled) {
      this.stopBackgroundMusic();
      // Stop all currently playing sounds
      this.audioCache.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }

  // Play combination sounds for enhanced feedback
  async playComboSound(sounds: string[], interval: number = 100): Promise<void> {
    for (let i = 0; i < sounds.length; i++) {
      this.playSound(sounds[i], { delay: i * interval });
    }
  }

  // Cleanup method
  cleanup(): void {
    this.stopBackgroundMusic();
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
  }
}

// Export singleton instance
export const battleSoundManager = new BattleSoundManager();

// Convenience functions for common sound combinations
export const playAnswerFeedback = (isCorrect: boolean) => {
  battleSoundManager.playSound(isCorrect ? 'correct_answer' : 'incorrect_answer');
};

export const playVictorySequence = async () => {
  await battleSoundManager.playComboSound(['victory'], 0);
};

export const playDefeatSequence = async () => {
  await battleSoundManager.playSound('defeat');
};

export const playPowerUpSequence = async () => {
  await battleSoundManager.playComboSound(['powerup_earned', 'powerup_activated'], 200);
};