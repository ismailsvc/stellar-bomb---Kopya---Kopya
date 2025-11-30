/**
 * Stellar Bomb - Game Handlers
 * Handler functions for game logic and user actions
 */

import type { Puzzle, UserProfile, LeaderboardEntry, GameDifficulty } from "../shared/types";
import { playClick, sound } from "../shared/utils";
import { TOTAL_TIME_BY_DIFFICULTY, DEFAULT_MISTAKES_BY_DIFFICULTY } from "../config/constants";
import { generatePuzzleWithAI, validateCodeWithAI } from "../services/aiGenerator";
import { saveScore, loadGlobalLeaderboard } from "../services/supabase";
import { puzzles } from "../puzzles";
import { updatePlayerStats, saveLocalLeaderboard } from "../shared/utils";

export interface GameHandlers {
  handleFail: () => void;
  handleCheckCode: () => Promise<void>;
  handleStartGame: () => Promise<void>;
  handleAddLocalScore: () => Promise<void>;
  handleAddSupabaseScore: () => Promise<void>;
}

export const createGameHandlers = (
  setGameState: (state: string) => void,
  setStatus: (msg: string | null) => void,
  setTimeLeft: (time: number) => void,
  setMistakesLeft: (mistakes: number) => void,
  setExploded: (exploded: boolean) => void,
  setPuzzle: (puzzle: Puzzle | null) => void,
  setCode: (code: string) => void,
  setCurrentPage: (page: string) => void,
  setLocalLB: (lb: LeaderboardEntry[]) => void,
  setGlobalLB: (lb: LeaderboardEntry[]) => void,
  setPlayerStats: any,
  puzzle: Puzzle | null,
  code: string,
  profile: UserProfile | null,
  wallet: string | null,
  selectedDifficulty: GameDifficulty,
  timeLeft: number,
  mistakesLeft: number,
  localLB: LeaderboardEntry[]
): GameHandlers => {
  const getRandomPuzzle = (): any => {
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  };

  const handleFail = () => {
    setGameState("fail");
    setStatus("Bomba patladı! 💣");

    sound.tick.pause();
    sound.explosion.currentTime = 0;
    sound.explosion.play().catch(() => {});

    setExploded(true);
    document.body.classList.add("shake");

    if (wallet) {
      const updatedStats = updatePlayerStats(wallet, 0, false, selectedDifficulty);
      setPlayerStats(updatedStats);
    }

    setTimeout(() => {
      setExploded(false);
      document.body.classList.remove("shake");
    }, 600);
  };

  const handleStartGame = async () => {
    const cacheKey = "ai_puzzle_cache";
    let cachedData = localStorage.getItem(cacheKey);
    let cache = cachedData ? JSON.parse(cachedData) : { puzzles: [], timestamp: 0 };

    const needsCaching = !cachedData || cache.puzzles.length < 3;
    if (needsCaching) {
      setStatus("🤖 Puzzle'lar hazırlanıyor...");
      for (let i = 0; i < 2; i++) {
        const result = await generatePuzzleWithAI(selectedDifficulty);
        if (result.success && result.data) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    const puzzleGenerationAttempts = 2;
    let newPuzzle: Puzzle | null = null;

    for (let i = 0; i < puzzleGenerationAttempts; i++) {
      setStatus(`🤖 Puzzle yükleniyor (${i + 1}/${puzzleGenerationAttempts})...`);
      const result = await generatePuzzleWithAI(selectedDifficulty);

      if (result.success && result.data) {
        newPuzzle = result.data as unknown as Puzzle;
        break;
      }

      const isRateLimit = result.error?.includes("Rate limited");
      const waitTime = isRateLimit ? 3000 : 1000;

      if (i < puzzleGenerationAttempts - 1) {
        await new Promise((r) => setTimeout(r, waitTime));
      }
    }

    if (!newPuzzle) {
      setStatus("Manual puzzle yükleniyor...");
      newPuzzle = getRandomPuzzle();
    }

    if (!newPuzzle) {
      setStatus("Puzzle yüklenemedi!");
      return;
    }

    setPuzzle(newPuzzle);
    setCode(newPuzzle.starterCode);

    const gameTime = TOTAL_TIME_BY_DIFFICULTY[selectedDifficulty];
    setTimeLeft(gameTime);

    const mistakes = DEFAULT_MISTAKES_BY_DIFFICULTY[selectedDifficulty];
    setMistakesLeft(mistakes);

    setGameState("playing");
    setStatus(null);
    setCurrentPage("game");
    playClick();
  };

  const handleCheckCode = async () => {
    if (!puzzle) return;

    if (puzzle.id?.toString().includes("ai-")) {
      setStatus("🤖 Kod kontrol ediliyor...");
      const result = await validateCodeWithAI(
        code,
        puzzle.starterCode,
        puzzle.expectedOutput || ""
      );

      if (!result.success || !result.data) {
        const newMistakes = mistakesLeft - 1;
        setMistakesLeft(newMistakes);

        if (newMistakes <= 0) {
          setStatus("Hata hakların bitti! 💣");
          setTimeout(() => handleFail(), 500);
        } else {
          setStatus(`Kod hala hatalı! (${newMistakes} hak kaldı)`);
        }
        return;
      }

      setGameState("success");
      setStatus("Doğru! 🎉");

      sound.tick.pause();
      sound.success.currentTime = 0;
      sound.success.play().catch(() => {});

      await handleAddLocalScore();
      await handleAddSupabaseScore();
      return;
    }

    if (!(puzzle as any).check || !(puzzle as any).check(code)) {
      const newMistakes = mistakesLeft - 1;
      setMistakesLeft(newMistakes);

      if (newMistakes <= 0) {
        setStatus("Hata hakların bitti! 💣");
        setTimeout(() => handleFail(), 500);
      } else {
        setStatus(`Kod hata var! (${newMistakes} hak kaldı)`);
      }
      return;
    }

    setGameState("success");
    setStatus("Doğru! 🎉");

    sound.tick.pause();
    sound.success.currentTime = 0;
    sound.success.play().catch(() => {});

    await handleAddLocalScore();
    await handleAddSupabaseScore();
  };

  const handleAddLocalScore = async () => {
    if (!puzzle || !profile) return;

    const entry: LeaderboardEntry = {
      wallet_address: wallet ?? "Anonim",
      username: profile.username || "Anonim",
      puzzle_title: puzzle.title,
      remaining_time: timeLeft,
      created_at: new Date().toISOString(),
      difficulty: selectedDifficulty,
    };

    const updated = [entry, ...localLB].slice(0, 20);
    setLocalLB(updated);
    saveLocalLeaderboard(updated);

    if (wallet) {
      const updatedStats = updatePlayerStats(wallet, timeLeft, true, selectedDifficulty);
      setPlayerStats(updatedStats);
    }

    if (wallet) {
      await saveScore({
        wallet_address: wallet,
        username: profile.username,
        puzzle_title: puzzle.title,
        difficulty: selectedDifficulty,
        remaining_time: timeLeft,
      });
    }
  };

  const handleAddSupabaseScore = async () => {
    if (!puzzle || !wallet || !profile) return;

    const entry = {
      wallet_address: wallet,
      username: profile.username || "Anonim",
      puzzle_title: puzzle.title,
      remaining_time: timeLeft,
      difficulty: selectedDifficulty,
    };

    await saveScore(entry);
    const updated = await loadGlobalLeaderboard(selectedDifficulty);
    setGlobalLB(updated);
  };

  return {
    handleFail,
    handleCheckCode,
    handleStartGame,
    handleAddLocalScore,
    handleAddSupabaseScore,
  };
};
