/**
 * Session Manager - Persistent User Session Storage
 * 
 * Hybrid approach:
 * 1. Primary: Soroban smart contract (blockchain-based, immutable)
 * 2. Fallback: localStorage (fast, offline support)
 * 
 * Handles auto-login by storing and restoring user sessions
 */

import {
  saveSessionOnChain,
  verifySessionOnChain,
  clearSessionOnChain,
} from "./sorobanSession";

type SessionData = {
  wallet: string;
  timestamp: number;
  expiresIn: number; // milliseconds
  blockchainVerified?: boolean; // Whether session is verified on Soroban
  sessionToken?: string; // Token from Soroban contract
};

const SESSION_KEY = "stellar_bomb_session";
const SESSION_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Save user session to both localStorage and Soroban contract
 */
export async function saveSession(walletAddress: string): Promise<void> {
  const sessionData: SessionData = {
    wallet: walletAddress,
    timestamp: Date.now(),
    expiresIn: SESSION_EXPIRATION,
  };

  try {
    // Save to localStorage first (fast)
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log("✅ Session saved to localStorage:", walletAddress);

    // Then try to save to Soroban contract (async, non-blocking)
    try {
      const sessionToken = await saveSessionOnChain(walletAddress, "", 7);
      sessionData.blockchainVerified = true;
      sessionData.sessionToken = sessionToken;

      // Update localStorage with blockchain verification
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      console.log("🔗 Session verified on Soroban contract");
    } catch (sorobanError) {
      console.warn("⚠️ Soroban session storage failed, using localStorage only:", sorobanError);
      // Continue with localStorage-only session
    }
  } catch (error) {
    console.error("❌ Error saving session:", error);
  }
}

/**
 * Get saved session from localStorage (fast) or verify with Soroban
 */
export function getSession(): SessionData | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);

    // Check if session has expired
    const timeDiff = Date.now() - session.timestamp;
    if (timeDiff > session.expiresIn) {
      clearSession();
      console.log("⏰ Session expired");
      return null;
    }

    console.log("✅ Session restored:", session.wallet);
    return session;
  } catch (error) {
    console.error("❌ Error reading session:", error);
    return null;
  }
}

/**
 * Verify session with Soroban contract (blockchain verification)
 */
export async function verifySessionWithBlockchain(
  session: SessionData
): Promise<boolean> {
  try {
    if (!session.sessionToken) {
      console.log("ℹ️ No blockchain session token, using localStorage verification");
      return true; // Fall back to localStorage verification
    }

    const blockchainSession = await verifySessionOnChain(
      session.wallet,
      session.sessionToken
    );

    if (blockchainSession && blockchainSession.isValid) {
      console.log("✅ Session verified on blockchain");
      return true;
    }

    console.log("❌ Blockchain session verification failed");
    return false;
  } catch (error) {
    console.warn("⚠️ Blockchain verification error, falling back to localStorage:", error);
    return true; // Fall back to localStorage verification
  }
}

/**
 * Clear user session from both localStorage and Soroban
 */
export async function clearSession(): Promise<void> {
  try {
    // Get session before clearing to have wallet address
    const session = getSession();

    // Clear from localStorage
    localStorage.removeItem(SESSION_KEY);
    console.log("✅ Session cleared from localStorage");

    // Try to clear from Soroban contract
    if (session) {
      try {
        await clearSessionOnChain(session.wallet);
        console.log("🔗 Session cleared from Soroban contract");
      } catch (sorobanError) {
        console.warn("⚠️ Soroban session clear failed:", sorobanError);
        // Continue - localStorage is already cleared
      }
    }
  } catch (error) {
    console.error("❌ Error clearing session:", error);
  }
}

/**
 * Check if user has an active session
 */
export function hasActiveSession(): boolean {
  return getSession() !== null;
}

/**
 * Extend current session (refresh expiration)
 */
export function extendSession(walletAddress: string): void {
  const session = getSession();
  if (session && session.wallet === walletAddress) {
    saveSession(walletAddress).catch(err => console.error("Error extending session:", err));
  }
}

/**
 * Get session details for UI display
 */
export function getSessionDetails(): SessionData | null {
  return getSession();
}

/**
 * Check if session is blockchain-verified
 */
export function isBlockchainVerified(): boolean {
  const session = getSession();
  return session?.blockchainVerified ?? false;
}
