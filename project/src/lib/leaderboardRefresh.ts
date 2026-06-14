type LeaderboardRefreshListener = () => void;

const listeners = new Set<LeaderboardRefreshListener>();

/** Subscribe to local leaderboard refresh requests (e.g. after earning points). */
export function onLeaderboardRefresh(listener: LeaderboardRefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Request all open leaderboard views to reload. */
export function notifyLeaderboardRefresh(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      /* ignore subscriber errors */
    }
  });
}
