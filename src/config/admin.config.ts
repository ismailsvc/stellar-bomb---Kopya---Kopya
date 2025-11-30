/**
 * ADMIN CONFIGURATION
 * Admin panel ayarları ve yetkilendirme
 */

/**
 * Admin cüzdan adresi
 * Sadece bu adresli Freighter cüzdan admin paneline erişebilir
 */
export const ADMIN_WALLET = "GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA";

/**
 * Admin'in yapabileceği işlemler
 */
export const ADMIN_PERMISSIONS = {
  VIEW_ADS: "view_ads",
  CREATE_AD: "create_ad",
  EDIT_AD: "edit_ad",
  DELETE_AD: "delete_ad",
  ENABLE_AD: "enable_ad",
  DISABLE_AD: "disable_ad",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_USERS: "view_users",
  VIEW_LEADERBOARD: "view_leaderboard",
  MANAGE_CONTENT: "manage_content",
} as const;

/**
 * Admin'in tüm izinleri
 */
export const ALL_ADMIN_PERMISSIONS = Object.values(ADMIN_PERMISSIONS);

/**
 * Admin panel yapılandırması
 */
export const ADMIN_CONFIG = {
  ENABLE_ADMIN_PANEL: true,
  REQUIRE_WALLET_VERIFICATION: true,
  ADMIN_ROUTE: "/admin",
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 dakika
};

/**
 * Admin'i kontrol et
 */
export function isAdmin(walletAddress?: string | null): boolean {
  if (!walletAddress) return false;
  return walletAddress.toUpperCase() === ADMIN_WALLET.toUpperCase();
}

/**
 * Admin izni kontrol et
 */
export function hasAdminPermission(
  permission: (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS]
): boolean {
  // Şu an tüm admin'ler tüm izinlere sahip
  // Gelecekte role-based system eklenebilir
  return ALL_ADMIN_PERMISSIONS.includes(permission);
}
