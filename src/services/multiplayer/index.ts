/**
 * Multiplayer Module
 * Tüm multiplayer işlevselliğinin merkezi kaynağı
 */

// Types
export * from "./types";

// Services
export * as MultiplayerService from "./service";
export {
  createMatch,
  joinMatch,
  getMatchStatus,
  submitSolution,
  getMatchDetails,
  getPlayerMatches,
  generateMatchCode,
} from "./service";

// Hooks
export {
  useOpponentPolling,
  useMatchResultPolling,
  useSolutionSubmit,
  useMultiplayerState,
  type UseMultiplayerOptions,
  type UseMultiplayerReturn,
} from "./hooks";
