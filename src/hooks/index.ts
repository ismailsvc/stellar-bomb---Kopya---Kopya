/**
 * Stellar Bomb - Custom Hooks
 * Reusable state management hooks for the application
 */

import { useEffect, useState } from "react";
import type { UserProfile, PlayerStats, LeaderboardEntry } from "../types";
import { AVATARS } from "../constants";
import { getDefaultStats, loadPlayerStats, loadLocalLeaderboard } from "../utils";

/* =====================================================
   PROFILE HOOK
===================================================== */

export const useUserProfile = (wallet: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (!wallet) return;

    const defaultProfile: UserProfile = {
      username: "Oyuncu",
      avatar: AVATARS[0],
      bio: "",
      level: 1,
    };

    const profileData = JSON.parse(
      localStorage.getItem(`profile_${wallet}`) || JSON.stringify(defaultProfile)
    );

    setProfile(profileData);
    setEditUsername(profileData.username);
    setEditBio(profileData.bio ?? "");
  }, [wallet]);

  return {
    profile,
    setProfile,
    editUsername,
    setEditUsername,
    editBio,
    setEditBio,
  };
};

/* =====================================================
   PLAYER STATS HOOK
===================================================== */

export const usePlayerStats = (wallet: string | null) => {
  const [stats, setStats] = useState<PlayerStats>(getDefaultStats());

  useEffect(() => {
    if (!wallet) {
      setStats(getDefaultStats());
      return;
    }

    const loadedStats = loadPlayerStats(wallet);
    setStats(loadedStats);
  }, [wallet]);

  return { stats, setStats };
};

/* =====================================================
   LOCAL LEADERBOARD HOOK
===================================================== */

export const useLocalLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setLeaderboard(loadLocalLeaderboard());
  }, []);

  return { leaderboard, setLeaderboard };
};

/* =====================================================
   AVATAR HOOK
===================================================== */

export const useAvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    try {
      return localStorage.getItem("selectedAvatar") || "";
    } catch {
      return "";
    }
  });

  return { selectedAvatar, setSelectedAvatar };
};

/* =====================================================
   FRAME SELECTION HOOK
===================================================== */

export const useFrameSelection = () => {
  const [selectedFrame, setSelectedFrame] = useState<string>(() => {
    try {
      return localStorage.getItem("selectedFrame") || "frame-none";
    } catch {
      return "frame-none";
    }
  });

  return { selectedFrame, setSelectedFrame };
};

/* =====================================================
   ACCOUNT SWITCHER HOOK
===================================================== */

export const useSavedWallets = () => {
  const [savedWallets, setSavedWallets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("savedWallets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addWallet = (wallet: string) => {
    setSavedWallets((prev) => {
      const updated = Array.from(new Set([...prev, wallet]));
      localStorage.setItem("savedWallets", JSON.stringify(updated));
      return updated;
    });
  };

  return { savedWallets, setSavedWallets, addWallet };
};
