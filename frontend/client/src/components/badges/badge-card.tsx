import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, Medal, Flame, BookOpen, CheckCircle, Crown, Check,
  UserPlus, Scale, Wrench
} from "lucide-react";

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  gradient: string;
  isEarned: boolean;
  earnedAt?: string;
}

export const getBadgeIcon = (badgeName: string, isEarned: boolean) => {
  const iconConfig: { [key: string]: { icon: JSX.Element; color: string } } = {
    "Rookie Wrencher": { 
      icon: <UserPlus className="w-6 h-6" />, 
      color: isEarned ? "text-yellow-200" : "text-yellow-400/60" 
    },
    "Study Starter": { 
      icon: <BookOpen className="w-6 h-6" />, 
      color: isEarned ? "text-blue-200" : "text-blue-400/60" 
    },
    "First Pass!": { 
      icon: <CheckCircle className="w-6 h-6" />, 
      color: isEarned ? "text-green-200" : "text-green-400/60" 
    },
    "Air Law Ace": { 
      icon: <Scale className="w-6 h-6" />, 
      color: isEarned ? "text-purple-200" : "text-purple-400/60" 
    },
    "Maintenance Pro": { 
      icon: <Wrench className="w-6 h-6" />, 
      color: isEarned ? "text-orange-200" : "text-orange-400/60" 
    },
    "Consistent Cadet": { 
      icon: <Flame className="w-6 h-6" />, 
      color: isEarned ? "text-red-200" : "text-red-400/60" 
    },
    "Quiz Champion": { 
      icon: <Trophy className="w-6 h-6" />, 
      color: isEarned ? "text-yellow-200" : "text-yellow-400/60" 
    },
    "Full License!": { 
      icon: <Crown className="w-6 h-6" />, 
      color: isEarned ? "text-pink-200" : "text-pink-400/60" 
    }
  };
  
  const config = iconConfig[badgeName] || { 
    icon: <Medal className="w-6 h-6" />, 
    color: isEarned ? "text-gray-200" : "text-gray-400/60" 
  };
  
  return <div className={config.color}>{config.icon}</div>;
};

export default function BadgeCard({ 
  name, 
  description, 
  icon, 
  gradient, 
  isEarned,
  earnedAt 
}: BadgeCardProps) {


  return (
    <div className="relative group flex-shrink-0">
      {/* Compact Square Badge Card */}
      <div 
        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden w-24 h-24 ${
          isEarned 
            ? `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl` 
            : `bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-80`
        }`}
        title={isEarned ? `${name} - Earned ${earnedAt ? new Date(earnedAt).toLocaleDateString() : ''}` : `${name} - ${description}`}
      >

        
        {/* Icon */}
        <div className="relative z-10 mb-1">
          {getBadgeIcon(name, isEarned)}
        </div>

        {/* Badge Name */}
        <div className="relative z-10 text-center">
          <h4 className={`font-semibold text-xs leading-tight ${isEarned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
            {name.split(' ').map((word, index) => (
              <div key={index}>{word}</div>
            ))}
          </h4>
        </div>

        {/* Enhanced Earned Indicator */}
        {isEarned && (
          <div className="absolute top-1 right-1">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg">
              <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Tooltip */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
        <div className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl border ${
          isEarned 
            ? 'bg-gray-900 text-white border-gray-700' 
            : 'bg-gray-600 text-gray-100 border-gray-500'
        }`}>
          <div className="font-semibold">{name}</div>
          {isEarned && earnedAt && (
            <div className="text-xs opacity-75 mt-1">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </div>
          )}
          {!isEarned && (
            <div className="text-xs opacity-75 mt-1">
              {description}
            </div>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${
          isEarned ? 'border-b-gray-900' : 'border-b-gray-600'
        }`}></div>
      </div>
    </div>
  );
}
