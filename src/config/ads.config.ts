/**
 * ADVERTISING CONFIGURATION
 * Reklam ve sponsorluk yönetimi
 */

export interface AdPlacement {
  id: string;
  name: string;
  location: "header" | "sidebar" | "leaderboard" | "popup" | "modal";
  type: "banner" | "sponsored-content" | "spotlight" | "notification";
  width?: number;
  height?: number;
  enabled: boolean;
  rotation?: number; // ms arası reklam değişimi
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  sponsor_name: string;
  sponsor_logo?: string;
  placement_ids: string[];
  start_date: string;
  end_date: string;
  cta_text: string;
  cta_url: string;
  priority: "high" | "medium" | "low";
  active: boolean;
  impressions?: number;
  clicks?: number;
}

/**
 * AD PLACEMENTS - Reklam yerleri
 */
export const AD_PLACEMENTS: Record<string, AdPlacement> = {
  // Header'da başlık altında banner
  HEADER_BANNER: {
    id: "header-banner",
    name: "Header Banner",
    location: "header",
    type: "banner",
    width: 1200,
    height: 100,
    enabled: true,
    rotation: 30000, // 30 saniye
  },

  // Sidebar'da sponsor spotlight
  SIDEBAR_SPOTLIGHT: {
    id: "sidebar-spotlight",
    name: "Sidebar Spotlight",
    location: "sidebar",
    type: "spotlight",
    width: 300,
    height: 400,
    enabled: true,
  },

  // Leaderboard altında banner
  LEADERBOARD_BANNER: {
    id: "leaderboard-banner",
    name: "Leaderboard Banner",
    location: "leaderboard",
    type: "banner",
    width: 900,
    height: 80,
    enabled: true,
    rotation: 45000, // 45 saniye
  },

  // Oyun tamamlandığında modal
  GAME_COMPLETE_MODAL: {
    id: "game-complete-modal",
    name: "Game Complete Modal",
    location: "modal",
    type: "sponsored-content",
    enabled: true,
  },

  // Özel etkinlikler için notification
  EVENT_NOTIFICATION: {
    id: "event-notification",
    name: "Event Notification",
    location: "popup",
    type: "notification",
    enabled: true,
  },
};

/**
 * DEFAULT ADVERTISEMENTS - Örnek reklamlar
 */
export const DEFAULT_ADS: Advertisement[] = [
  {
    id: "ad-stellar-1",
    title: "Stellar Network - Blockchain'in Gücü",
    description: "Hızlı, güvenli ve uygun maliyetli blockchain işlemleri",
    sponsor_name: "Stellar Development Foundation",
    placement_ids: ["header-banner", "leaderboard-banner"],
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    cta_text: "Keşfet",
    cta_url: "https://stellar.org",
    priority: "high",
    active: true,
  },

  {
    id: "ad-freighter-1",
    title: "Freighter - Güvenli Stellar Cüzdanı",
    description: "Stellar ecosystem'un en güvenilir cüzdan çözümü",
    sponsor_name: "Freighter",
    placement_ids: ["sidebar-spotlight"],
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    cta_text: "İndir",
    cta_url: "https://www.freighter.app",
    priority: "medium",
    active: true,
  },

  {
    id: "ad-tournament-1",
    title: "🏆 Stellar Bomb Turnuvası",
    description: "Haftanın en iyi oyuncularını görmek için katlı!",
    sponsor_name: "Stellar Bomb",
    placement_ids: ["event-notification"],
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    cta_text: "Katıl",
    cta_url: "/tournament",
    priority: "high",
    active: true,
  },
];

/**
 * AD ROTATION TIMING
 */
export const AD_ROTATION = {
  HEADER: 30000, // 30 saniye
  LEADERBOARD: 45000, // 45 saniye
  SIDEBAR: 60000, // 60 saniye - genellikle değişmiyor
};

/**
 * AD TRACKING
 */
export const AD_TRACKING = {
  LOG_IMPRESSIONS: true,
  LOG_CLICKS: true,
  STORAGE_KEY: "stellar_bomb_ad_analytics",
};

/**
 * BANNER STYLES
 */
export const AD_STYLES = {
  banner: {
    className: "ad-banner",
    backgroundColor: "rgba(0, 255, 165, 0.05)",
    borderColor: "rgba(0, 255, 165, 0.2)",
    hoverEffect: true,
  },
  spotlight: {
    className: "ad-spotlight",
    backgroundColor: "rgba(0, 150, 255, 0.05)",
    borderColor: "rgba(0, 150, 255, 0.3)",
    hoverEffect: true,
  },
  notification: {
    className: "ad-notification",
    backgroundColor: "rgba(255, 200, 0, 0.1)",
    borderColor: "rgba(255, 200, 0, 0.4)",
    hoverEffect: true,
  },
};
