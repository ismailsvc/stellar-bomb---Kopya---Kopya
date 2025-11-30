/**
 * Stellar Bomb - Type Definitions
 * Centralized type definitions for the entire application
 */

/* =====================================================
   GAME TYPES
===================================================== */

export type GameState = "idle" | "playing" | "success" | "fail";
export type GamePage = "home" | "game" | "profile" | "leaderboard" | "about" | "mode-select";
export type GameDifficulty = "easy" | "medium" | "hard";
export type GameMode = "single" | "bot" | "multiplayer";
export type DemoStatus = "idle" | "success" | "error";

/* =====================================================
   PROFILE & USER TYPES
===================================================== */

export interface UserProfile {
  username: string;
  avatar?: string;
  photoUrl?: string;
  bio?: string;
  level?: number;
  selected_frame?: string;
}

export interface UserProfileSupabase {
  wallet_address: string;
  username: string;
  avatar?: string;
  photo_url?: string;
  bio?: string;
  level?: number;
  selected_frame?: string;
  created_at?: string;
  updated_at?: string;
}

/* =====================================================
   LEADERBOARD TYPES
===================================================== */

export interface LeaderboardEntry {
  wallet_address: string;
  username: string;
  puzzle_title: string;
  remaining_time: number;
  created_at: string;
  difficulty?: GameDifficulty;
  points?: number; // Points earned from this puzzle
  avatar?: string; // User's avatar emoji
  selected_frame?: string; // User's selected avatar frame
  total_points?: number; // User's total points across all solved puzzles
}

/* =====================================================
   STATISTICS TYPES
===================================================== */

export interface PlayerStats {
  totalGames: number;
  successfulGames: number;
  failedGames: number;
  bestScore: number;
  averageScore: number;
  totalTime: number;
  easySuccessful: number;
  mediumSuccessful: number;
  hardSuccessful: number;
  lastUpdated: string;
}

/* =====================================================
   AVATAR & FRAME TYPES
===================================================== */

export interface AvatarData {
  emoji: string;
  name: string;
  description: string;
  cost: number;
}

export interface AvatarFrameData {
  id: string;
  name: string;
  description: string;
  cost: number;
  animation: string;
}

/* =====================================================
   PUZZLE TYPES
===================================================== */

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput?: string;
  category: GameDifficulty;
}

/* =====================================================
   MULTIPLAYER TYPES
===================================================== */

export interface MatchResult {
  playerTime: number;
  opponentTime: number;
  playerWon: boolean;
}

export interface PurchaseModalState {
  isOpen: boolean;
  avatar: AvatarData | null;
  frame?: AvatarFrameData;
}

/* =====================================================
   NOTIFICATION TYPES
===================================================== */

export type NotificationMessage = string | null;
