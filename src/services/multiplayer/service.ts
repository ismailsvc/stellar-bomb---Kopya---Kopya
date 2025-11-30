/**
 * Multiplayer Match Management Service
 * Supabase ile etkileşimli multiplayer maç yönetimi
 */

import { supabase } from "../supabase";
import { saveUserProfile } from "../supabase";
import type { MultiplayerMatch, CreateMatchResponse, JoinMatchResponse, GetMatchResponse } from "./types";

const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Rastgele ve benzersiz maç kodu oluştur
 * Format: 11 karakterlik, kolay okunur kod
 */
export function generateMatchCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const timestamp = Math.random().toString(36).substr(2, 3).toUpperCase();
  return code + timestamp;
}

/**
 * Yeni multiplayer maçı oluştur (Oyuncu 1)
 */
export async function createMatch(
  player1Wallet: string,
  player1Username: string,
  difficulty: "easy" | "medium" | "hard",
  puzzleData: MultiplayerMatch["puzzle_data"]
): Promise<CreateMatchResponse> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.error("❌ Supabase not configured - cannot create match");
      return { success: false, error: "Supabase not configured" };
    }

    const matchCode = generateMatchCode();
    console.log(`🎮 Creating multiplayer match: ${matchCode}`);

    // Profili kaydet (foreign key için)
    await saveUserProfile(player1Wallet, {
      username: player1Username,
    }).catch(err => console.warn("Profile save warning:", err));

    const { error } = await supabase
      .from("multiplayer_matches")
      .insert({
        match_code: matchCode,
        puzzle_id: `${player1Wallet}-${Date.now()}`,
        puzzle_title: puzzleData.title,
        difficulty: difficulty,
        player1_wallet: player1Wallet,
        player1_username: player1Username,
        puzzle_data: puzzleData,
        status: "waiting",
      });

    if (error) {
      console.error("❌ Error creating multiplayer match:", error);
      // 406 errors are usually table/RLS issues - provide helpful message
      if ((error as any).status === 406) {
        console.warn("⚠️ Supabase tables not configured. Multiplayer features disabled.");
        console.log("📖 See: ERROR_FIX_406.md for setup instructions");
        return { success: false, error: "Supabase tables not configured. Run supabase_setup.sql" };
      }
      return { success: false, error: error.message };
    }

    console.log(`✅ Match created successfully: ${matchCode}`);
    return { success: true, data: { matchCode } };
  } catch (err) {
    console.error("💥 Unexpected error creating match:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Multiplayer maçına katıl (Oyuncu 2)
 */
export async function joinMatch(
  matchCode: string,
  player2Wallet: string,
  player2Username: string
): Promise<JoinMatchResponse> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.error("❌ Supabase not configured - cannot join match");
      return { success: false, error: "Supabase not configured" };
    }

    console.log(`🔗 Joining match: ${matchCode}`);

    // Match'i bul
    const { data: matchData, error: fetchError } = await supabase
      .from("multiplayer_matches")
      .select()
      .eq("match_code", matchCode)
      .single();

    if (fetchError || !matchData) {
      console.error("❌ Match not found:", fetchError);
      return { success: false, error: "Match not found" };
    }

    if (matchData.player2_wallet) {
      console.warn("⚠️ Match is already full");
      return { success: false, error: "Match is already full" };
    }

    // Oyuncu 2'yi ekle
    const { error: updateError } = await supabase
      .from("multiplayer_matches")
      .update({
        player2_wallet: player2Wallet,
        player2_username: player2Username,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("match_code", matchCode);

    if (updateError) {
      console.error("❌ Error joining match:", updateError);
      return { success: false, error: updateError.message };
    }

    // Güncellenmiş match'i döndür
    const { data: updatedMatch, error: refetchError } = await supabase
      .from("multiplayer_matches")
      .select()
      .eq("match_code", matchCode)
      .single();

    if (refetchError || !updatedMatch) {
      console.error("❌ Error fetching updated match:", refetchError);
      return { success: false, error: "Failed to fetch updated match" };
    }

    console.log(`✅ Successfully joined match: ${matchCode}`);
    return { success: true, data: { match: updatedMatch } };
  } catch (err) {
    console.error("💥 Unexpected error joining match:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Match'in mevcut durumunu kontrol et
 */
export async function getMatchStatus(matchCode: string): Promise<GetMatchResponse> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured");
      return { success: false, error: "Supabase not configured" };
    }

    const { data: match, error } = await supabase
      .from("multiplayer_matches")
      .select()
      .eq("match_code", matchCode)
      .single();

    if (error || !match) {
      console.error("❌ Error fetching match status:", error);
      return { success: false, error: "Match not found" };
    }

    console.log(`✅ Match status: ${match.status} | Player2: ${match.player2_wallet ? "✓" : "✗"}`);
    return { success: true, data: { match } };
  } catch (err) {
    console.error("💥 Error fetching match status:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Oyuncu çözümünü kaydet
 */
export async function submitSolution(
  matchCode: string,
  playerWallet: string,
  isSolved: boolean,
  remainingTime: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured");
      return { success: false, error: "Supabase not configured" };
    }

    // Oyuncunun hangi oyuncu olduğunu belirle
    const { data: matchData, error: fetchError } = await supabase
      .from("multiplayer_matches")
      .select()
      .eq("match_code", matchCode)
      .single();

    if (fetchError || !matchData) {
      return { success: false, error: "Match not found" };
    }

    const isPlayer1 = matchData.player1_wallet === playerWallet;
    const updateData = isPlayer1
      ? {
          player1_solved: isSolved,
          player1_time: remainingTime,
          updated_at: new Date().toISOString(),
        }
      : {
          player2_solved: isSolved,
          player2_time: remainingTime,
          status: "completed" as const,
          updated_at: new Date().toISOString(),
        };

    const { error } = await supabase
      .from("multiplayer_matches")
      .update(updateData)
      .eq("match_code", matchCode);

    if (error) {
      console.error(`❌ Error updating solution:`, error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Solution submitted for ${isPlayer1 ? "Player 1" : "Player 2"}`);
    return { success: true };
  } catch (err) {
    console.error("💥 Error submitting solution:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Match detaylarını getir
 */
export async function getMatchDetails(matchCode: string): Promise<GetMatchResponse> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured");
      return { success: false, error: "Supabase not configured" };
    }

    const { data, error } = await supabase
      .from("multiplayer_matches")
      .select()
      .eq("match_code", matchCode)
      .single();

    if (error || !data) {
      console.error("❌ Error fetching match:", error);
      return { success: false, error: "Match not found" };
    }

    return { success: true, data: { match: data } };
  } catch (err) {
    console.error("💥 Unexpected error fetching match:", err);
    return { success: false, error: "Unknown error" };
  }
}

/**
 * Oyuncunun maçlarını getir
 */
export async function getPlayerMatches(playerWallet: string): Promise<MultiplayerMatch[]> {
  try {
    if (!supabase || !isSupabaseConfigured) {
      console.log("⚠️ Supabase not configured");
      return [];
    }

    const { data, error } = await supabase
      .from("multiplayer_matches")
      .select()
      .or(`player1_wallet.eq.${playerWallet},player2_wallet.eq.${playerWallet}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("❌ Error fetching player matches:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("💥 Error fetching player matches:", err);
    return [];
  }
}
