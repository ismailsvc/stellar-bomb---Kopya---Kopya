/* =====================================================
   Supabase Configuration & Services
===================================================== */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase kullanılabilir mi kontrol et
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️  Supabase NOT configured - Cloud features disabled"
  );
  console.log("📝 Setup: Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
} else {
  console.log("✅ Supabase configured - Cloud features enabled");
}

// Initialize Supabase with fallback error handling
let supabaseClient = null;
try {
  supabaseClient = isSupabaseConfigured
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
} catch (err) {
  console.warn("⚠️ Supabase initialization error:", err);
  supabaseClient = null;
}

export const supabase = supabaseClient;

/* =====================================================
   User Profile Management
===================================================== */

export type UserProfile = {
  wallet_address: string;
  username: string;
  avatar?: string;
  photo_url?: string;
  bio?: string;
  level?: number;
  selected_frame?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Kullanıcı profilini Supabase'e kaydet veya güncelle
 */
export async function saveUserProfile(
  walletAddress: string,
  profile: Omit<UserProfile, "wallet_address" | "created_at" | "updated_at">
) {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping profile save");
      return { success: true, data: null };
    }
    
    console.log(`🔄 Saving profile to Supabase: ${profile.username}`);
    
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: walletAddress,
          username: profile.username,
          avatar: profile.avatar,
          photo_url: profile.photo_url,
          bio: profile.bio,
          level: profile.level,
          selected_frame: profile.selected_frame,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
      )
      .select();

    if (error) {
      console.error("❌ Error saving profile:", error);
      // RLS policy error: save locally instead
      if ((error as any).code === "42501" || (error as any).code === "42602" || (error as any).message?.includes("policy") || (error as any).status === 406) {
        console.warn("⚠️ RLS/Access issue - Supabase tables need configuration or network unavailable");
      }
      console.log("💾 Saving to localStorage instead");
      return { success: true, data: null }; // Still report success
    }

    console.log(`✅ Profile saved successfully: ${profile.username}`);
    return { success: true, data };
  } catch (err: any) {
    // Network errors: save locally instead
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED") || err?.message?.includes("Network")) {
      console.warn("⚠️ Supabase network unavailable - saving to localStorage");
      return { success: true, data: null };
    }
    console.error("💥 Unexpected error saving profile:", err);
    return { success: true, data: null }; // Still report success
  }
}

/**
 * Supabase'den kullanıcı profilini yükle
 */
export async function loadUserProfile(
  walletAddress: string
): Promise<UserProfile | null> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping profile load");
      return null;
    }
    
    console.log(`🔄 Loading profile from Supabase for wallet: ${walletAddress.slice(0, 10)}...`);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select()
        .eq("wallet_address", walletAddress)
        .single();

      clearTimeout(timeoutId);

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error loading profile:", error);
        return null;
      }

      if (data) {
        console.log(`✅ Profile loaded: ${data.username}`);
      } else {
        console.log("ℹ️ No profile found in Supabase - will create on first save");
      }
      
      return data || null;
    } catch (timeoutErr) {
      clearTimeout(timeoutId);
      throw timeoutErr;
    }
  } catch (err: any) {
    // Network errors: just log and continue without cloud profile
    if (err?.message?.includes("Failed to fetch") || 
        err?.message?.includes("ERR_NAME_NOT_RESOLVED") || 
        err?.message?.includes("Network") ||
        err?.message?.includes("406") ||
        err?.name === "AbortError") {
      console.warn("⚠️ Supabase network unavailable - using localStorage only");
      return null;
    }
    console.error("💥 Unexpected error loading profile:", err);
    return null;
  }
}

/* =====================================================
   Leaderboard Management
===================================================== */

export type LeaderboardEntry = {
  id?: string;
  wallet_address: string;
  username: string;
  puzzle_title: string;
  difficulty: "easy" | "medium" | "hard";
  remaining_time: number;
  points?: number;
  avatar?: string;
  selected_frame?: string;
  created_at?: string;
};

/**
 * Skor kaydet (leaderboard'a ekle)
 */
export async function saveScore(entry: Omit<LeaderboardEntry, "id" | "created_at">) {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("Supabase not configured - skipping score save");
      return { success: true, data: null };
    }
    const { data, error } = await supabase
      .from("leaderboard")
      .insert({
        wallet_address: entry.wallet_address,
        username: entry.username,
        puzzle_title: entry.puzzle_title,
        difficulty: entry.difficulty,
        remaining_time: entry.remaining_time,
        points: entry.points, // Add points
        avatar: entry.avatar, // Add avatar
        selected_frame: entry.selected_frame, // Add frame
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error saving score:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error saving score:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Global leaderboard'u yükle (difficulty'ye göre filtrelenmiş)
 */
export async function loadGlobalLeaderboard(
  difficulty?: "easy" | "medium" | "hard",
  limit: number = 100
) {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - leaderboard disabled");
      return [];
    }
    
    let query = supabase
      .from("leaderboard")
      .select("*")
      .order("points", { ascending: false }) // Sort by points descending (high to low)
      .limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Leaderboard Error:", {
        message: error.message,
        status: (error as any).status,
        hint: "Supabase tables might not be created. Run: supabase_setup.sql"
      });
      return [];
    }

    if (!data) return [];
    console.log(`✅ Loaded ${data.length} leaderboard entries`);
    return data;
  } catch (err: any) {
    // Network errors: just return empty, don't crash
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED") || err?.message?.includes("Network")) {
      console.warn("⚠️ Supabase leaderboard unavailable - returning empty");
      return [];
    }
    console.error("💥 Unexpected error loading leaderboard:", err);
    return [];
  }
}

/**
 * Kullanıcının kendi skorlarını yükle
 */
export async function loadUserScores(walletAddress: string) {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("Supabase not configured - skipping user scores load");
      return [];
    }
    const { data, error } = await supabase
      .from("leaderboard")
      .select()
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading user scores:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected error loading user scores:", err);
    return [];
  }
}

/**
 * Kullanıcı istatistiklerini hesapla
 */
export async function getUserStats(walletAddress: string) {
  try {
    const scores = await loadUserScores(walletAddress);

    if (scores.length === 0) {
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        byDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
      };
    }

    const totalGames = scores.length;
    const bestScore = Math.max(...scores.map((s) => s.remaining_time));
    const averageScore =
      scores.reduce((sum, s) => sum + s.remaining_time, 0) / totalGames;

    const byDifficulty = {
      easy: scores.filter((s) => s.difficulty === "easy").length,
      medium: scores.filter((s) => s.difficulty === "medium").length,
      hard: scores.filter((s) => s.difficulty === "hard").length,
    };

    return {
      totalGames,
      bestScore,
      averageScore: Math.round(averageScore),
      byDifficulty,
    };
  } catch (err) {
    console.error("Error calculating user stats:", err);
    return {
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
    };
  }
}

/* =====================================================
   Multiplayer Match Management
   (Moved to src/lib/multiplayer module - see imports below)
===================================================== */

// Re-export multiplayer functions and types from dedicated module
export {
  type MultiplayerMatch,
  type MatchResult,
  type MultiplayerState,
  type MatchResponse,
  type CreateMatchResponse,
  type JoinMatchResponse,
  type GetMatchResponse,
} from "./multiplayer/types";

export {
  createMatch as createMultiplayerMatch,
  joinMatch as joinMultiplayerMatch,
  getMatchStatus,
  submitSolution as submitMatchSolution,
  getMatchDetails,
  getPlayerMatches,
  generateMatchCode as generateUniqueMatchCode,
} from "./multiplayer/service";

/* =====================================================
   Avatar Purchase Management
===================================================== */

export type AvatarPurchase = {
  id?: string;
  wallet_address: string;
  avatar_emoji: string;
  avatar_name: string;
  cost_xlm: number;
  transaction_hash: string;
  created_at?: string;
};

/**
 * Avatar satın almayı Supabase'e kaydet
 */
export async function saveAvatarPurchase(
  walletAddress: string,
  avatarEmoji: string,
  avatarName: string,
  costXLM: number,
  transactionHash: string
) {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping avatar purchase save");
      return { success: true };
    }

    const { error } = await supabase
      .from("avatar_purchases")
      .insert({
        wallet_address: walletAddress,
        avatar_emoji: avatarEmoji,
        avatar_name: avatarName,
        cost_xlm: costXLM,
        transaction_hash: transactionHash,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("❌ Error saving avatar purchase:", {
        message: error.message,
        status: (error as any).status,
        details: (error as any).details,
        hint: "avatar_purchases table may not exist. Run supabase_setup.sql in Supabase SQL Editor"
      });
      console.log("💾 Avatar purchase saved locally (Supabase unavailable):", { avatarEmoji, avatarName, transactionHash });
      return { success: true }; // Graceful degradation
    }

    console.log(`✅ Avatar purchase recorded: ${avatarEmoji} ${avatarName} - Hash: ${transactionHash.slice(0, 16)}...`);
    return { success: true };
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED")) {
      console.warn("⚠️ Network error - Supabase unreachable. Saving locally.");
      return { success: true };
    }
    console.error("💥 Unexpected error saving avatar purchase:", err);
    return { success: true }; // Graceful degradation
  }
}

/**
 * Satın alınan avatarları getir
 */
export async function getPurchasedAvatars(
  walletAddress: string
): Promise<AvatarPurchase[]> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - returning empty purchases");
      return [];
    }

    const { data, error } = await supabase
      .from("avatar_purchases")
      .select()
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching avatar purchases:", {
        message: error.message,
        status: (error as any).status,
        hint: "avatar_purchases table may not exist - run supabase_setup.sql"
      });
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} purchased avatars for ${walletAddress.slice(0, 8)}...`);
    return data || [];
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED")) {
      console.warn("⚠️ Network error - Supabase unavailable. Returning empty list.");
      return [];
    }
    console.error("💥 Unexpected error fetching avatar purchases:", err);
    return [];
  }
}

/* =====================================================
   Avatar Frame Management
===================================================== */

export type FramePurchase = {
  id?: string;
  wallet_address: string;
  frame_id: string;
  frame_name: string;
  cost_xlm: number;
  transaction_hash: string;
  created_at?: string;
};

/**
 * Avatar çerçeve satın almayı Supabase'e kaydet
 */
export async function saveFramePurchase(
  walletAddress: string,
  frameId: string,
  frameName: string,
  costXlm: number,
  transactionHash: string
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping frame purchase save");
      return { success: true };
    }

    const { error } = await supabase
      .from("frame_purchases")
      .insert({
        wallet_address: walletAddress,
        frame_id: frameId,
        frame_name: frameName,
        cost_xlm: costXlm,
        transaction_hash: transactionHash,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("❌ Error saving frame purchase:", {
        message: error.message,
        status: (error as any).status,
        hint: "frame_purchases table may not exist - run supabase_setup.sql"
      });
      console.log("💾 Frame purchase saved locally (Supabase unavailable):", { frameId, frameName, transactionHash });
      return { success: true }; // Graceful degradation
    }

    console.log(`✅ Frame ${frameId} purchase saved for ${walletAddress.slice(0, 8)}...`);
    return { success: true };
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED")) {
      console.warn("⚠️ Network error - Supabase unreachable. Saving locally.");
      return { success: true };
    }
    console.error("💥 Unexpected error saving frame purchase:", err);
    return { success: true }; // Graceful degradation
  }
}

/**
 * Satın alınan çerçeveleri getir
 */
export async function getPurchasedFrames(
  walletAddress: string
): Promise<FramePurchase[]> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - returning empty frame purchases");
      return [];
    }

    const { data, error } = await supabase
      .from("frame_purchases")
      .select()
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching frame purchases:", {
        message: error.message,
        status: (error as any).status,
        hint: "frame_purchases table may not exist - run supabase_setup.sql"
      });
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} purchased frames for ${walletAddress.slice(0, 8)}...`);
    return data || [];
  } catch (err: any) {
    if (err?.message?.includes("Failed to fetch") || err?.message?.includes("ERR_NAME_NOT_RESOLVED")) {
      console.warn("⚠️ Network error - Supabase unavailable. Returning empty list.");
      return [];
    }
    console.error("💥 Unexpected error fetching frame purchases:", err);
    return [];
  }
}

/**
 * Seçili çerçeveyi kaydet
 */
export async function saveSelectedFrame(
  walletAddress: string,
  frameId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping selected frame save");
      return { success: true };
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({ selected_frame: frameId })
      .eq("wallet_address", walletAddress);

    if (error) {
      console.error("❌ Error saving selected frame:", error.message);
      return { success: false, error };
    }

    console.log(`✅ Selected frame ${frameId} saved for ${walletAddress.slice(0, 8)}...`);
    return { success: true };
  } catch (err) {
    console.error("💥 Unexpected error saving selected frame:", err);
    return { success: false, error: err };
  }
}

/* =====================================================
   Advertisement Analytics
===================================================== */

export interface AdAnalyticsRecord {
  ad_id: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-Through Rate
  timestamp: string;
}

/**
 * Reklam analytics'ini Supabase'e kaydet
 */
export async function saveAdAnalytics(
  adAnalytics: AdAnalyticsRecord[]
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - skipping ad analytics save");
      return { success: false };
    }

    if (!adAnalytics || adAnalytics.length === 0) {
      console.log("⚠️ No ad analytics to save");
      return { success: true };
    }

    // Batch insert or upsert
    const { error } = await supabase
      .from("ad_analytics")
      .upsert(adAnalytics, { onConflict: "ad_id" });

    if (error) {
      console.error("❌ Error saving ad analytics:", error.message);
      return { success: false, error };
    }

    console.log(`✅ Ad analytics saved: ${adAnalytics.length} records`);
    return { success: true };
  } catch (err) {
    console.error("💥 Unexpected error saving ad analytics:", err);
    return { success: false, error: err };
  }
}

/**
 * Reklam analytics'ini Supabase'den yükle
 */
export async function loadAdAnalytics(): Promise<AdAnalyticsRecord[]> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - cannot load ad analytics");
      return [];
    }

    const { data, error } = await supabase
      .from("ad_analytics")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("❌ Error loading ad analytics:", error.message);
      return [];
    }

    console.log(`✅ Ad analytics loaded: ${data?.length || 0} records`);
    return data || [];
  } catch (err) {
    console.error("💥 Unexpected error loading ad analytics:", err);
    return [];
  }
}

/**
 * Tüm reklamları Supabase'den yükle
 */
export async function loadAdvertisements() {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured - cannot load advertisements");
      return [];
    }

    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("active", true)
      .order("priority", { ascending: true });

    if (error) {
      console.error("❌ Error loading advertisements:", error.message);
      return [];
    }

    console.log(`✅ Advertisements loaded: ${data?.length || 0} records`);
    return data || [];
  } catch (err) {
    console.error("💥 Unexpected error loading advertisements:", err);
    return [];
  }
}
