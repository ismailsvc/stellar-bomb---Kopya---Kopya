/**
 * Stellar Bomb - Constants
 * Centralized constants for the entire application
 */

import type { AvatarData, AvatarFrameData } from "../shared/types";
import type { GameDifficulty } from "../shared/types";

/* =====================================================
   GAME CONSTANTS
===================================================== */

export const TOTAL_TIME = 30;

export const TOTAL_TIME_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 40,
  medium: 30,
  hard: 20,
};

export const DEFAULT_MISTAKES_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 3,
  medium: 1,
  hard: 0,
};

/* =====================================================
   STORAGE KEYS
===================================================== */

export const STORAGE_KEYS = {
  LOCAL_LEADERBOARD: "stellarBombLeaderboard",
  PUZZLE_CACHE: "ai_puzzle_cache",
  SAVED_WALLETS: "savedWallets",
  SELECTED_AVATAR: "selectedAvatar",
  SELECTED_FRAME: "selectedFrame",
  PROFILE: (address: string) => `profile_${address}`,
  PLAYER_STATS: (address: string) => `stats_${address}`,
  MATCH_SOLVED: (matchCode: string, wallet: string) => `match_solved_${matchCode}_${wallet}`,
} as const;

/* =====================================================
   AVATAR SYSTEM
===================================================== */

export const AVATARS_DATA: AvatarData[] = [
  { emoji: "👨‍💻", name: "Hacker Adam", description: "Kod çözen özgüven sahibi", cost: 0 },
  { emoji: "👩‍💻", name: "Hacker Kız", description: "Programlama tutkunu", cost: 0 },
  { emoji: "🧑‍💻", name: "Dev", description: "Geliştirici ruhu", cost: 0.5 },
  { emoji: "🐱", name: "Tekno Kedi", description: "Tıkıl tıkıl hızlı çözüm", cost: 1 },
  { emoji: "🐶", name: "Oyuncu Köpek", description: "Sadık ve hızlı", cost: 1 },
  { emoji: "🦊", name: "Kırmızı Tilki", description: "Zekâ ve hile ustası", cost: 2 },
  { emoji: "🦁", name: "Şampiyonlar Aslanı", description: "Leaderboard kraliçesi", cost: 5 },
  { emoji: "🐸", name: "Hızlı Kurbağa", description: "Her zıplayışta ilerleme", cost: 1.5 },
  { emoji: "🦾", name: "Siber Kollu", description: "Geleceğin oyuncusu", cost: 3 },
  { emoji: "👽", name: "Uzaylı Zeka", description: "Başka dünyadan yetenekli", cost: 10 },
];

export const AVATARS = AVATARS_DATA.map((a) => a.emoji);

/* =====================================================
   AVATAR FRAMES SYSTEM
===================================================== */

export const AVATAR_FRAMES_DATA: AvatarFrameData[] = [
  {
    id: "frame-none",
    name: "Çerçevesiz",
    description: "Standart avatar",
    cost: 0,
    animation: "none",
  },
  {
    id: "frame-heart",
    name: "Kalp Aşkı",
    description: "Pembe kalp desenli çerçeve",
    cost: 1.5,
    animation: "heart-pulse",
  },
  {
    id: "frame-wave",
    name: "Dalga Derya",
    description: "Mavi dalgalı çerçeve",
    cost: 2,
    animation: "wave-flow",
  },
  {
    id: "frame-feather",
    name: "Altın Kanat",
    description: "Altın tüy desenli çerçeve",
    cost: 2,
    animation: "feather-drift",
  },
  {
    id: "frame-stars",
    name: "Yıldız Gökyüzü",
    description: "Mor yıldız parıltılı çerçeve",
    cost: 2.5,
    animation: "stars-twinkle",
  },
  {
    id: "frame-thorns",
    name: "Gül Dikenleri",
    description: "Kırmızı gül ve dikenli",
    cost: 2.5,
    animation: "thorns-shine",
  },
  {
    id: "frame-crown",
    name: "Kraliyet Taçı",
    description: "Altın taç ve mücevher",
    cost: 3,
    animation: "crown-gleam",
  },
];

/* =====================================================
   CACHE CONSTANTS
===================================================== */

export const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/* =====================================================
   API CONSTANTS
===================================================== */

export const POLLING_INTERVALS = {
  MATCH_JOIN: 1000, // 1 second - check if opponent joined
  MATCH_RESULT: 500, // 500ms - check opponent result
} as const;

export const TIMEOUTS = {
  AUTO_LOGIN_DELAY: 3500, // milliseconds
  INTRO_DURATION: 3000, // milliseconds
  STATUS_MESSAGE_DURATION: 2000, // milliseconds
} as const;
