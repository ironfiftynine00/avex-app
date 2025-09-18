export interface BattleTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    warning: string;
    danger: string;
    timerNormal: string;
    timerWarning: string;
    timerDanger: string;
    powerUpBg: string;
    buttonPrimary: string;
    buttonSecondary: string;
    border: string;
  };
  gradients: {
    header: string;
    background: string;
    card: string;
    button: string;
  };
  animations: {
    intensity: 'subtle' | 'normal' | 'intense';
    effects: string[];
  };
  sounds: {
    theme: string;
    volume: number;
  };
}

export const BATTLE_THEMES: BattleTheme[] = [
  {
    id: 'avex-classic',
    name: 'AVEX Classic',
    description: 'The original AVEX purple theme with professional aviation aesthetics',
    colors: {
      primary: 'rgb(139, 92, 246)', // avex-violet
      secondary: 'rgb(168, 85, 247)', // avex-purple
      accent: 'rgb(59, 130, 246)', // avex-blue
      background: 'hsl(var(--background))',
      cardBg: 'hsl(var(--card))',
      textPrimary: 'hsl(var(--foreground))',
      textSecondary: 'hsl(var(--muted-foreground))',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(251, 191, 36)',
      danger: 'rgb(239, 68, 68)',
      timerNormal: 'rgb(168, 85, 247)',
      timerWarning: 'rgb(251, 191, 36)',
      timerDanger: 'rgb(239, 68, 68)',
      powerUpBg: 'rgba(139, 92, 246, 0.1)',
      buttonPrimary: 'rgb(139, 92, 246)',
      buttonSecondary: 'rgb(107, 114, 128)',
      border: 'hsl(var(--border))'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(168, 85, 247))',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03))',
      card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))',
      button: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(168, 85, 247))'
    },
    animations: {
      intensity: 'normal',
      effects: ['pulse', 'fade', 'slide']
    },
    sounds: {
      theme: 'professional',
      volume: 0.7
    }
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic cyberpunk theme with electric blue and neon green accents',
    colors: {
      primary: 'rgb(0, 255, 255)', // cyan
      secondary: 'rgb(0, 255, 127)', // spring green
      accent: 'rgb(255, 0, 255)', // magenta
      background: 'rgb(2, 6, 23)', // dark blue
      cardBg: 'rgba(0, 255, 255, 0.05)',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(0, 255, 255)',
      success: 'rgb(0, 255, 127)',
      warning: 'rgb(255, 215, 0)',
      danger: 'rgb(255, 20, 147)',
      timerNormal: 'rgb(0, 255, 255)',
      timerWarning: 'rgb(255, 215, 0)',
      timerDanger: 'rgb(255, 20, 147)',
      powerUpBg: 'rgba(0, 255, 255, 0.15)',
      buttonPrimary: 'rgb(0, 255, 255)',
      buttonSecondary: 'rgb(0, 255, 127)',
      border: 'rgba(0, 255, 255, 0.3)'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(0, 255, 255), rgb(0, 255, 127))',
      background: 'linear-gradient(135deg, rgb(2, 6, 23), rgb(15, 23, 42))',
      card: 'linear-gradient(135deg, rgba(0, 255, 255, 0.08), rgba(0, 255, 127, 0.08))',
      button: 'linear-gradient(135deg, rgb(0, 255, 255), rgb(255, 0, 255))'
    },
    animations: {
      intensity: 'intense',
      effects: ['glow', 'pulse', 'neon', 'glitch']
    },
    sounds: {
      theme: 'cyber',
      volume: 0.8
    }
  },
  {
    id: 'fire-storm',
    name: 'Fire Storm',
    description: 'Intense red and orange theme with fiery energy and high-stakes atmosphere',
    colors: {
      primary: 'rgb(255, 69, 0)', // red-orange
      secondary: 'rgb(255, 140, 0)', // dark orange
      accent: 'rgb(255, 215, 0)', // gold
      background: 'rgb(20, 5, 0)', // dark red
      cardBg: 'rgba(255, 69, 0, 0.08)',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(255, 140, 0)',
      success: 'rgb(255, 215, 0)',
      warning: 'rgb(255, 140, 0)',
      danger: 'rgb(220, 20, 60)',
      timerNormal: 'rgb(255, 140, 0)',
      timerWarning: 'rgb(255, 69, 0)',
      timerDanger: 'rgb(220, 20, 60)',
      powerUpBg: 'rgba(255, 69, 0, 0.15)',
      buttonPrimary: 'rgb(255, 69, 0)',
      buttonSecondary: 'rgb(255, 140, 0)',
      border: 'rgba(255, 69, 0, 0.3)'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(255, 69, 0), rgb(255, 140, 0))',
      background: 'linear-gradient(135deg, rgb(20, 5, 0), rgb(40, 20, 10))',
      card: 'linear-gradient(135deg, rgba(255, 69, 0, 0.1), rgba(255, 140, 0, 0.1))',
      button: 'linear-gradient(135deg, rgb(255, 69, 0), rgb(255, 215, 0))'
    },
    animations: {
      intensity: 'intense',
      effects: ['flame', 'pulse', 'shake', 'burn']
    },
    sounds: {
      theme: 'intense',
      volume: 0.9
    }
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Cool blue and teal theme with flowing water-like animations',
    colors: {
      primary: 'rgb(0, 150, 199)', // deep blue
      secondary: 'rgb(0, 191, 165)', // teal
      accent: 'rgb(72, 209, 204)', // light teal
      background: 'rgb(3, 7, 18)', // dark navy
      cardBg: 'rgba(0, 150, 199, 0.06)',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(72, 209, 204)',
      success: 'rgb(0, 191, 165)',
      warning: 'rgb(255, 193, 7)',
      danger: 'rgb(220, 53, 69)',
      timerNormal: 'rgb(72, 209, 204)',
      timerWarning: 'rgb(255, 193, 7)',
      timerDanger: 'rgb(220, 53, 69)',
      powerUpBg: 'rgba(0, 150, 199, 0.12)',
      buttonPrimary: 'rgb(0, 150, 199)',
      buttonSecondary: 'rgb(0, 191, 165)',
      border: 'rgba(0, 150, 199, 0.25)'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(0, 150, 199), rgb(0, 191, 165))',
      background: 'linear-gradient(135deg, rgb(3, 7, 18), rgb(30, 58, 138))',
      card: 'linear-gradient(135deg, rgba(0, 150, 199, 0.08), rgba(0, 191, 165, 0.08))',
      button: 'linear-gradient(135deg, rgb(0, 150, 199), rgb(72, 209, 204))'
    },
    animations: {
      intensity: 'subtle',
      effects: ['wave', 'flow', 'bubble', 'ripple']
    },
    sounds: {
      theme: 'ambient',
      volume: 0.6
    }
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    description: 'Elegant gold and black theme with premium feel and sophisticated animations',
    colors: {
      primary: 'rgb(255, 215, 0)', // gold
      secondary: 'rgb(255, 193, 7)', // amber
      accent: 'rgb(255, 235, 59)', // light gold
      background: 'rgb(18, 18, 18)', // near black
      cardBg: 'rgba(255, 215, 0, 0.08)',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(255, 215, 0)',
      success: 'rgb(76, 175, 80)',
      warning: 'rgb(255, 193, 7)',
      danger: 'rgb(244, 67, 54)',
      timerNormal: 'rgb(255, 215, 0)',
      timerWarning: 'rgb(255, 193, 7)',
      timerDanger: 'rgb(244, 67, 54)',
      powerUpBg: 'rgba(255, 215, 0, 0.12)',
      buttonPrimary: 'rgb(255, 215, 0)',
      buttonSecondary: 'rgb(255, 193, 7)',
      border: 'rgba(255, 215, 0, 0.3)'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(255, 215, 0), rgb(255, 193, 7))',
      background: 'linear-gradient(135deg, rgb(18, 18, 18), rgb(33, 33, 33))',
      card: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1))',
      button: 'linear-gradient(135deg, rgb(255, 215, 0), rgb(255, 235, 59))'
    },
    animations: {
      intensity: 'subtle',
      effects: ['shimmer', 'glow', 'fade', 'elegant']
    },
    sounds: {
      theme: 'elegant',
      volume: 0.5
    }
  },
  {
    id: 'forest-camouflage',
    name: 'Forest Camouflage',
    description: 'Military-inspired green theme with tactical aesthetics',
    colors: {
      primary: 'rgb(76, 175, 80)', // green
      secondary: 'rgb(139, 195, 74)', // light green
      accent: 'rgb(205, 220, 57)', // lime
      background: 'rgb(27, 94, 32)', // dark green
      cardBg: 'rgba(76, 175, 80, 0.08)',
      textPrimary: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(139, 195, 74)',
      success: 'rgb(76, 175, 80)',
      warning: 'rgb(255, 235, 59)',
      danger: 'rgb(244, 67, 54)',
      timerNormal: 'rgb(139, 195, 74)',
      timerWarning: 'rgb(255, 235, 59)',
      timerDanger: 'rgb(244, 67, 54)',
      powerUpBg: 'rgba(76, 175, 80, 0.12)',
      buttonPrimary: 'rgb(76, 175, 80)',
      buttonSecondary: 'rgb(139, 195, 74)',
      border: 'rgba(76, 175, 80, 0.3)'
    },
    gradients: {
      header: 'linear-gradient(135deg, rgb(76, 175, 80), rgb(139, 195, 74))',
      background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(56, 142, 60))',
      card: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(139, 195, 74, 0.08))',
      button: 'linear-gradient(135deg, rgb(76, 175, 80), rgb(205, 220, 57))'
    },
    animations: {
      intensity: 'normal',
      effects: ['tactical', 'pulse', 'fade', 'stealth']
    },
    sounds: {
      theme: 'tactical',
      volume: 0.7
    }
  }
];

export const getThemeById = (themeId: string): BattleTheme => {
  return BATTLE_THEMES.find(theme => theme.id === themeId) || BATTLE_THEMES[0];
};

export const applyBattleTheme = (theme: BattleTheme) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties for the theme
  root.style.setProperty('--battle-primary', theme.colors.primary);
  root.style.setProperty('--battle-secondary', theme.colors.secondary);
  root.style.setProperty('--battle-accent', theme.colors.accent);
  root.style.setProperty('--battle-bg', theme.colors.background);
  root.style.setProperty('--battle-card-bg', theme.colors.cardBg);
  root.style.setProperty('--battle-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--battle-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--battle-success', theme.colors.success);
  root.style.setProperty('--battle-warning', theme.colors.warning);
  root.style.setProperty('--battle-danger', theme.colors.danger);
  root.style.setProperty('--battle-timer-normal', theme.colors.timerNormal);
  root.style.setProperty('--battle-timer-warning', theme.colors.timerWarning);
  root.style.setProperty('--battle-timer-danger', theme.colors.timerDanger);
  root.style.setProperty('--battle-powerup-bg', theme.colors.powerUpBg);
  root.style.setProperty('--battle-button-primary', theme.colors.buttonPrimary);
  root.style.setProperty('--battle-button-secondary', theme.colors.buttonSecondary);
  root.style.setProperty('--battle-border', theme.colors.border);
  
  // Apply gradients
  root.style.setProperty('--battle-gradient-header', theme.gradients.header);
  root.style.setProperty('--battle-gradient-background', theme.gradients.background);
  root.style.setProperty('--battle-gradient-card', theme.gradients.card);
  root.style.setProperty('--battle-gradient-button', theme.gradients.button);
  
  // Apply animation intensity class
  document.body.classList.remove('battle-subtle', 'battle-normal', 'battle-intense');
  document.body.classList.add(`battle-${theme.animations.intensity}`);
  
  // Store theme preference
  localStorage.setItem('battle-theme', theme.id);
};

export const getCurrentTheme = (): BattleTheme => {
  const savedThemeId = localStorage.getItem('battle-theme') || 'avex-classic';
  return getThemeById(savedThemeId);
};