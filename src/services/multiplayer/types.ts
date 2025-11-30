/**
 * Multiplayer Types and Interfaces
 * Tüm multiplayer ile ilgili type tanımlamaları
 */

export type MultiplayerMatch = {
  id?: string;
  match_code: string;
  puzzle_id: string;
  puzzle_title: string;
  difficulty: "easy" | "medium" | "hard";
  player1_wallet: string;
  player1_username: string;
  player2_wallet?: string;
  player2_username?: string;
  puzzle_data: {
    title: string;
    description: string;
    starterCode: string;
    expectedOutput: string;
    isAI: boolean;
  };
  player1_solved?: boolean;
  player1_time?: number;
  player2_solved?: boolean;
  player2_time?: number;
  status: "waiting" | "in_progress" | "completed";
  created_at?: string;
  updated_at?: string;
};

export type MatchResult = {
  playerTime: number;
  opponentTime: number;
  playerWon: boolean;
};

export type MultiplayerState = {
  multiplayerMode: boolean;
  matchCode: string | null;
  opponentUsername: string | null;
  opponentReady: boolean;
  matchResult: MatchResult | null;
};

export type MatchResponse<T = void> = {
  success: boolean;
  error?: string;
} & T;

export type CreateMatchResponse = {
  success: boolean;
  error?: string;
  matchCode?: string;
  data?: { matchCode: string };
};

export type JoinMatchResponse = {
  success: boolean;
  error?: string;
  match?: MultiplayerMatch;
  data?: { match: MultiplayerMatch };
};

export type GetMatchResponse = {
  success: boolean;
  error?: string;
  match?: MultiplayerMatch;
  data?: { match: MultiplayerMatch };
};
