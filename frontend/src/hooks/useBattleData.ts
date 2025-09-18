import { useQuery } from "@tanstack/react-query";

export function useBattleStats() {
  return useQuery({
    queryKey: ['/api/battle/stats'],
    retry: false,
  });
}

export function useBattleHistory(limit?: number) {
  return useQuery({
    queryKey: ['/api/battle/history', limit],
    queryFn: () => fetch(`/api/battle/history${limit ? `?limit=${limit}` : ''}`).then(res => res.json()),
    retry: false,
  });
}