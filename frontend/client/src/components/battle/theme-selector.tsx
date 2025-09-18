import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BATTLE_THEMES, BattleTheme, applyBattleTheme, getCurrentTheme } from "@/lib/battle-themes";
import { Palette, Check, Volume2 } from "lucide-react";

interface ThemeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeSelect: (theme: BattleTheme) => void;
}

export default function ThemeSelector({ open, onOpenChange, onThemeSelect }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<BattleTheme>(getCurrentTheme());
  const [previewTheme, setPreviewTheme] = useState<BattleTheme | null>(null);

  const handleThemePreview = (theme: BattleTheme) => {
    setPreviewTheme(theme);
    applyBattleTheme(theme);
  };

  const handleThemeSelect = (theme: BattleTheme) => {
    setSelectedTheme(theme);
    applyBattleTheme(theme);
    onThemeSelect(theme);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Restore original theme
    applyBattleTheme(selectedTheme);
    setPreviewTheme(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="w-6 h-6" />
            <span>Battle Mode Themes</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Choose a theme to customize your Battle Mode experience. Each theme includes unique colors, animations, and sound effects.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BATTLE_THEMES.map((theme) => (
              <Card 
                key={theme.id} 
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                } ${previewTheme?.id === theme.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleThemePreview(theme)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    {selectedTheme.id === theme.id && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Theme Preview */}
                  <div 
                    className="h-20 rounded-lg relative overflow-hidden"
                    style={{ background: theme.gradients.background }}
                  >
                    <div 
                      className="absolute top-2 left-2 right-2 h-6 rounded"
                      style={{ background: theme.gradients.header }}
                    />
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      <div 
                        className="w-6 h-2 rounded"
                        style={{ backgroundColor: theme.colors.success }}
                      />
                      <div 
                        className="w-4 h-2 rounded"
                        style={{ backgroundColor: theme.colors.warning }}
                      />
                      <div 
                        className="w-3 h-2 rounded"
                        style={{ backgroundColor: theme.colors.danger }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {theme.description}
                  </p>
                  
                  {/* Theme Features */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {theme.animations.intensity}
                    </Badge>
                    <Badge variant="outline" className="text-xs flex items-center space-x-1">
                      <Volume2 className="w-3 h-3" />
                      <span>{theme.sounds.theme}</span>
                    </Badge>
                  </div>
                  
                  {/* Theme Effects */}
                  <div className="flex flex-wrap gap-1">
                    {theme.animations.effects.slice(0, 3).map((effect) => (
                      <Badge key={effect} variant="outline" className="text-xs">
                        {effect}
                      </Badge>
                    ))}
                    {theme.animations.effects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{theme.animations.effects.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme);
                    }}
                    className="w-full"
                    style={{ 
                      background: theme.gradients.button,
                      border: 'none'
                    }}
                  >
                    Select Theme
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Current Selection Info */}
          {previewTheme && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Previewing: {previewTheme.name}
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {previewTheme.description}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {previewTheme && (
              <Button 
                onClick={() => handleThemeSelect(previewTheme)}
                style={{ 
                  background: previewTheme.gradients.button,
                  border: 'none'
                }}
              >
                Apply {previewTheme.name}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}