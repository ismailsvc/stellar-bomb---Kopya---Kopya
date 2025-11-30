/**
 * Custom Hooks for Multiplayer Game Logic
 * Multiplayer durum yönetimi ve poll mekanizmaları
 */

import { useEffect, useCallback } from "react";
import * as matchService from "./service";
import type { MatchResult } from "./types";

/**
 * Rakip bağlantısını otomatik kontrol et
 */
export function useOpponentPolling(
  enabled: boolean,
  matchCode: string | null,
  onOpponentJoined: (username: string) => void
) {
  useEffect(() => {
    if (!enabled || !matchCode) return;

    console.log(`🔄 Starting opponent polling for: ${matchCode}`);

    const checkMatch = async () => {
      const result = await matchService.getMatchStatus(matchCode);
      if (result.success && result.data?.match) {
        const match = result.data.match;
        if (match.player2_wallet && match.player2_username) {
          console.log(`✅ Opponent joined: ${match.player2_username}`);
          onOpponentJoined(match.player2_username);
        }
      }
    };

    // İlk kontrol
    checkMatch();

    // Her 1 saniyede kontrol et
    const interval = setInterval(checkMatch, 1000);
    return () => clearInterval(interval);
  }, [enabled, matchCode, onOpponentJoined]);
}

/**
 * Rakip sonucunu otomatik kontrol et
 */
export function useMatchResultPolling(
  enabled: boolean,
  matchCode: string | null,
  playerWallet: string | null,
  gameFinished: boolean,
  playerTime: number,
  onResultReceived: (result: MatchResult) => void
) {
  useEffect(() => {
    if (!enabled || !matchCode || !gameFinished || !playerWallet) return;

    console.log(`🔄 Polling for opponent result on match: ${matchCode}`);

    const checkOpponentResult = async () => {
      const result = await matchService.getMatchStatus(matchCode);
      if (result.success && result.data?.match) {
        const match = result.data.match;
        const isPlayer1 = match.player1_wallet === playerWallet;

        // Rakip çözdü mü?
        if (
          isPlayer1 &&
          match.player2_solved &&
          match.player2_time !== null &&
          match.player2_time !== undefined
        ) {
          console.log(`✅ Opponent solved: ${match.player2_time}s`);
          onResultReceived({
            playerTime,
            opponentTime: match.player2_time,
            playerWon: playerTime < match.player2_time,
          });
        } else if (
          !isPlayer1 &&
          match.player1_solved &&
          match.player1_time !== null &&
          match.player1_time !== undefined
        ) {
          console.log(`✅ Opponent solved: ${match.player1_time}s`);
          onResultReceived({
            playerTime,
            opponentTime: match.player1_time,
            playerWon: playerTime < match.player1_time,
          });
        }
      }
    };

    // İlk kontrol
    checkOpponentResult();

    // Her 500ms kontrol et
    const interval = setInterval(checkOpponentResult, 500);
    return () => clearInterval(interval);
  }, [enabled, matchCode, playerWallet, gameFinished, playerTime, onResultReceived]);
}

/**
 * Oyuncu çözümünü otomatik kaydet
 */
export function useSolutionSubmit(
  enabled: boolean,
  matchCode: string | null,
  playerWallet: string | null,
  gameFinished: boolean,
  playerTime: number
) {
  useEffect(() => {
    if (!enabled || !matchCode || !playerWallet || !gameFinished) return;

    // Daha önce bu maç için solve kaydı yapıldı mı?
    const savedKey = `match_solved_${matchCode}_${playerWallet}`;
    if (localStorage.getItem(savedKey)) return;

    console.log(`📊 Submitting solution for match ${matchCode}: ${playerTime}s`);

    matchService.submitSolution(matchCode, playerWallet, true, playerTime).then((result) => {
      if (result.success) {
        console.log(`✅ Solution submitted successfully`);
        localStorage.setItem(savedKey, "true");
      } else {
        console.error(`❌ Failed to submit solution:`, result.error);
      }
    });
  }, [enabled, matchCode, playerWallet, gameFinished, playerTime]);
}

/**
 * Tüm multiplayer state'ini yönet
 */
export interface UseMultiplayerOptions {
  wallet: string | null;
  enabled: boolean;
}

export interface UseMultiplayerReturn {
  matchCode: string | null;
  setMatchCode: (code: string | null) => void;
  opponentUsername: string | null;
  opponentReady: boolean;
  matchResult: MatchResult | null;
  setMatchResult: (result: MatchResult | null) => void;
  resetState: () => void;
}

export function useMultiplayerState(): UseMultiplayerReturn {
  const [matchCode, setMatchCode] = [null, () => {}] as any;
  const [opponentUsername, setOpponentUsername] = [null, () => {}] as any;
  const [opponentReady, setOpponentReady] = [false, () => {}] as any;
  const [matchResult, setMatchResult] = [null, () => {}] as any;

  const resetState = useCallback(() => {
    setMatchCode(null);
    setOpponentUsername(null);
    setOpponentReady(false);
    setMatchResult(null);
  }, []);

  return {
    matchCode,
    setMatchCode,
    opponentUsername,
    opponentReady,
    matchResult,
    setMatchResult,
    resetState,
  };
}
