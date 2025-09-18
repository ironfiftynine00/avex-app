import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Swords, Trophy, Clock, Users, Target, Zap } from "lucide-react";
import { useBattleHistory, useBattleStats } from "@/hooks/useBattleData";

interface BattleHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BattleStats {
  battlesWon: number;
  totalBattles: number;
  winRate: number;
  powerUpsUsed: number;
}

export function BattleHistoryModal({ open, onOpenChange }: BattleHistoryModalProps) {
  const { data: battleStats } = useBattleStats() as { data: BattleStats | undefined };
  const { data: battleHistory } = useBattleHistory(20);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500 bg-yellow-500/10';
    if (rank === 2) return 'text-gray-400 bg-gray-400/10';
    if (rank === 3) return 'text-orange-500 bg-orange-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] h-[95vh] flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            Battle Mode History
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Battle Stats Overview */}
          <div className="flex-shrink-0 grid grid-cols-4 gap-4 mb-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-3 text-center bg-purple-50 dark:bg-purple-900/20">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {battleStats?.battlesWon || 0}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Victories</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-3 text-center bg-blue-50 dark:bg-blue-900/20">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {battleStats?.totalBattles || 0}
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total Battles</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-3 text-center bg-green-50 dark:bg-green-900/20">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {battleStats?.winRate ? `${battleStats.winRate}%` : '0%'}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Win Rate</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="p-3 text-center bg-orange-50 dark:bg-orange-900/20">
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {battleStats?.powerUpsUsed || 0}
                </div>
                <div className="text-xs text-orange-700 dark:text-orange-300">Power-ups Used</div>
              </CardContent>
            </Card>
          </div>

          {/* Battle History */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-6">
              {Array.isArray(battleHistory) && battleHistory.length > 0 ? (
                battleHistory.map((battle: any) => (
                  <Card key={battle.id} className={`border-2 shadow-sm ${
                    battle.isWinner 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRankColor(battle.userRank)}`}>
                            {getRankIcon(battle.userRank)}
                            Rank #{battle.userRank}
                          </div>
                          <Badge variant={battle.isWinner ? "default" : "secondary"} className="text-xs">
                            {battle.isWinner ? "VICTORY" : "DEFEAT"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(battle.createdAt)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{battle.userScore}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{battle.correctAnswers}/{battle.totalAnswered}</div>
                            <div className="text-xs text-muted-foreground">Correct</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{battle.totalParticipants}</div>
                            <div className="text-xs text-muted-foreground">Players</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{formatDuration(battle.duration)}</div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {battle.categoryName || 'General Knowledge'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {battle.gameMode || 'Classic'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {battle.powerUpsUsed > 0 && (
                            <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                              <Zap className="w-3 h-3" />
                              {battle.powerUpsUsed} power-ups
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Room: {battle.roomCode}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Swords className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No battles yet</p>
                  <p className="text-gray-400 text-sm">Your battle history will appear here after your first match</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}