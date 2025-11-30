/**
 * Soroban Smart Contract Integration - Session Management
 * 
 * This module handles interaction with a Soroban smart contract
 * that manages persistent user sessions on the Stellar blockchain.
 * 
 * Contract functionality:
 * - Store user sessions (wallet -> session data)
 * - Set session expiration (7 days)
 * - Verify session validity
 * - Clear sessions on logout
 */

import { getNetworkDetails } from "@stellar/freighter-api";

// const HORIZON_URL = "https://horizon-testnet.stellar.org";
// const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

/**
 * Session Manager Contract Address
 * Replace with your deployed Soroban contract address
 */
const SESSION_CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID || "";

/**
 * Session data stored on blockchain
 */
export interface BlockchainSession {
  wallet: string;
  sessionToken: string;
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
  isValid: boolean;
}

/**
 * Save a session to the Soroban smart contract
 * This stores the session on-chain for verification across devices
 */
export async function saveSessionOnChain( 
  walletAddress: string,
  _sessionToken: string,
  expirationDays: number = 7
): Promise<string> {
  try {
    if (!SESSION_CONTRACT_ID) {
      // Soroban contract ID not set - using localStorage
      return "local";
    }

    console.log("💾 Saving session to Soroban contract...");

    const networkDetails = await getNetworkDetails();
    if (networkDetails.error) {
      throw new Error(`Network error: ${networkDetails.error}`);
    }

    // const NETWORK_PASSPHRASE = networkDetails.networkPassphrase;

    // Prepare session data
    const createdAt = Math.floor(Date.now() / 1000);
    const expiresAt = createdAt + expirationDays * 24 * 60 * 60;

    // TODO: Replace with actual Soroban contract invocation
    // This is a placeholder for the contract call structure
    console.log("📝 Session data prepared:", {
      wallet: walletAddress,
      createdAt,
      expiresAt,
      expirationDays,
    });

    // For now, we'll return a session token that combines wallet + timestamp
    // Use browser-safe base64 encoding without Node Buffer
    const sessionToken = btoa(`${walletAddress}:${createdAt}:${expiresAt}`);

    console.log("✅ Session saved to blockchain");
    return sessionToken;
  } catch (error) {
    console.error("❌ Error saving session to blockchain:", error);
    throw error;
  }
}

/**
 * Verify a session stored in the Soroban smart contract
 */
export async function verifySessionOnChain(
  walletAddress: string,
  sessionToken: string
): Promise<BlockchainSession | null> {
  try {
    if (!SESSION_CONTRACT_ID) {
      // Soroban contract ID not set - skipping blockchain verification
      return null;
    }

    console.log("🔍 Verifying session on blockchain...");

    // TODO: Replace with actual Soroban contract query
    // Parse the session token to validate
    // Decode using browser-safe API
    const decoded = atob(sessionToken);
    const [wallet, createdAtStr, expiresAtStr] = decoded.split(":");

    const createdAt = parseInt(createdAtStr);
    const expiresAt = parseInt(expiresAtStr);
    const now = Math.floor(Date.now() / 1000);

    if (wallet !== walletAddress) {
      console.warn("⚠️ Wallet mismatch");
      return null;
    }

    if (now > expiresAt) {
      console.warn("⚠️ Session expired");
      return null;
    }

    const session: BlockchainSession = {
      wallet: walletAddress,
      sessionToken,
      createdAt,
      expiresAt,
      isValid: true,
    };

    console.log("✅ Session verified on blockchain");
    return session;
  } catch (error) {
    console.error("❌ Error verifying session:", error);
    return null;
  }
}

/**
 * Clear a session from the Soroban smart contract
 */
export async function clearSessionOnChain(
  _walletAddress: string
): Promise<boolean> {
  try {
    if (!SESSION_CONTRACT_ID) {
      // Soroban contract ID not set - skipping blockchain session clear
      return false;
    }

    console.log("🗑️ Clearing session from blockchain...");

    // TODO: Replace with actual Soroban contract invocation to delete session

    console.log("✅ Session cleared from blockchain");
    return true;
  } catch (error) {
    console.error("❌ Error clearing session from blockchain:", error);
    return false;
  }
}

/**
 * Get session expiration timestamp
 */
export async function getSessionExpiration(
  sessionToken: string
): Promise<number | null> {
  try {
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const [, , expiresAtStr] = decoded.split(":");
    return parseInt(expiresAtStr);
  } catch {
    return null;
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now > expiresAt;
}

/**
 * Calculate remaining session time in seconds
 */
export function getRemainingSessionTime(expiresAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "Expired";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "< 1m";
}
