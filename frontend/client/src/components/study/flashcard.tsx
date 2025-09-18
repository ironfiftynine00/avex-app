import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, RotateCcw } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  category: string;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export default function Flashcard({ 
  front, 
  back, 
  category, 
  onBookmark,
  isBookmarked = false 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full">
      <div className={`flip-card w-full h-48 mb-4 ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-inner relative w-full h-full">
          {/* Front */}
          <Card 
            className="flip-card-front absolute inset-0 cursor-pointer"
            onClick={handleFlip}
          >
            <CardContent className="h-full bg-gradient-to-br from-avex-blue to-avex-indigo rounded-lg p-4 flex items-center justify-center text-white">
              <div className="text-center">
                <h4 className="font-semibold mb-2">{category}</h4>
                <p className="text-sm opacity-90">{front}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Back */}
          <Card 
            className="flip-card-back absolute inset-0 cursor-pointer"
            onClick={handleFlip}
          >
            <CardContent className="h-full bg-gradient-to-br from-avex-purple to-avex-violet rounded-lg p-4 flex items-center justify-center text-white">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Answer</h4>
                <p className="text-sm">{back}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tap to flip</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            className={`p-2 h-8 w-8 ${isBookmarked ? 'text-yellow-500' : ''}`}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFlip}
            className="p-2 h-8 w-8"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
