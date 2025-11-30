import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import "./styles/App.css";
import { BombModel } from "./shared/components/BombModel";
import { AccountSwitcher } from "./shared/components/AccountSwitcher";
import { AdBanner } from "./shared/components/AdBanner";
import { AdminPanel } from "./shared/components/AdminPanel";
import { adManager } from "./services/adManager";
import { DEFAULT_ADS } from "./config/ads.config";
import { isAdmin } from "./config/admin.config";

import type { Puzzle } from "./puzzles";
import { puzzles } from "./puzzles";
import { generatePuzzleWithAI, validateCodeWithAI } from "./services/aiGenerator";
import {
  saveUserProfile,
  loadUserProfile,
  saveScore,
  saveAvatarPurchase,
  getPurchasedAvatars,
  loadGlobalLeaderboard,
  // @ts-ignore - used for frame purchases
  saveFramePurchase,
  getPurchasedFrames,
  // @ts-ignore - used for frame selection
  saveSelectedFrame,
} from "./services/supabase";

import { connectFreighter, getAccountBalance, purchaseAvatar } from "./stellar/wallet";
import { saveSession, getSession, clearSession, verifySessionWithBlockchain } from "./services/sessionManager";
import {
  TOTAL_TIME,
  TOTAL_TIME_BY_DIFFICULTY,
  AVATARS_DATA,
  AVATARS,
  AVATAR_FRAMES_DATA,
} from "./config/constants";
import { 
  loadLocalLeaderboard, 
  saveLocalLeaderboard, 
  maskAddress, 
  playClick, 
  sound,
  getDefaultStats, 
  loadPlayerStats,
  puzzleScore, 
  updatePlayerStats,
  loadProfile,
  saveProfile,
} from "./shared/utils";
import type { LeaderboardEntry, PlayerStats, GameDifficulty, UserProfile } from "./shared/types";

// Type aliases for compatibility
type Profile = UserProfile;
type Page = "home" | "game" | "profile" | "leaderboard" | "about" | "mode-select" | "admin";
type GameState = "idle" | "playing" | "success" | "fail";

/* =====================================================
   🔊 SES MOTORU 
===================================================== */

/* Helper function: Get random puzzle */
function getRandomPuzzle(): Puzzle {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

/* =====================================================
   MAIN APP
===================================================== */
function App() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    try {
      return localStorage.getItem("selectedAvatar") || "";
    } catch {
      return "";
    }
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(false);

  // MULTI-ACCOUNT SUPPORT
  const [savedWallets, setSavedWallets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("savedWallets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [code, setCode] = useState("");

  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  const [localLB, setLocalLB] = useState<LeaderboardEntry[]>([]);
  const [globalLB, setGlobalLB] = useState<LeaderboardEntry[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | "easy" | "medium" | "hard">("all");

  const [playerStats, setPlayerStats] = useState<PlayerStats>(getDefaultStats());
  const [totalUserPoints, setTotalUserPoints] = useState(0); // Total points from all solved puzzles

  const [status, setStatus] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const [mistakesLeft, setMistakesLeft] = useState(3); // Hata hakları

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showIntro, setShowIntro] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>("medium");

  // PROFILE CACHE - Tüm hesapların profillerini takip et
  const [profilesCache, setProfilesCache] = useState<Record<string, Profile>>({});

  // GAME MODES
  type GameMode = "single" | "bot";
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [botScore, setBotScore] = useState(0);
  // @ts-ignore - Used in game display
  const [botTime, setBotTime] = useState(0);

  // AVATAR SATINLAMA
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    avatar: typeof AVATARS_DATA[0] | null;
    frame?: typeof AVATAR_FRAMES_DATA[0];
  }>({ isOpen: false, avatar: null });
  const [purchasedAvatars, setPurchasedAvatars] = useState<string[]>([]);
  // @ts-ignore - used for frame purchases
  const [purchasedFrames, setPurchasedFrames] = useState<string[]>([]);
  // @ts-ignore - used for frame display
  const [selectedFrame, setSelectedFrame] = useState<string>(() => {
    try {
      return localStorage.getItem("selectedFrame") || "frame-none";
    } catch {
      return "frame-none";
    }
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // INTRO ANIMASYONU
  const [introSuccess, setIntroSuccess] = useState(false);

  /* INITIALIZE AD MANAGER */
  useEffect(() => {
    adManager.loadAds(DEFAULT_ADS);
  }, []);

  /* INTRO */
  useEffect(() => {
    const t = setTimeout(() => {
      setShowIntro(false);
      setIntroSuccess(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  /* SAVED WALLETS - LocalStorage'e kaydet */
  useEffect(() => {
    localStorage.setItem("savedWallets", JSON.stringify(savedWallets));
  }, [savedWallets]);

  /* INITIALIZE PROFILE CACHE FROM SAVED WALLETS */
  useEffect(() => {
    const cache: Record<string, Profile> = {};
    savedWallets.forEach(walletAddr => {
      const prof = loadProfile(walletAddr);
      if (prof) cache[walletAddr] = prof;
    });
    setProfilesCache(cache);
  }, [savedWallets]);

  /* AUTO-LOGIN FROM SESSION */
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Check if there's a saved session
        const session = getSession();
        if (!session) {
          console.log("📭 No saved session found");
          return;
        }

        console.log("🔄 Attempting auto-login with saved session:", session.wallet);
        
        // Try to verify session with Soroban blockchain
        const blockchainVerified = await verifySessionWithBlockchain(session);
        if (!blockchainVerified) {
          console.log("⚠️ Blockchain session verification failed, using localStorage only");
        } else if (session.blockchainVerified) {
          console.log("🔗 Session verified on Soroban contract");
        }
        
        // Reconnect to Freighter using the saved wallet
        try {
          const pub = await connectFreighter();
          
          // Verify that the connected wallet matches the saved session
          if (pub !== session.wallet) {
            console.log("⚠️ Connected wallet doesn't match saved session");
            clearSession();
            return;
          }

          setWallet(pub);
          setStatus(session.blockchainVerified ? "🔗 Auto-bağlandı (Blockchain)" : "Auto-bağlandı ✔");

          // Load local profile first
          let prof = loadProfile(pub);

          // Then sync with Supabase
          let supabaseProfile = await loadUserProfile(pub);
          if (supabaseProfile) {
            console.log("📥 Supabase profile loaded:", supabaseProfile);
            prof = {
              username: supabaseProfile.username,
              avatar: supabaseProfile.avatar,
              photoUrl: supabaseProfile.photo_url,
              bio: supabaseProfile.bio,
              level: supabaseProfile.level,
              selected_frame: supabaseProfile.selected_frame,
            };
            // Update local storage with Supabase data
            saveProfile(pub, prof);
            console.log("💾 Local storage updated with Supabase data");
          } else {
            // If no profile in Supabase, save the local profile
            console.log("📝 Saving profile to Supabase for first time...");
            await saveUserProfile(pub, {
              username: prof.username,
              avatar: prof.avatar,
              photo_url: prof.photoUrl,
              bio: prof.bio,
              level: prof.level ?? 1,
              selected_frame: prof.selected_frame,
            });
            console.log("✅ Profile saved to Supabase");
          }

          setProfile(prof);
          setEditUsername(prof.username);
          setEditBio(prof.bio ?? "");
          setSelectedAvatar(prof.avatar ?? AVATARS[0]);
          setPhotoPreview(prof.photoUrl ?? null);

          // Load purchased avatars
          const purchases = await getPurchasedAvatars(pub);
          const emojis = purchases.map(p => p.avatar_emoji);
          setPurchasedAvatars(emojis);

          // Load purchased frames
          const framePurchases = await getPurchasedFrames(pub);
          const frameIds = framePurchases.map(f => f.frame_id);
          setPurchasedFrames(frameIds);

          // Load selected frame from profile
          if (prof.selected_frame) {
            setSelectedFrame(prof.selected_frame);
          }

          // Fetch balance
          const bal = await getAccountBalance(pub);
          setBalance(bal);

          // Save session again to extend expiration
          saveSession(pub);

          console.log("✅ Auto-login successful!");
          setStatus(null);
        } catch (connectError) {
          console.log("❌ Freighter connection failed during auto-login:", connectError);
          clearSession();
        }
      } catch (error) {
        console.error("❌ Auto-login error:", error);
      }
    };

    // Run auto-login after intro animation completes
    const timer = setTimeout(() => {
      autoLogin();
    }, 3500); // Wait for intro to finish

    return () => clearTimeout(timer);
  }, []);

  /* LOCAL */
  useEffect(() => {
    setLocalLB(loadLocalLeaderboard());
  }, []);

  /* PLAYER STATS */
  useEffect(() => {
    if (wallet) {
      const stats = loadPlayerStats(wallet);
      setPlayerStats(stats);
    }
  }, [wallet]);

  /* GLOBAL */
  useEffect(() => {
    loadGlobalLeaderboard("medium").then(setGlobalLB).catch(() => {});
  }, []);

  /* TIMER LOGIC */
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) return handleFail();

    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  /* TICK SOUND LOOP */
  useEffect(() => {
    if (gameState !== "playing") {
      sound.tick.pause();
      sound.tick.currentTime = 0;
      return;
    }

    const loop = setInterval(() => {
      sound.tick.pause();
      sound.tick.currentTime = 0;
      sound.tick.play().catch(() => {});
    }, 1000);

    return () => {
      clearInterval(loop);
      sound.tick.pause();
      sound.tick.currentTime = 0;
    };
  }, [gameState]);

  /* INITIALIZE PUZZLE CACHE */
  useEffect(() => {
    const cacheKey = "ai_puzzle_cache";
    const cached = localStorage.getItem(cacheKey);
    
    // Cache'i manuel puzzle'larla initialize et
    if (!cached) {
      // Manual puzzles'ları AI cache format'ında dönüştür
      const cacheablePuzzles = puzzles.map(p => ({
        id: `manual-${p.id}`,
        title: p.title,
        description: p.description,
        starterCode: p.starterCode,
        expectedOutput: p.expectedOutput,
        category: p.category,
      }));
      
      localStorage.setItem(cacheKey, JSON.stringify({
        puzzles: cacheablePuzzles,
        timestamp: Date.now()
      }));
    }
  }, []);

  const connect = async () => {
    try {
      const pub = await connectFreighter();
      setWallet(pub);
      setStatus("Bağlandı ✔");

      // Wallet'ı kayıtlı hesaplar listesine ekle (duplikasyon kontrolü)
      setSavedWallets(prev => {
        if (prev.includes(pub)) return prev; // Zaten var
        return [...prev, pub];
      });

      // Önce yerel depodan yükle
      let prof = loadProfile(pub);

      // Sonra Supabase'den senkronize et
      let supabaseProfile = await loadUserProfile(pub);
      if (supabaseProfile) {
        console.log("📥 Supabase profile loaded:", supabaseProfile);
        prof = {
          username: supabaseProfile.username,
          avatar: supabaseProfile.avatar,
          photoUrl: supabaseProfile.photo_url,
          bio: supabaseProfile.bio,
          level: supabaseProfile.level,
          selected_frame: supabaseProfile.selected_frame,
        };
        // Yerel depoyu güncelle
        saveProfile(pub, prof);
        console.log("💾 Local storage updated with Supabase data");
      } else {
        // Supabase'de profil yoksa, yerel profilini kaydet
        console.log("📝 Saving profile to Supabase for first time...");
        await saveUserProfile(pub, {
          username: prof.username,
          avatar: prof.avatar,
          photo_url: prof.photoUrl,
          bio: prof.bio,
          level: prof.level ?? 1,
          selected_frame: prof.selected_frame,
        });
        console.log("✅ Profile saved to Supabase");
      }

      setProfile(prof);
      setEditUsername(prof.username);
      setEditBio(prof.bio ?? "");
      setSelectedAvatar(prof.avatar ?? AVATARS[0]);
      setPhotoPreview(prof.photoUrl ?? null);

      // Cache'i güncelle - connect fonksiyonunda
      setProfilesCache(prev => ({ ...prev, [pub]: prof }));

      // Satın alınan avatarları yükle
      const purchases = await getPurchasedAvatars(pub);
      const emojis = purchases.map(p => p.avatar_emoji);
      setPurchasedAvatars(emojis);

      // Load purchased frames
      const framePurchases = await getPurchasedFrames(pub);
      const frameIds = framePurchases.map(f => f.frame_id);
      setPurchasedFrames(frameIds);

      // Load selected frame from profile
      if (prof.selected_frame) {
        setSelectedFrame(prof.selected_frame);
      }

      // Fetch balance
      setLoadingBalance(true);
      const bal = await getAccountBalance(pub);
      setBalance(bal);
      setLoadingBalance(false);

      // Save session for auto-login (async, non-blocking)
      saveSession(pub).then(() => {
        console.log("💾 Session saved for auto-login");
      }).catch(err => {
        console.error("⚠️ Session save error:", err);
        // Continue - app works without Soroban
      });

      playClick();
    } catch {
      setStatus("Bağlantı hatası");
    }
  };

  /* SWITCH ACCOUNT - Farklı hesaba geç */
  const switchAccount = async (walletAddress: string) => {
    try {
      console.log(`🔄 Switching to account: ${walletAddress.slice(0, 8)}...`);
      setWallet(walletAddress);
      setStatus("Hesap değiştiriliyor...");

      // Profili yükle
      let prof = loadProfile(walletAddress);

      // Supabase'den senkronize et
      let supabaseProfile = await loadUserProfile(walletAddress);
      if (supabaseProfile) {
        prof = {
          username: supabaseProfile.username,
          avatar: supabaseProfile.avatar,
          photoUrl: supabaseProfile.photo_url,
          bio: supabaseProfile.bio,
          level: supabaseProfile.level,
          selected_frame: supabaseProfile.selected_frame,
        };
        saveProfile(walletAddress, prof);
      }

      setProfile(prof);
      setEditUsername(prof.username);
      setEditBio(prof.bio ?? "");
      setSelectedAvatar(prof.avatar ?? AVATARS[0]);
      setPhotoPreview(prof.photoUrl ?? null);

      // Cache'i güncelle - switchAccount fonksiyonunda
      setProfilesCache(prev => ({ ...prev, [walletAddress]: prof }));

      // Satın alınan avatarları yükle
      const purchases = await getPurchasedAvatars(walletAddress);
      const emojis = purchases.map(p => p.avatar_emoji);
      setPurchasedAvatars(emojis);

      // Çerçeveleri yükle
      const framePurchases = await getPurchasedFrames(walletAddress);
      const frameIds = framePurchases.map(f => f.frame_id);
      setPurchasedFrames(frameIds);

      // Calculate total points from local leaderboard
      const localLBData = loadLocalLeaderboard();
      const totalPoints = localLBData.reduce((sum, entry) => sum + (entry.points || 0), 0);
      setTotalUserPoints(totalPoints);

      if (prof.selected_frame) {
        setSelectedFrame(prof.selected_frame);
      }

      // Bakiyeyi güncelle
      const bal = await getAccountBalance(walletAddress);
      setBalance(bal);

      // Session'ı güncelle
      saveSession(walletAddress);

      setStatus("✓ Hesap değiştirildi");
      setTimeout(() => setStatus(null), 2000);
      setShowAccountSwitcher(false);
      playClick();

      console.log(`✅ Switched to: ${prof.username}`);
    } catch (err) {
      console.error("Error switching account:", err);
      setStatus("Hesap değiştirilemedi");
    }
  };

  /* SAVE PROFILE */
  const saveProfileData = async () => {
    if (!wallet || !profile) return;
    const updated: Profile = {
      ...profile,
      username: editUsername,
      bio: editBio,
      avatar: selectedAvatar,
      photoUrl: photoPreview ?? undefined,
      level: profile.level ?? 1,
      selected_frame: selectedFrame,
    };
    
    // Yerel olarak kaydet
    saveProfile(wallet, updated);
    
    // Cache'i güncelle
    setProfilesCache(prev => ({ ...prev, [wallet]: updated }));
    
    // Supabase'e kaydet
    await saveUserProfile(wallet, {
      username: editUsername,
      bio: editBio,
      avatar: selectedAvatar,
      photo_url: photoPreview ?? undefined,
      level: profile.level ?? 1,
      selected_frame: selectedFrame,
    });
    
    setProfile(updated);
    setIsEditingProfile(false);
    setStatus("Profil güncellendi ✔");
    playClick();
  };

  /* HANDLE PHOTO UPLOAD */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Dosya çok büyük (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setPhotoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  /* START GAME */
  const startGame = async () => {
    // Önce cache'i kontrol et ve doldurmaya çalış
    const cacheKey = "ai_puzzle_cache";
    let cachedData = localStorage.getItem(cacheKey);
    let cache = cachedData ? JSON.parse(cachedData) : { puzzles: [], timestamp: 0 };
    
    // Cache boş veya eski ise birden fazla puzzle oluştur
    const needsCaching = !cachedData || cache.puzzles.length < 3;
    if (needsCaching) {
      setStatus("🤖 Puzzle'lar hazırlanıyor...");
      // 2 puzzle aynı anda oluştur ama rate limit'e takılmamak için sırayla
      for (let i = 0; i < 2; i++) {
        const result = await generatePuzzleWithAI(selectedDifficulty);
        if (result.success && result.data) {
          await new Promise(r => setTimeout(r, 500)); // 500ms bekleme
        }
      }
    }
    
    // AI puzzle oluştur (fallback olarak manuel puzzle kullan)
    const puzzleGenerationAttempts = 2;
    let puzzle: Puzzle | null = null;
    
    for (let i = 0; i < puzzleGenerationAttempts; i++) {
      setStatus(`🤖 Puzzle yükleniyor (${i + 1}/${puzzleGenerationAttempts})...`);
      const result = await generatePuzzleWithAI(selectedDifficulty);
      
      if (result.success && result.data) {
        puzzle = result.data as unknown as Puzzle;
        break;
      }
      
      // Rate limit hatası - daha uzun bekleme
      const isRateLimit = result.error?.includes("Rate limited");
      const waitTime = isRateLimit ? 3000 : 1000;
      
      if (i < puzzleGenerationAttempts - 1) {
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
    
    // AI başarısız olursa manuel puzzle kullan
    if (!puzzle) {
      setStatus("Manual puzzle yükleniyor...");
      puzzle = getRandomPuzzle();
    }
    
    setPuzzle(puzzle);
    setCode(puzzle.starterCode);
    
    const gameTime = TOTAL_TIME_BY_DIFFICULTY[selectedDifficulty];
    setTimeLeft(gameTime);
    
    // Zorluk seviyesine göre hata haklarını ayarla
    const mistakes = selectedDifficulty === "easy" ? 3 : selectedDifficulty === "medium" ? 1 : 0;
    setMistakesLeft(mistakes);
    
    setGameState("playing");
    setStatus(null);
    setCurrentPage("game");
    playClick();
  };

  /* FAIL */
  const handleFail = () => {
    setGameState("fail");
    setStatus("Bomba patladı! 💣");

    sound.tick.pause();
    sound.explosion.currentTime = 0;
    sound.explosion.play().catch(() => {});

    setExploded(true);
    document.body.classList.add("shake");

    // Update statistics for failed game
    if (wallet) {
      const updatedStats = updatePlayerStats(wallet, 0, false, selectedDifficulty);
      setPlayerStats(updatedStats);
    }

    setTimeout(() => {
      setExploded(false);
      document.body.classList.remove("shake");
    }, 600);
  };

  /* LOCAL SCORE */
  const addLocalScore = async () => {
    if (!puzzle || !profile) return;

    // Get points from puzzle definition
    const puzzlePoints = puzzle.points || (selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 2 : 3);

    const entry: LeaderboardEntry = {
      wallet_address: wallet ?? "Anonim",
      username: profile.username || "Anonim",
      puzzle_title: puzzle.title,
      remaining_time: timeLeft,
      created_at: new Date().toISOString(),
      difficulty: selectedDifficulty,
      points: puzzlePoints,
      avatar: selectedAvatar,
      selected_frame: selectedFrame,
    };

    const updated = [entry, ...localLB].slice(0, 20);
    setLocalLB(updated);
    saveLocalLeaderboard(updated);

    // Update persistent statistics
    if (wallet) {
      const updatedStats = updatePlayerStats(wallet, timeLeft, true, selectedDifficulty);
      setPlayerStats(updatedStats);
    }

    // Supabase'e kaydet
    if (wallet) {
      await saveScore({
        wallet_address: wallet,
        username: profile.username,
        puzzle_title: puzzle.title,
        difficulty: selectedDifficulty,
        remaining_time: timeLeft,
        points: puzzlePoints,
        avatar: selectedAvatar,
        selected_frame: selectedFrame,
      });
    }
  };

  /* GLOBAL SCORE - Supabase Leaderboard */
  const addSupabaseScore = async () => {
    if (!puzzle || !wallet || !profile) return;

    // Get points from puzzle definition
    const puzzlePoints = puzzle.points || (selectedDifficulty === "easy" ? 1 : selectedDifficulty === "medium" ? 2 : 3);

    const entry = {
      wallet_address: wallet,
      username: profile.username || "Anonim",
      puzzle_title: puzzle.title,
      remaining_time: timeLeft,
      difficulty: selectedDifficulty,
      points: puzzlePoints,
    };

    await saveScore(entry);
    const updated = await loadGlobalLeaderboard(selectedDifficulty);
    setGlobalLB(updated);
  };

  /* CHECK CODE */
  const checkCode = async () => {
    if (!puzzle) return;

    // AI puzzle ise AI ile kontrol et
    if (puzzle.id?.toString().includes("ai-")) {
      setStatus("🤖 Kod kontrol ediliyor...");
      const result = await validateCodeWithAI(
        code,
        puzzle.starterCode,
        puzzle.expectedOutput || ""
      );

      if (!result.success || !result.data) {
        // Hata hakları kontrol et
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

      addLocalScore();
      await addSupabaseScore();
      return;
    }

    // Manuel puzzle - eski kontrol yöntemi
    if (!puzzle.check || !puzzle.check(code)) {
      // Hata hakları kontrol et
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

    addLocalScore();
    await addSupabaseScore();

    // BOT MODUNDA - BOT ZAMANINI SIMÜLE ET
    if (gameMode === "bot") {
      // Bot oyuncudan biraz yavaş (random 2-4 saniye daha)
      const botDelay = Math.random() * 2000 + 2000;
      const botFinalTime = timeLeft - botDelay / 1000;
      setBotTime(Math.max(0, botFinalTime));
      setBotScore(puzzleScore(botFinalTime, selectedDifficulty));
      
      setTimeout(() => {
        setStatus(`🤖 Bot: ${(botFinalTime).toFixed(1)}s - ${(botScore).toFixed(0)} puan`);
      }, 1000);
    }
  };

  const progress = (timeLeft / TOTAL_TIME) * 100;
  const isPlaying = gameState === "playing";

/* =====================================================
      UI RENDER (Soft Cyber Theme)
===================================================== */

return (
  <div className="app-root">
    {/* FLOATING STARS BACKGROUND */}
    <div className="stars-background">
      {[...Array(15)].map((_, i) => (
        <div key={i} className="star"></div>
      ))}
    </div>

    {/* INTRO ANIMATION: BOMB FUSE */}
{showIntro && (
  <div className={`intro-screen ${introSuccess ? "success" : ""}`}>
    <div className="intro-title">STELLAR BOMB</div>
    <BombModel size="large" animated={true} />
    {introSuccess && <div className="intro-success-glow"></div>}
  </div>
)}

    {/* PATLAMA EFEKTI - Sadece bomba patladığında göster */}
    {exploded && gameState === "fail" && <div className="explosion" />}

    {/* =====================================================
          TOP HEADER (Hamburger + Menu + Profil)
    ====================================================== */}
    <div className="top-header">
      <div className="header-left">
        <button className="hamburger-btn" onClick={() => { playClick(); setSidebarOpen(!sidebarOpen); }} title="Menüyü Aç/Kapat">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {/* QUICK MENU */}
        <div className="quick-menu">
          <button className="menu-item" onClick={() => { playClick(); setCurrentPage("home"); }} title="Ana Sayfa">
            🏠
          </button>
          <button className="menu-item" onClick={() => { playClick(); startGame(); }} title="Oyuna Başla">
            🎮
          </button>
          <button className="menu-item" onClick={() => { playClick(); setCurrentPage("leaderboard"); }} title="Leaderboard">
            🏆
          </button>
          <button className="menu-item" onClick={() => { playClick(); setCurrentPage("about"); }} title="Hakkında">
            ℹ️
          </button>
          {wallet && isAdmin(wallet) && (
            <button className="menu-item" onClick={() => { playClick(); setCurrentPage("admin"); }} title="Admin Panel">
              ⚙️
            </button>
          )}
        </div>
      </div>
      
      {/* PROFIL HEADER (SAĞ ÜSTE) */}
      {wallet && profile && (
        <div className="profile-header-top">
          <AccountSwitcher
            currentWallet={wallet}
            savedWallets={savedWallets}
            profiles={profilesCache}
            onSwitchAccount={switchAccount}
            onAddAccount={connect}
            onRemoveAccount={(walletToRemove) => {
              setSavedWallets(prev => prev.filter(w => w !== walletToRemove));
              if (wallet === walletToRemove) {
                // Aktif hesap silinirse, ilk hesaba geç
                if (savedWallets.length > 1) {
                  const nextWallet = savedWallets.find(w => w !== walletToRemove);
                  if (nextWallet) switchAccount(nextWallet);
                } else {
                  setWallet(null);
                  setProfile(null);
                }
              }
            }}
          />
          <button className="btn-profile-edit" onClick={() => { playClick(); setCurrentPage("profile"); setSidebarOpen(false); }} title="Profil Ayarları">
            ⚙
          </button>
        </div>
      )}
    </div>

    {/* HEADER BANNER ADVERTISEMENT */}
    <div style={{ padding: "8px 20px", borderBottom: "1px solid rgba(0,255,165,0.15)" }}>
      <AdBanner placement="header-banner" type="banner" autoRotate={true} />
    </div>

    {/* =====================================================
          SIDEBAR (MENU)
    ====================================================== */}
    <div className={`sidebar-panel ${sidebarOpen ? "open" : ""}`}>

      {/* LOGO */}
      <div className="logo-block">
        <span className="logo-icon">💣</span>
        <span className="logo-title">Stellar Bomb</span>
      </div>

      {/* FREIGHTER CONNECT */}
      {!wallet ? (
        <button className="btn-main" onClick={() => { playClick(); connect(); }} title="Stellar Cüzdan Bağla">
          Freighter ile Bağlan
        </button>
      ) : (
        <div className="wallet-block">
          <button className="btn-main soft" onClick={playClick} title="Bağlı Cüzdan">
            {maskAddress(wallet)}
          </button>
        </div>
      )}

      {/* MENÜ */}
      <div className="menu-block">
        <p className="menu-label">Menü</p>

        <button className="btn-side" onClick={() => { playClick(); setCurrentPage("home"); setSidebarOpen(false); }}>
          Ana Sayfa
        </button>

        <button className="btn-side" onClick={() => { playClick(); startGame(); setSidebarOpen(false); }}>
          Oyuna Başla
        </button>

        <button className="btn-side" onClick={() => { playClick(); setCurrentPage("profile"); setSidebarOpen(false); }}>
          Profil
        </button>

        <button className="btn-side" onClick={() => { playClick(); setCurrentPage("leaderboard"); setSidebarOpen(false); }}>
          Leaderboard
        </button>

        <button className="btn-side" onClick={() => { playClick(); setCurrentPage("about"); setSidebarOpen(false); }}>
          Hakkında
        </button>
      </div>

      {status && <p className="status-box">{status}</p>}
    </div>

    {/* =====================================================
          MAIN AREA (RIGHT SIDE)
    ====================================================== */}
    <div className="main-area" onClick={() => sidebarOpen && setSidebarOpen(false)}>

      {/* ================= HOME PAGE ================= */}
      {currentPage === "home" && (
        <>
          {/* HERO SECTION */}
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-title">
                <span className="hero-bomb">💣</span>
                <h1>Stellar Bomb</h1>
              </div>
              <p className="hero-subtitle">Web3 Kod Çözme Oyunu</p>
              <p className="hero-description">
                Stellar testnet üzerinde çalışan heyecan dolu bir yarışma. 30 saniye içinde kodu düzelt, yoksa bomba patlar!
              </p>
              <button className="btn-main btn-hero" onClick={() => { playClick(); setCurrentPage("mode-select"); }} title="Oyun Modunu Seç">
                🚀 Oyuna Başla
              </button>
            </div>
            <div className="hero-visual">
              <BombModel size="large" animated={true} />
            </div>
          </div>

          {/* FEATURES GRID */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⏱</div>
              <h3>Hızlı Yarışma</h3>
              <p>30 saniye içinde hatalı kodu tespit et ve düzelt</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">ℹ️</div>
              <h3>Hakkında</h3>
              <p>Proje hakkında daha fazla bilgi al</p>
              <button 
                onClick={() => { playClick(); setCurrentPage("about"); }}
                title="Hakkında Sayfasını Aç"
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#00ff88",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              >
                Detaylı Bilgi
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Freighter Cüzdanı</h3>
              <p>Stellar üzerinde güvenli bağlantı ve hesap bakiyesi göster</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Global Leaderboard</h3>
              <p>Supabase üzerinde gerçek zamanlı oyuncu sıralamalarını izle</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Profil Yönetimi</h3>
              <p>Avatar, fotoğraf ve kullanıcı adını özelleştir</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Çoklu Bulmacalar</h3>
              <p>Farklı JavaScript soruları ile kendinizi test et</p>
            </div>
          </div>

          {/* DIFFICULTY SELECTION */}
          <div className="difficulty-section">
            <h2>⚡ Zorluk Seviyesi Seç</h2>
            <p className="difficulty-subtitle">Zorluk seviyesine göre süre ve puzzle'ın karmaşıklığı değişir</p>
            
            <div className="difficulty-grid">
              <div 
                className={`difficulty-card easy ${selectedDifficulty === "easy" ? "selected" : ""}`}
                onClick={() => { playClick(); setSelectedDifficulty("easy"); }}
              >
                <div className="difficulty-icon">🟢</div>
                <h3>Kolay</h3>
                <div className="difficulty-info">
                  <span className="time">⏱ 40 saniye</span>
                  <span className="complexity">Basit buglar</span>
                </div>
                <div className="difficulty-features">
                  <span>✓ Başlangıçlar için ideal</span>
                  <span>✓ Temel hatalar</span>
                </div>
                <div className="mistake-info">❌ 3 Hata Hakkı</div>
              </div>

              <div 
                className={`difficulty-card medium ${selectedDifficulty === "medium" ? "selected" : ""}`}
                onClick={() => { playClick(); setSelectedDifficulty("medium"); }}
              >
                <div className="difficulty-icon">🟡</div>
                <h3>Orta</h3>
                <div className="difficulty-info">
                  <span className="time">⏱ 30 saniye</span>
                  <span className="complexity">Orta zorluk</span>
                </div>
                <div className="difficulty-features">
                  <span>✓ Dengelenmiş zorluk</span>
                  <span>✓ Mantıksal hatalar</span>
                </div>
                <div className="mistake-info">❌ 1 Hata Hakkı</div>
              </div>

              <div 
                className={`difficulty-card hard ${selectedDifficulty === "hard" ? "selected" : ""}`}
                onClick={() => { playClick(); setSelectedDifficulty("hard"); }}
              >
                <div className="difficulty-icon">🔴</div>
                <h3>Zor</h3>
                <div className="difficulty-info">
                  <span className="time">⏱ 20 saniye</span>
                  <span className="complexity">Karmaşık buglar</span>
                </div>
                <div className="difficulty-features">
                  <span>✓ Hızlı çözme gerekli</span>
                  <span>✓ İleri seviye</span>
                </div>
                <div className="mistake-info hard">⚠️ Hatasız Mod</div>
              </div>
            </div>
          </div>

          {/* ADVERTISEMENT BANNER */}
          <div style={{ marginBottom: "60px" }}>
            <AdBanner placement="sidebar-spotlight" type="spotlight" autoRotate={true} />
          </div>

          {/* HOW TO PLAY */}
          <div className="how-to-play">
            <h2>🎯 Nasıl Oynanır?</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Freighter Bağlan</h4>
                <p>Stellar cüzdan ile oyunu başlat</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">2</div>
                <h4>Bulmacayı Çöz</h4>
                <p>30 saniye içinde kodu düzelt</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Skor Kaydet</h4>
                <p>Leaderboard'a ad yaz</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step">
                <div className="step-number">4</div>
                <h4>Tekrar Oyna</h4>
                <p>Daha iyi skor almaya çalış!</p>
              </div>
            </div>
          </div>

          {/* STATS SECTION */}
          {wallet && (
            <div className="stats-section">
              <h2>📊 Oyun İstatistikleri</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon">🎮</span>
                  <span className="stat-label">Toplam Oyun</span>
                  <span className="stat-number">{String(playerStats.totalGames || 0)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">✅</span>
                  <span className="stat-label">Başarılı</span>
                  <span className="stat-number">{String(playerStats.successfulGames || 0)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">❌</span>
                  <span className="stat-label">Başarısız</span>
                  <span className="stat-number">{String(playerStats.failedGames || 0)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-label">En İyi Skor</span>
                  <span className="stat-number">{String(playerStats.bestScore || 0)}s</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📈</span>
                  <span className="stat-label">Ortalama Skor</span>
                  <span className="stat-number">{String(playerStats.averageScore || 0)}s</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🟢</span>
                  <span className="stat-label">Kolay ✅</span>
                  <span className="stat-number">{String(playerStats.easySuccessful || 0)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🟡</span>
                  <span className="stat-label">Orta ✅</span>
                  <span className="stat-number">{String(playerStats.mediumSuccessful || 0)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🔴</span>
                  <span className="stat-label">Zor ✅</span>
                  <span className="stat-number">{String(playerStats.hardSuccessful || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA SECTION */}
          <div className="cta-section">
            {wallet ? (
              <>
                <h2>Hazır mısın?</h2>
                <p>Leaderboard'a çıkmak ve en iyi oyuncu olmak için başla!</p>
                <button className="btn-main btn-cta" onClick={() => { playClick(); startGame(); }} title="Oyuna Başla">
                  Şimdi Oyna 🎮
                </button>
              </>
            ) : (
              <>
                <h2>Oyuna başlamak için Freighter bağlan</h2>
                <p>Stellar cüzdan ile giriş yap ve rakiplerin karşısında sana karşı gelmesini sağla!</p>
                <button className="btn-main btn-cta" onClick={() => { playClick(); connect(); }} title="Cüzdanını Bağla">
                  Freighter ile Bağlan 🔐
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ================= GAME PAGE ================= */}
      {currentPage === "game" && (
        <div className="panel">
          {puzzle ? (
            <>
              {/* Puzzle Info */}
              <div className="game-header">
                <div>
                  <div className="game-title-row">
                    <h2>{puzzle.title}</h2>
                    <span className={`difficulty-badge ${selectedDifficulty}`}>
                      {selectedDifficulty === "easy" ? "🟢 Kolay" : selectedDifficulty === "medium" ? "🟡 Orta" : "🔴 Zor"}
                    </span>
                  </div>
                  <p className="muted">{puzzle.description}</p>
                </div>

                {/* TIMER */}
                <div className="timer-block">
                  <div
                    className={`timer ${isPlaying && timeLeft <= 5 ? "danger" : ""}`}
                    style={{
                      backgroundImage: `conic-gradient(
                        ${timeLeft <= 5 ? "rgb(255,0,51)" : timeLeft <= 10 ? "rgb(255,170,0)" : "rgb(0,255,166)"} ${progress}%,
                        #111827 0
                      )`,
                    }}
                  >
                    <span>{isPlaying ? timeLeft : "--"}</span>
                  </div>
                  <p className="timer-label">⏱ Kalan Süre</p>
                  
                  {/* MISTAKE COUNTER */}
                  <div className="mistakes-display">
                    {selectedDifficulty === "easy" && (
                      <span className={`mistakes-badge ${mistakesLeft === 0 ? "critical" : mistakesLeft === 1 ? "warning" : ""}`}>
                        ❌ {mistakesLeft} hak
                      </span>
                    )}
                    {selectedDifficulty === "medium" && (
                      <span className={`mistakes-badge ${mistakesLeft === 0 ? "critical" : ""}`}>
                        ❌ {mistakesLeft} hak
                      </span>
                    )}
                    {selectedDifficulty === "hard" && (
                      <span className="mistakes-badge hard">
                        ⚠️ Hatasız mod
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CODE EDITOR */}
              <div className="editor-panel">
                <div className="editor-top">
                  <div className="editor-info">
                    <span>{puzzle.id && puzzle.id > 8 ? "puzzle.cpp" : "puzzle.js"}</span>
                    <span className="editor-lang-tag">{puzzle.id && puzzle.id > 8 ? "C++" : "JavaScript"}</span>
                  </div>
                  {puzzle.id?.toString().includes("ai-") && (
                    <span className="ai-badge">🤖 AI Generated</span>
                  )}
                </div>

                <Editor
                  height="500px"
                  defaultLanguage={puzzle.id && puzzle.id > 8 ? "cpp" : "javascript"}
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v ?? "")}
                />
              </div>

              <button
                className="btn-main"
                disabled={!isPlaying}
                onClick={() => { playClick(); checkCode(); }}
                title="Kodu Kontrol Et"
              >
                Gönder
              </button>

              {/* SUCCESS SCREEN */}
              {gameState === "success" && (
                <div className="result-overlay success-overlay">
                  <div className="result-modal success-modal">
                    <div className="result-icon">🎉</div>
                    <h2>Doğru Cevap!</h2>
                    <p className="result-description">Bulmacayı başarıyla çözdün!</p>
                    
                    <div className="score-display">
                      <div className="score-item">
                        <span className="score-label">Kalan Süre</span>
                        <span className="score-value">{timeLeft} saniye</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">Bulmaca</span>
                        <span className="score-value">{puzzle.title}</span>
                      </div>
                    </div>

                    {/* BOT MOD SKOR TABLOSU */}
                    {gameMode === "bot" && (
                      <div className="bot-vs-player">
                        <div className="bot-vs-item player">
                          <div className="vs-icon">👤</div>
                          <div className="vs-name">Sen</div>
                          <div className="vs-score">{puzzleScore(timeLeft, selectedDifficulty)}</div>
                        </div>
                        <div className="vs-vs">VS</div>
                        <div className="bot-vs-item bot">
                          <div className="vs-icon">🤖</div>
                          <div className="vs-name">Bot</div>
                          <div className="vs-score">{botScore}</div>
                        </div>
                      </div>
                    )}

                    <div className="result-actions">
                      <button className="btn-result btn-success" onClick={() => { playClick(); setCurrentPage("home"); setGameState("idle"); }} title="Ana Sayfaya Geri Dön">
                        Ana Sayfaya Dön
                      </button>
                      <button className="btn-result btn-primary" onClick={() => { playClick(); setCurrentPage("mode-select"); setGameState("idle"); }} title="Mod Seç">
                        Mod Seç
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FAIL SCREEN */}
              {gameState === "fail" && (
                <div className="result-overlay fail-overlay">
                  <div className="result-modal fail-modal">
                    <div className="result-icon fail-icon">💥</div>
                    <h2>Bomba Patladı!</h2>
                    <p className="result-description">Süre bitti, lütfen tekrar dene.</p>
                    
                    <div className="score-display">
                      <div className="score-item">
                        <span className="score-label">Bulmaca</span>
                        <span className="score-value">{puzzle.title}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">Durumu</span>
                        <span className="score-value">Başarısız</span>
                      </div>
                    </div>

                    <div className="result-actions">
                      <button className="btn-result btn-fail" onClick={() => { playClick(); setCurrentPage("home"); setGameState("idle"); }} title="Ana Sayfaya Geri Dön">
                        Ana Sayfaya Dön
                      </button>
                      <button className="btn-result btn-primary" onClick={() => { playClick(); startGame(); }} title="Oyunu Tekrar Başlat">
                        Tekrar Dene
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p>Puzzle yüklenmedi.</p>
          )}
        </div>
      )}

      {/* ================= PROFILE PAGE ================= */}
      {currentPage === "profile" && (
        <div className="panel">
          <h2>👤 Profil Yönetimi</h2>

          {!wallet ? (
            <p className="muted">Önce Freighter ile bağlanmalısın.</p>
          ) : (
            <>
              <div className="profile-card">
                <div className="profile-header">
                  <div className={`avatar-frame avatar-frame-${selectedFrame}`}>
                    <div 
                      className="profile-avatar-container"
                      onMouseDown={() => {
                        const timer = setTimeout(() => {
                          setPhotoPreviewOpen(true);
                        }, 1500);
                        setLongPressTimer(timer);
                      }}
                      onMouseUp={() => {
                        if (longPressTimer) clearTimeout(longPressTimer);
                        setLongPressTimer(null);
                      }}
                      onMouseLeave={() => {
                        if (longPressTimer) clearTimeout(longPressTimer);
                        setLongPressTimer(null);
                      }}
                      onTouchStart={() => {
                        const timer = setTimeout(() => {
                          setPhotoPreviewOpen(true);
                        }, 1500);
                        setLongPressTimer(timer);
                      }}
                      onTouchEnd={() => {
                        if (longPressTimer) clearTimeout(longPressTimer);
                        setLongPressTimer(null);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="Profil" className="profile-photo" />
                      ) : (
                        <div className="profile-avatar">{profile?.avatar ?? "👨‍💻"}</div>
                      )}
                    </div>
                  </div>
                  <div className="profile-info">
                    <h3>{profile?.username ?? "Oyuncu"}</h3>
                    <p className="muted">{maskAddress(wallet)}</p>
                    {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
                  </div>
                  <button className="btn-edit" onClick={() => setIsEditingProfile(true)}>
                    ✎ Düzenle
                  </button>
                </div>

                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">🎯 Toplam Puanlar</span>
                    <span className="stat-value" style={{ color: "#ffc800", fontWeight: "bold" }}>{String(totalUserPoints || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Toplam Oyun</span>
                    <span className="stat-value">{String(playerStats.totalGames || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">✅ Başarılı</span>
                    <span className="stat-value">{String(playerStats.successfulGames || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">❌ Başarısız</span>
                    <span className="stat-value">{String(playerStats.failedGames || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">En İyi Skor</span>
                    <span className="stat-value">{String(playerStats.bestScore || 0)}s</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Ortalama</span>
                    <span className="stat-value">{String(playerStats.averageScore || 0)}s</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🟢 Kolay ✅</span>
                    <span className="stat-value">{String(playerStats.easySuccessful || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🟡 Orta ✅</span>
                    <span className="stat-value">{String(playerStats.mediumSuccessful || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">🔴 Zor ✅</span>
                    <span className="stat-value">{String(playerStats.hardSuccessful || 0)}</span>
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="profile-edit-modal">
                  <div className="modal-header">
                    <h3>Profili Düzenle</h3>
                    <button className="btn-close" onClick={() => setIsEditingProfile(false)}>✕</button>
                  </div>

                  <div className="edit-section">
                    <label className="menu-label">Profil Fotoğrafı</label>
                    <div className="photo-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="photo-input"
                        id="photo-input"
                      />
                      <label htmlFor="photo-input" className="photo-input-label">
                        {photoPreview ? "📷 Değiştir" : "📸 Fotoğraf Seç"}
                      </label>
                      {photoPreview && (
                        <div className="photo-preview">
                          <img src={photoPreview} alt="Profil Ön İzlemesi" />
                          <button
                            type="button"
                            className="btn-remove-photo"
                            title="Fotoğrafı Kaldır"
                            onClick={() => setPhotoPreview(null)}
                          >
                            ✕ Kaldır
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="edit-section">
                    <label className="menu-label">Avatar Seç</label>
                    <div className="avatar-selector">
                      {AVATARS_DATA.map((avatarData) => {
                        const isOwned = avatarData.cost === 0 || purchasedAvatars.includes(avatarData.emoji);
                        return (
                          <div key={avatarData.emoji} className="avatar-card-wrapper">
                            <button
                              className={`avatar-btn ${selectedAvatar === avatarData.emoji ? "selected" : ""} ${!isOwned ? "locked" : ""}`}
                              onClick={() => {
                                if (isOwned) {
                                  // Sahip olan avatar - direkt seç
                                  setSelectedAvatar(avatarData.emoji);
                                  localStorage.setItem("selectedAvatar", avatarData.emoji);
                                  playClick();
                                } else {
                                  // Satın alınmamış avatar - satın alma modalını aç
                                  setPurchaseModal({ isOpen: true, avatar: avatarData });
                                }
                              }}
                              type="button"
                              title={avatarData.description}
                            >
                              {avatarData.emoji}
                              {!isOwned && <span className="lock-icon">🔒</span>}
                            </button>
                            <div className="avatar-info">
                              <p className="avatar-name">{avatarData.name}</p>
                              <p className="avatar-desc">{avatarData.description}</p>
                              {avatarData.cost === 0 && (
                                <p className="avatar-cost free">✓ Ücretsiz</p>
                              )}
                              {avatarData.cost > 0 && isOwned && (
                                <p className="avatar-cost owned">✓ Sahibi</p>
                              )}
                              {avatarData.cost > 0 && !isOwned && (
                                <p className="avatar-cost">💰 {avatarData.cost} XLM</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="edit-section">
                    <label className="menu-label">Avatar Çerçevesi Seç</label>
                    <div className="frame-selector">
                      {AVATAR_FRAMES_DATA.map((frameData) => {
                        const isOwnedFrame = frameData.cost === 0 || purchasedFrames.includes(frameData.id);
                        return (
                          <div key={frameData.id} className="frame-card-wrapper">
                            <button
                              className={`frame-btn ${selectedFrame === frameData.id ? "selected" : ""} ${!isOwnedFrame ? "locked" : ""}`}
                              onClick={() => {
                                if (isOwnedFrame) {
                                  // Sahip olan çerçeve - direkt seç
                                  setSelectedFrame(frameData.id);
                                  localStorage.setItem("selectedFrame", frameData.id);
                                  playClick();
                                } else {
                                  // Satın alınmamış çerçeve - satın alma modalını aç
                                  setPurchaseModal({ isOpen: true, avatar: null, frame: frameData });
                                }
                              }}
                              type="button"
                              title={frameData.description}
                            >
                              <div className={`avatar-frame avatar-frame-${frameData.id}`}>
                                <div className="preview-avatar">✨</div>
                              </div>
                              {!isOwnedFrame && <span className="lock-icon">🔒</span>}
                            </button>
                            <div className="frame-info">
                              <p className="frame-name">{frameData.name}</p>
                              <p className="frame-desc">{frameData.description}</p>
                              {frameData.cost === 0 && (
                                <p className="frame-cost free">✓ Ücretsiz</p>
                              )}
                              {frameData.cost > 0 && isOwnedFrame && (
                                <p className="frame-cost owned">✓ Sahibi</p>
                              )}
                              {frameData.cost > 0 && !isOwnedFrame && (
                                <p className="frame-cost">💰 {frameData.cost} XLM</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="edit-section">
                    <label className="menu-label">Kullanıcı Adı</label>
                    <input
                      className="input-soft"
                      type="text"
                      maxLength={20}
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Adınızı girin"
                    />
                  </div>

                  <div className="edit-section">
                    <label className="menu-label">Bio (İsteğe Bağlı)</label>
                    <textarea
                      className="input-soft textarea"
                      maxLength={100}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Kısa bir açıklama yazın"
                      rows={3}
                    />
                    <p className="char-count">{editBio.length}/100</p>
                  </div>

                  <div className="modal-actions">
                    <button className="btn-main" onClick={() => { playClick(); saveProfileData(); }} title="Profil Değişikliklerini Kaydet">
                      ✓ Kaydet
                    </button>
                    <button className="btn-cancel" onClick={() => setIsEditingProfile(false)} title="İptal Et">
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {/* AVATAR SATINLAMA MODAL */}
              {purchaseModal.isOpen && (purchaseModal.avatar || purchaseModal.frame) && (
                <div className="modal-overlay">
                  <div className="purchase-modal">
                    <h3>{purchaseModal.avatar ? "🛍️ Avatar Satın Al" : "🛍️ Çerçeve Satın Al"}</h3>
                    <div className="purchase-content">
                      {purchaseModal.avatar ? (
                        <>
                          <div className="avatar-large">{purchaseModal.avatar.emoji}</div>
                          <p className="avatar-title">{purchaseModal.avatar.name}</p>
                          <p className="avatar-desc-modal">{purchaseModal.avatar.description}</p>
                          <div className="purchase-price">
                            <span className="price-label">Fiyat:</span>
                            <span className="price-value">💰 {purchaseModal.avatar.cost} XLM</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`avatar-frame avatar-frame-${purchaseModal.frame!.id}`}>
                            <div className="preview-avatar">✨</div>
                          </div>
                          <p className="avatar-title">{purchaseModal.frame!.name}</p>
                          <p className="avatar-desc-modal">{purchaseModal.frame!.description}</p>
                          <div className="purchase-price">
                            <span className="price-label">Fiyat:</span>
                            <span className="price-value">💰 {purchaseModal.frame!.cost} XLM</span>
                          </div>
                        </>
                      )}
                      <p className="balance-info">Cüzdan Bakiyesi: <strong>{balance} XLM</strong></p>
                      {purchaseModal.avatar && parseFloat(balance) < purchaseModal.avatar.cost && (
                        <p className="warning">⚠️ Yeterli bakiye yok!</p>
                      )}
                      {purchaseModal.frame && parseFloat(balance) < purchaseModal.frame.cost && (
                        <p className="warning">⚠️ Yeterli bakiye yok!</p>
                      )}
                    </div>
                    <div className="modal-actions">
                      <button 
                        className="btn-main" 
                        onClick={async () => {
                          if (!wallet) return;
                          setIsPurchasing(true);
                          try {
                            if (purchaseModal.avatar) {
                              // ===== AVATAR SATINLAMA =====
                              const txHash = await purchaseAvatar(wallet, purchaseModal.avatar.name, purchaseModal.avatar.cost);
                              
                              // Supabase'e kaydet
                              await saveAvatarPurchase(
                                wallet,
                                purchaseModal.avatar.emoji,
                                purchaseModal.avatar.name,
                                purchaseModal.avatar.cost,
                                txHash
                              );
                              
                              // State güncelle
                              const newPurchased = [...purchasedAvatars, purchaseModal.avatar.emoji];
                              setPurchasedAvatars(newPurchased);
                              setSelectedAvatar(purchaseModal.avatar.emoji);
                              
                              const updatedProfile: Profile = {
                                ...profile!,
                                avatar: purchaseModal.avatar.emoji,
                              };
                              setProfile(updatedProfile);
                              
                              if (profile) {
                                await saveUserProfile(wallet, {
                                  username: profile.username,
                                  avatar: purchaseModal.avatar.emoji,
                                  photo_url: profile.photoUrl,
                                  bio: profile.bio,
                                  level: profile.level ?? 1,
                                  selected_frame: profile.selected_frame,
                                });
                              }
                              
                              saveProfile(wallet, updatedProfile);
                              
                              setPurchaseMessage(`✅ ${purchaseModal.avatar.name} başarıyla satın alındı!`);
                              
                            } else if (purchaseModal.frame) {
                              // ===== ÇERÇEVE SATINLAMA =====
                              const txHash = await purchaseAvatar(wallet, purchaseModal.frame.name, purchaseModal.frame.cost);
                              
                              // Supabase'e kaydet
                              await saveFramePurchase(
                                wallet,
                                purchaseModal.frame.id,
                                purchaseModal.frame.name,
                                purchaseModal.frame.cost,
                                txHash
                              );
                              
                              // State güncelle
                              const newFrames = [...purchasedFrames, purchaseModal.frame.id];
                              setPurchasedFrames(newFrames);
                              setSelectedFrame(purchaseModal.frame.id);
                              localStorage.setItem("selectedFrame", purchaseModal.frame.id);
                              
                              // Profili güncelle
                              const updatedProfile: Profile = {
                                ...profile!,
                                selected_frame: purchaseModal.frame.id,
                              };
                              setProfile(updatedProfile);
                              
                              if (profile) {
                                await saveUserProfile(wallet, {
                                  username: profile.username,
                                  avatar: profile.avatar,
                                  photo_url: profile.photoUrl,
                                  bio: profile.bio,
                                  level: profile.level ?? 1,
                                  selected_frame: purchaseModal.frame.id,
                                });
                              }
                              
                              saveProfile(wallet, updatedProfile);
                              
                              setPurchaseMessage(`✅ ${purchaseModal.frame.name} başarıyla satın alındı!`);
                            }
                            
                            setPurchaseModal({ isOpen: false, avatar: null });
                            
                            // Bakiye güncelle
                            let retries = 0;
                            const maxRetries = 5;
                            let newBalance = balance;
                            
                            while (retries < maxRetries) {
                              try {
                                newBalance = await getAccountBalance(wallet);
                                const oldBalance = parseFloat(balance);
                                const newBal = parseFloat(newBalance);
                                
                                if (newBal < oldBalance - 0.5) {
                                  setBalance(newBalance);
                                  break;
                                }
                                
                                retries++;
                                if (retries < maxRetries) {
                                  await new Promise(r => setTimeout(r, 2000));
                                }
                              } catch (err) {
                                retries++;
                                if (retries < maxRetries) {
                                  await new Promise(r => setTimeout(r, 2000));
                                }
                              }
                            }
                            
                            setBalance(newBalance);
                            setTimeout(() => setPurchaseMessage(null), 2000);
                          } catch (error: any) {
                            setPurchaseMessage(`❌ Hata: ${error.message}`);
                            setTimeout(() => setPurchaseMessage(null), 3000);
                          } finally {
                            setIsPurchasing(false);
                          }
                        }}
                        disabled={isPurchasing || (purchaseModal.avatar ? parseFloat(balance) < purchaseModal.avatar.cost : purchaseModal.frame ? parseFloat(balance) < purchaseModal.frame.cost : true)}
                      >
                        {isPurchasing ? "⏳ İşleniyor..." : "✓ Satın Al"}
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={() => setPurchaseModal({ isOpen: false, avatar: null })}
                        disabled={isPurchasing}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SATINLAMA MESAJI */}
              {purchaseMessage && (
                <div className="purchase-toast">
                  {purchaseMessage}
                </div>
              )}

              {!isEditingProfile && (
                <div className="wallet-section">
                  <p className="menu-label">💰 Cüzdan Detayları</p>
                  <div className="wallet-info">
                    <div className="wallet-item">
                      <span className="wallet-label">Adres:</span>
                      <code className="wallet-code">{wallet}</code>
                    </div>
                    <div className="wallet-item">
                      <span className="wallet-label">Bakiye:</span>
                      <span className="wallet-balance">
                        {loadingBalance ? "⏳..." : `${balance} XLM`}
                      </span>
                    </div>
                    <button 
                      className="btn-refresh-balance"
                      onClick={async () => {
                        if (!wallet) return;
                        setLoadingBalance(true);
                        try {
                          // 3 kez çalış (blockchain delay'i için)
                          let newBal = await getAccountBalance(wallet);
                          setBalance(newBal);
                          
                          // Eğer bakiye değişmediyse, 2 saniye sonra tekrar dene
                          if (parseFloat(newBal) === parseFloat(balance)) {
                            await new Promise(r => setTimeout(r, 2000));
                            newBal = await getAccountBalance(wallet);
                            setBalance(newBal);
                          }
                          
                          setStatus("✅ Bakiye güncellendi");
                          setTimeout(() => setStatus(null), 2000);
                        } catch (err) {
                          setStatus("❌ Bakiye güncellenemedi");
                          setTimeout(() => setStatus(null), 2000);
                        } finally {
                          setLoadingBalance(false);
                        }
                      }}
                      disabled={loadingBalance}
                    >
                      {loadingBalance ? "⏳..." : "🔄 Yenile"}
                    </button>
                  </div>

                  {purchasedAvatars.length > 0 && (
                    <div className="purchased-avatars">
                      <p className="menu-label">🛍️ Satın Alınan Avatarlar ({purchasedAvatars.length})</p>
                      <div className="avatars-grid">
                        {purchasedAvatars.map((emoji) => (
                          <div key={emoji} className="purchased-avatar">
                            <span className="avatar-emoji">{emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ÇIKIŞ BUTONU */}
                  <div style={{ marginTop: "24px", borderTop: "1px solid rgba(0,255,120,0.1)", paddingTop: "16px" }}>
                    <button
                      className="btn-main"
                      onClick={() => {
                        playClick();
                        setWallet(null);
                        setProfile(null);
                        setBalance("0");
                        setPurchasedAvatars([]);
                        setSelectedAvatar(AVATARS[0]);
                        setEditUsername("");
                        setEditBio("");
                        setPhotoPreview(null);
                        setIsEditingProfile(false);
                        setCurrentPage("home");
                        setSidebarOpen(false);
                        // Wallet ve Profile'ı temizle
                        setWallet(null);
                        setProfile(null);
                        // Clear session on logout (async, non-blocking)
                        clearSession().catch(err => {
                          console.error("Error clearing session:", err);
                        });
                        setStatus("Hesaptan çıkış yapıldı");
                        setTimeout(() => setStatus(null), 2000);
                      }}
                      style={{
                        background: "linear-gradient(135deg, rgba(255,100,100,0.3), rgba(255,50,50,0.2))",
                        borderColor: "rgba(255,100,100,0.5)",
                        color: "#ff6464",
                        width: "100%",
                      }}
                    >
                      🚪 Hesaptan Çıkış Yap
                    </button>

                    {/* ACCOUNT SWITCHER */}
                    {savedWallets.length > 0 && (
                      <>
                        <button
                          className="btn-secondary"
                          onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                          style={{ width: "100%", marginTop: "12px" }}
                          title="Hesaplar arasında geç"
                        >
                          👥 {showAccountSwitcher ? "Gizle" : "Diğer Hesaplar"} ({savedWallets.length})
                        </button>

                        {showAccountSwitcher && (
                          <div style={{
                            marginTop: "12px",
                            padding: "12px",
                            background: "rgba(0, 255, 136, 0.05)",
                            borderRadius: "8px",
                            border: "1px solid rgba(0, 255, 136, 0.2)",
                            maxHeight: "200px",
                            overflowY: "auto"
                          }}>
                            {savedWallets.map((w, idx) => {
                              const prof = loadProfile(w);
                              const isCurrentWallet = w === wallet;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => switchAccount(w)}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: idx < savedWallets.length - 1 ? "8px" : "0",
                                    background: isCurrentWallet 
                                      ? "rgba(0, 255, 136, 0.2)" 
                                      : "rgba(100, 150, 255, 0.1)",
                                    border: isCurrentWallet 
                                      ? "2px solid rgba(0, 255, 136, 0.5)"
                                      : "1px solid rgba(100, 150, 255, 0.3)",
                                    borderRadius: "6px",
                                    color: isCurrentWallet ? "#00ff88" : "#6496ff",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    textAlign: "left"
                                  }}
                                  title={`${prof.username} - ${w.slice(0, 10)}...`}
                                >
                                  {isCurrentWallet ? "✓" : "○"} {prof.username || "Anonim"} {isCurrentWallet && "(Aktif)"}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PHOTO PREVIEW MODAL */}
          {photoPreviewOpen && profile?.photoUrl && (
            <div className="modal-overlay" onClick={() => setPhotoPreviewOpen(false)}>
              <div className="modal-photo-preview" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn-close-preview"
                  onClick={() => setPhotoPreviewOpen(false)}
                >
                  ✕
                </button>
                <img src={profile.photoUrl} alt="Profil Önizlemesi" className="preview-photo-large" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODE SELECT PAGE ================= */}
      {currentPage === "mode-select" && (
        <div className="panel">
          <h2>🎮 Oyun Modunu Seç</h2>
          <div className="mode-selection-grid">
            {/* SINGLE PLAYER */}
            <div className="mode-card" onClick={() => { setGameMode("single"); startGame(); setCurrentPage("game"); }}>
              <div className="mode-icon">👤</div>
              <h3>Tekli Oyun</h3>
              <p>Kendine karşı oyna</p>
              <p className="mode-reward">⭐ Puanları Kazan</p>
              <button className="btn-mode">Başla</button>
            </div>

            {/* VS BOT */}
            <div className="mode-card" onClick={() => { setGameMode("bot"); setBotScore(0); setBotTime(0); startGame(); setCurrentPage("game"); }}>
              <div className="mode-icon">🤖</div>
              <h3>VS Bot</h3>
              <p>Yapay zeka'ya karşı oyna</p>
              <p className="mode-reward">🎁 Bonus Puan</p>
              <button className="btn-mode">Başla</button>
            </div>

          </div>
        </div>
      )}

      {/* ================= LEADERBOARD PAGE ================= */}
      {currentPage === "leaderboard" && (
        <div className="panel">
          <h2>🏆 Global Leaderboard</h2>
          <p style={{ color: "#888", marginBottom: "20px" }}>Dünyadaki en iyi oyuncuların sıralaması</p>

          {/* LEADERBOARD BANNER ADVERTISEMENT */}
          <div style={{ marginBottom: "20px" }}>
            <AdBanner placement="leaderboard-banner" type="banner" autoRotate={true} />
          </div>

          {/* Difficulty Tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button 
              onClick={() => setLeaderboardFilter("all")}
              style={{
                padding: "8px 16px",
                background: leaderboardFilter === "all" ? "#00ff88" : "rgba(0,255,136,0.2)",
                color: leaderboardFilter === "all" ? "#000" : "#00ff88",
                border: "1px solid #00ff88",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: leaderboardFilter === "all" ? "bold" : "normal"
              }}
            >
              📊 Tümü
            </button>
            <button 
              onClick={() => setLeaderboardFilter("easy")}
              style={{
                padding: "8px 16px",
                background: leaderboardFilter === "easy" ? "#00ff88" : "rgba(0,255,136,0.2)",
                color: leaderboardFilter === "easy" ? "#000" : "#00ff88",
                border: "1px solid #00ff88",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: leaderboardFilter === "easy" ? "bold" : "normal"
              }}
            >
              🟢 Kolay
            </button>
            <button 
              onClick={() => setLeaderboardFilter("medium")}
              style={{
                padding: "8px 16px",
                background: leaderboardFilter === "medium" ? "#00ff88" : "rgba(0,255,136,0.2)",
                color: leaderboardFilter === "medium" ? "#000" : "#00ff88",
                border: "1px solid #00ff88",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: leaderboardFilter === "medium" ? "bold" : "normal"
              }}
            >
              🟡 Orta
            </button>
            <button 
              onClick={() => setLeaderboardFilter("hard")}
              style={{
                padding: "8px 16px",
                background: leaderboardFilter === "hard" ? "#00ff88" : "rgba(0,255,136,0.2)",
                color: leaderboardFilter === "hard" ? "#000" : "#00ff88",
                border: "1px solid #00ff88",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: leaderboardFilter === "hard" ? "bold" : "normal"
              }}
            >
              🔴 Zor
            </button>
          </div>

          {/* Monthly Rewards Info */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(0,255,136,0.1), rgba(255,200,0,0.1))",
            border: "1px solid rgba(255,200,0,0.3)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px"
          }}>
            <h4 style={{ color: "#ffc800", marginTop: 0 }}>💰 Aylık Ödüller (Her Ayın 1. Günü)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "14px" }}>
              <div style={{ 
                background: "rgba(255,0,0,0.15)",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,0,0,0.3)"
              }}>
                <div style={{ color: "#ff6b6b", fontWeight: "bold" }}>🔴 Zor</div>
                <div style={{ color: "#ffc800", marginTop: "4px" }}>1. Sıra: 500 XLM</div>
              </div>
              <div style={{ 
                background: "rgba(255,200,0,0.15)",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,200,0,0.3)"
              }}>
                <div style={{ color: "#ffc800", fontWeight: "bold" }}>🟡 Orta</div>
                <div style={{ color: "#ffc800", marginTop: "4px" }}>1. Sıra: 250 XLM</div>
              </div>
              <div style={{ 
                background: "rgba(0,255,100,0.15)",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(0,255,100,0.3)"
              }}>
                <div style={{ color: "#00ff88", fontWeight: "bold" }}>🟢 Kolay</div>
                <div style={{ color: "#ffc800", marginTop: "4px" }}>1. Sıra: 125 XLM</div>
              </div>
            </div>
          </div>          {globalLB.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <p>📊 Global leaderboard yükleniyor...</p>
              <p style={{ marginTop: "10px" }}>Lütfen bekleyin veya yerel sıralamayı görüntüleyin</p>
              <button 
                className="btn-main" 
                onClick={() => {
                  loadGlobalLeaderboard(selectedDifficulty).then(setGlobalLB).catch(() => {});
                }}
                style={{ marginTop: "15px" }}
              >
                🔄 Tekrar Yükle
              </button>
            </div>
          ) : (
            <div className="leaderboard-table">
              <ul className="lb-list">
                {globalLB.filter(e => leaderboardFilter === "all" || e.difficulty === leaderboardFilter).slice(0, 50).map((e, i) => {
                  const isWinner = i === 0; // 1. sıra ödül alıyor
                  const rewardAmount = 
                    leaderboardFilter === "hard" ? "500 XLM" :
                    leaderboardFilter === "medium" ? "250 XLM" :
                    leaderboardFilter === "easy" ? "125 XLM" : "";
                  
                  return (
                    <li 
                      key={i} 
                      className="lb-item"
                      style={isWinner ? {
                        background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,200,0,0.1))",
                        border: "2px solid rgba(255,200,0,0.5)",
                        borderRadius: "6px"
                      } : {}}
                    >
                      <div className="lb-rank">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className={`lb-avatar avatar-frame avatar-frame-${e.selected_frame || "frame-none"}`}>
                        {e.avatar || "👨‍💻"}
                      </div>
                      <div className="lb-info">
                        <span className="lb-name">{e.username || "Anonim"}</span>
                        <span className="lb-puzzle">{e.puzzle_title}</span>
                      </div>
                      <div className="lb-score">
                        <span className={`difficulty-badge ${e.difficulty || "medium"}`}>
                          {e.difficulty === "easy" ? "🟢" : e.difficulty === "medium" ? "🟡" : "🔴"}
                        </span>
                        <span className="score-time">{e.points || 0} 🎯</span>
                      </div>
                      <span className="score-date" style={isWinner ? { color: "#ffc800", fontWeight: "bold" } : {}}>
                        {isWinner ? `💰 ${rewardAmount}` : new Date(e.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Local Leaderboard */}
          <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid rgba(0,255,165,0.2)" }}>
            <h3>📱 Yerel Leaderboard (Bu Cihazda)</h3>
            {localLB.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>Henüz skor kaydı yok</p>
            ) : (
              <div className="leaderboard-table">
                <ul className="lb-list">
                  {localLB.slice(0, 20).map((e, i) => (
                    <li key={i} className="lb-item">
                      <div className="lb-rank">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <div className={`lb-avatar avatar-frame avatar-frame-${e.selected_frame || "frame-none"}`}>
                        {e.avatar || "👨‍💻"}
                      </div>
                      <div className="lb-info">
                        <span className="lb-name">{e.username}</span>
                        <span className="lb-puzzle">{e.puzzle_title}</span>
                      </div>
                      <div className="lb-score">
                        <span className={`difficulty-badge ${e.difficulty || "medium"}`}>
                          {e.difficulty === "easy" ? "🟢" : e.difficulty === "medium" ? "🟡" : "🔴"}
                        </span>
                        <span className="score-time">{e.points || 0} 🎯</span>
                      </div>
                      <span className="score-date">{new Date(e.created_at).toLocaleDateString("tr-TR")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= ADMIN PAGE ================= */}
      {currentPage === "admin" && wallet && isAdmin(wallet) && (
        <AdminPanel 
          isAdmin={true}
          onLogout={() => setCurrentPage("home")}
        />
      )}

      {/* ================= ABOUT PAGE ================= */}
      {currentPage === "about" && (
        <div className="panel">
          <h2>🚀 Stellar Bomb Hakkında</h2>
          
          <div style={{ marginTop: "20px", lineHeight: "1.8" }}>
            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>✨ Nedir?</h3>
            <p>
              Stellar Bomb, Web3 teknolojisinin gücünü eğlence ile birleştiren devrim niteliğinde bir oyun platformudur. 
              Blockchain üzerinde gerçek skorlar, gerçek kazançlar ve gerçek rekabet yaşayın!
            </p>

            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>🎮 Nasıl Oynanır?</h3>
            <p>
              30 saniye içinde JavaScript kodundaki hataları bulup düzelt. Zamanla yarış ve leaderboard'da yerini al!
            </p>

            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>🌟 Öne Çıkan Özellikleri</h3>
            <ul style={{ marginLeft: "20px" }}>
              <li>🔐 <strong>Güvenli Web3 Entegrasyonu:</strong> Freighter Wallet ile tamamen merkeziyetsiz bağlantı</li>
              <li>⚡ <strong>Hızlı & Uyumlu:</strong> Tüm cihazlarda sorunsuz çalışan responsive tasarım</li>
              <li>🏆 <strong>Çift Leaderboard Sistemi:</strong> Yerel skorlardan global rekabete kadar</li>
              <li>💰 <strong>Blockchain Kaydı:</strong> Tüm skorlar ve başarılar Supabase'de kalıcı olarak depolanır</li>
              <li>🎨 <strong>Cyberpunk Tasarım:</strong> Neon renkler ve etkileyici animasyonlarla futuristik deneyim</li>
              <li>📊 <strong>Gelişmiş İstatistikler:</strong> Performans analizi ve ilerleme takibi</li>
            </ul>

            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>🛠️ Teknoloji Stack</h3>
            <p>
              <strong>Frontend:</strong> React 19 + TypeScript + Vite | 
              <strong>Backend:</strong> Supabase PostgreSQL | 
              <strong>Blockchain:</strong> Stellar SDK | 
              <strong>Tasarım:</strong> Custom CSS3 Animations
            </p>

            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>👥 Kime Yönelik?</h3>
            <p>
              Yazılım öğrenen gençler, kod severleri, Web3 meraklıları ve rekabetçi oyuncular için tasarlandı. 
              Eğlenirken öğren, rekabet et ve blockchain dünyasında adını duyur!
            </p>

            <h3 style={{ color: "#00ff88", marginTop: "15px" }}>🎯 Vizyonumuz</h3>
            <p>
              Gamefi dünyasında en eğlenceli, en adil ve en güvenilir mini oyun platformu olmak. 
              Topluluk tarafından yönetilen, oyuncu merkezli bir ekosistem inşa etmek.
            </p>

            <div style={{
              marginTop: "25px",
              padding: "15px",
              backgroundColor: "rgba(0, 255, 136, 0.1)",
              border: "2px solid #00ff88",
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "14px", margin: 0 }}>
                💡 <strong>Hazır mısın?</strong> Aşağı scroll et, Freighter Wallet ile bağlan ve 
                <span style={{ color: "#00ff88", fontWeight: "bold" }}> Stellar Bomb</span> oyununu başlat!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
);
}
export default App;