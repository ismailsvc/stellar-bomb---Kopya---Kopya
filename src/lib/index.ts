/**
 * Stellar Bomb - Library Exports
 * Centralized exports for all library modules
 */

/* =====================================================
   SUPABASE EXPORTS
===================================================== */

export {
  supabase,
  saveUserProfile,
  loadUserProfile,
  saveScore,
  loadGlobalLeaderboard,
  saveAvatarPurchase,
  getPurchasedAvatars,
  saveFramePurchase,
  getPurchasedFrames,
  saveSelectedFrame,
  createMultiplayerMatch,
  joinMultiplayerMatch,
  getMatchStatus,
  submitMatchSolution,
} from "./supabase";

export type { UserProfile } from "./supabase";

/* =====================================================
   AI GENERATOR EXPORTS
===================================================== */

export {
  generatePuzzleWithAI,
  validateCodeWithAI,
} from "./aiGenerator";

export type { Puzzle as AIPuzzle, AIResponse } from "./aiGenerator";

/* =====================================================
   GITHUB EXPORTS
===================================================== */

export {
  githubCreateIssue,
  githubGetIssues,
} from "./github";

/* =====================================================
   STELLAR WALLET EXPORTS
===================================================== */

export {
  connectFreighter,
  getAccountBalance,
  purchaseAvatar,
} from "../stellar/wallet";

/* =====================================================
   SESSION MANAGEMENT EXPORTS
===================================================== */

export {
  saveSession,
  getSession,
  clearSession,
  verifySessionWithBlockchain,
} from "./sessionManager";

/* =====================================================
   MULTIPLAYER EXPORTS
===================================================== */

export * from "./multiplayer";
