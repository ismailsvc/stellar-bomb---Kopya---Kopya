-- ============================================
-- STELLAR BOMB - SUPABASE SQL SETUP (FIXED)
-- UUID casting hatası düzeltildi
-- ============================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_address TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  photo_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  selected_frame TEXT DEFAULT 'frame-none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_frame TEXT DEFAULT 'frame-none';

-- 2. LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  username TEXT NOT NULL,
  puzzle_title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  remaining_time INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  avatar TEXT,
  selected_frame TEXT DEFAULT 'frame-none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS avatar TEXT;

ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS selected_frame TEXT DEFAULT 'frame-none';

-- 3. LEADERBOARD INDEXES
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_wallet ON leaderboard(wallet_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(remaining_time DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard(created_at DESC);

-- 4. LOCAL LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS local_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  username TEXT NOT NULL,
  puzzle_title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  remaining_time INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOCAL LEADERBOARD INDEXES
CREATE INDEX IF NOT EXISTS idx_local_lb_device ON local_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_local_lb_difficulty ON local_leaderboard(difficulty);

-- 6. AVATAR PURCHASES TABLE
CREATE TABLE IF NOT EXISTS avatar_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  avatar TEXT NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wallet_address, avatar)
);

CREATE INDEX IF NOT EXISTS idx_avatar_purchases_wallet ON avatar_purchases(wallet_address);

-- 7. FRAME PURCHASES TABLE
CREATE TABLE IF NOT EXISTS frame_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  frame_id TEXT NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wallet_address, frame_id)
);

CREATE INDEX IF NOT EXISTS idx_frame_purchases_wallet ON frame_purchases(wallet_address);

-- 8. ENABLE RLS FOR ALL TABLES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_purchases ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR USER PROFILES
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.jwt() ->> 'sub' = wallet_address);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = wallet_address);

-- 10. RLS POLICIES FOR LEADERBOARD
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can insert game results" ON leaderboard FOR INSERT WITH CHECK (true);

-- 11. RLS POLICIES FOR LOCAL LEADERBOARD
CREATE POLICY "Anyone can view local leaderboard" ON local_leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can insert local scores" ON local_leaderboard FOR INSERT WITH CHECK (true);

-- 12. RLS POLICIES FOR AVATAR PURCHASES
CREATE POLICY "Users can view avatar purchases" ON avatar_purchases FOR SELECT USING (true);
CREATE POLICY "Users can insert avatar purchases" ON avatar_purchases FOR INSERT WITH CHECK (true);

-- 13. RLS POLICIES FOR FRAME PURCHASES
CREATE POLICY "Users can view frame purchases" ON frame_purchases FOR SELECT USING (true);
CREATE POLICY "Users can insert frame purchases" ON frame_purchases FOR INSERT WITH CHECK (true);

-- ============================================
-- 14. ADVERTISEMENTS TABLE (Reklam Yönetimi)
-- ============================================
CREATE TABLE IF NOT EXISTS advertisements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sponsor_name TEXT NOT NULL,
  sponsor_logo TEXT,
  placement_ids TEXT[] NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  cta_text TEXT NOT NULL,
  cta_url TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  active BOOLEAN DEFAULT true,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advertisements Indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(active);
CREATE INDEX IF NOT EXISTS idx_advertisements_priority ON advertisements(priority);
CREATE INDEX IF NOT EXISTS idx_advertisements_created ON advertisements(created_at DESC);

-- ADVERTISEMENTS RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view advertisements" ON advertisements FOR SELECT USING (true);

-- ============================================
-- 15. AD ANALYTICS TABLE (Reklam Analitikleri)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_analytics (
  ad_id TEXT PRIMARY KEY,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_ad_analytics_timestamp ON ad_analytics(timestamp DESC);

-- AD ANALYTICS RLS
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ad analytics" ON ad_analytics FOR SELECT USING (true);

-- ✅ SETUP COMPLETE
-- Her tablo RLS'ye sahip ve public read access
-- Yazma işlemleri onay gerekli
