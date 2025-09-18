import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StudyHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function StudyHeader({ title, onBack }: StudyHeaderProps) {
  return (
    <div className="bg-background border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center space-x-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>
    </div>
  );
}