import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Moon, Plane, Sun } from "lucide-react";

export default function TopNav() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-background border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-avex-blue to-avex-indigo rounded-lg flex items-center justify-center">
            <Plane className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-avex-blue">AVEX</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-400" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={user?.profileImageUrl || ""} 
                    alt={`${user?.firstName || "User"} ${user?.lastName || ""}`}
                  />
                  <AvatarFallback className="bg-avex-blue text-white text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                Profile
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
