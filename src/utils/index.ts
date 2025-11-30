/**
 * Stellar Bomb - Utility Functions
 * Common helper functions used throughout the application
 */

import type { LeaderboardEntry, PlayerStats, GameDifficulty } from "../types";
import { STORAGE_KEYS } from "../constants";

/* =====================================================
   AUDIO UTILITIES
===================================================== */

export const sound = {
  tick: new Audio("/sounds/tick.mp3"),
  explosion: new Audio("/sounds/explosion.mp3"),
  success: new Audio("/sounds/success.mp3"),
  click: new Audio("/sounds/click.mp3"),
};

export const playClick = () => {
  sound.click.pause();
  sound.click.currentTime = 0;
  sound.click.play().catch(() => {});
};

export const stopTick = () => {
  sound.tick.pause();
  sound.tick.currentTime = 0;
};

/* =====================================================
   CLIPBOARD UTILITIES
===================================================== */

export const copyToClipboardFallback = (text: string): boolean => {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch (err) {
    console.error("Fallback kopyalama hatası:", err);
    return false;
  }
};

/* =====================================================
   LEADERBOARD UTILITIES
===================================================== */

export const loadLocalLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_LEADERBOARD) || "[]");
    // Eski veriler için avatar/selected_frame ekle
    return data.map((entry: any) => ({
      ...entry,
      avatar: entry.avatar || "👨‍💻",
      selected_frame: entry.selected_frame || "frame-none",
    }));
  } catch {
    return [];
  }
};

export const saveLocalLeaderboard = (list: LeaderboardEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.LOCAL_LEADERBOARD, JSON.stringify(list));
};

export const maskAddress = (addr?: string | null): string => {
  if (!addr) return "Anonim";
  return addr.slice(0, 4) + "..." + addr.slice(-4);
};

/* =====================================================
   STATISTICS UTILITIES
===================================================== */

export const puzzleScore = (remainingTime: number, difficulty: GameDifficulty): number => {
  const basePoints: Record<GameDifficulty, number> = {
    easy: 100,
    medium: 200,
    hard: 500,
  };
  const timeBonus = Math.max(0, Math.floor(remainingTime * 10));
  return (basePoints[difficulty] || 200) + timeBonus;
};

/* =====================================================
   PROFILE UTILITIES
===================================================== */

export const getDefaultStats = (): PlayerStats => ({
  totalGames: 0,
  successfulGames: 0,
  failedGames: 0,
  bestScore: 0,
  averageScore: 0,
  totalTime: 0,
  easySuccessful: 0,
  mediumSuccessful: 0,
  hardSuccessful: 0,
  lastUpdated: new Date().toISOString(),
});

export const loadPlayerStats = (address: string): PlayerStats => {
  try {
    const stats = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PLAYER_STATS(address)) ||
        JSON.stringify(getDefaultStats())
    );
    return stats;
  } catch {
    return getDefaultStats();
  }
};

export const savePlayerStats = (address: string, stats: PlayerStats): void => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_STATS(address), JSON.stringify(stats));
};

export const updatePlayerStats = (
  address: string,
  newScore: number,
  isSuccess: boolean = true,
  difficulty: GameDifficulty = "medium"
): PlayerStats => {
  const stats = loadPlayerStats(address);

  if (isSuccess) {
    stats.successfulGames += 1;
    stats.bestScore = Math.max(stats.bestScore, newScore);
    stats.totalTime += newScore;
    stats.averageScore =
      stats.successfulGames > 0 ? Math.round(stats.totalTime / stats.successfulGames) : 0;

    // Track successful games by difficulty
    if (difficulty === "easy") stats.easySuccessful += 1;
    else if (difficulty === "medium") stats.mediumSuccessful += 1;
    else if (difficulty === "hard") stats.hardSuccessful += 1;
  } else {
    stats.failedGames += 1;
  }

  // Total games is always the sum of successful and failed
  stats.totalGames = stats.successfulGames + stats.failedGames;
  stats.lastUpdated = new Date().toISOString();
  savePlayerStats(address, stats);

  return stats;
};
