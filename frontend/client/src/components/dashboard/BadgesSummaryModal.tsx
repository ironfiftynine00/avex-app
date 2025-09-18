import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge, X, Check, Lock } from "lucide-react";
import { BADGES } from "@/lib/constants";
import BadgeCard, { getBadgeIcon } from "@/components/badges/badge-card";

interface BadgesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBadges: any[];
}

export function BadgesSummaryModal({ isOpen, onClose, userBadges }: BadgesSummaryModalProps) {
  const earnedBadges = BADGES.filter(badge => 
    Array.isArray(userBadges) ? userBadges.some((ub: any) => ub.id === badge.id) : false
  );
  
  const unearnedBadges = BADGES.filter(badge => 
    Array.isArray(userBadges) ? !userBadges.some((ub: any) => ub.id === badge.id) : true
  );

  const earnedCount = earnedBadges.length;
  const totalCount = BADGES.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg border border-yellow-500">
                <Badge className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Achievement Badges
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {earnedCount} of {totalCount} badges earned
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((earnedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Earned Badges Section */}
        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Earned Badges ({earnedBadges.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {earnedBadges.map((badge) => {
                const earnedBadge = Array.isArray(userBadges) ? userBadges.find((ub: any) => ub.id === badge.id) : null;
                
                return (
                  <div
                    key={badge.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative mb-3">
                      <div className="w-12 h-12 mx-auto flex items-center justify-center">
                        {getBadgeIcon(badge.name, true)}
                      </div>
                      {/* Earned indicator */}
                      <div className="absolute -top-1 -right-1">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {badge.description}
                    </p>
                    {earnedBadge?.earnedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Earned {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unearned Badges Section */}
        {unearnedBadges.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Not Yet Earned ({unearnedBadges.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {unearnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center opacity-60"
                >
                  <div className="relative mb-3">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center saturate-0">
                      {getBadgeIcon(badge.name, false)}
                    </div>
                    {/* Lock indicator */}
                    <div className="absolute -top-1 -right-1">
                      <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        <Lock className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {earnedBadges.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Badge className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Badges Earned Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start studying and taking quizzes to earn your first badge!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}