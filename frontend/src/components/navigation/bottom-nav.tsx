import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Book, 
  ClipboardCheck, 
  Swords, 
  User 
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/study", icon: Book, label: "Study" },
  { path: "/mock-exam", icon: ClipboardCheck, label: "Exam" },
  { path: "/battle", icon: Swords, label: "Battle" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                isActive 
                  ? "text-avex-blue" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
