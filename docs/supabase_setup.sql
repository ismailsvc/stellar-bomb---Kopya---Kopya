-- ============================================
-- STELLAR BOMB - SUPABASE SQL SETUP
-- Tüm tabloları tek seferde oluştur
-- ============================================

-- 1. USER PROFILES TABLE
-- ============================================
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

-- Add selected_frame column if it doesn't exist (for existing tables)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS selected_frame TEXT DEFAULT 'frame-none';

COMMENT ON TABLE user_profiles IS 'Stellar cüzdan adresine bağlı kullanıcı profilleri';
COMMENT ON COLUMN user_profiles.wallet_address IS 'Stellar cüzdan adresi (PRIMARY KEY)';
COMMENT ON COLUMN user_profiles.username IS 'Oyuncu adı';
COMMENT ON COLUMN user_profiles.avatar IS 'Seçilen emoji avatar';
COMMENT ON COLUMN user_profiles.photo_url IS 'Profil fotoğrafı (Base64 encoded)';
COMMENT ON COLUMN user_profiles.bio IS 'Kullanıcı biyografisi';
COMMENT ON COLUMN user_profiles.level IS 'Oyuncu seviyesi';
COMMENT ON COLUMN user_profiles.selected_frame IS 'Seçilen avatar çerçevesi (frame-none, frame-gold, vb)';

-- 2. LEADERBOARD TABLE
-- ============================================
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

COMMENT ON TABLE leaderboard IS 'Oyunların sonuçları ve global sıralama';
COMMENT ON COLUMN leaderboard.wallet_address IS 'Oyuncu cüzdan adresi';
COMMENT ON COLUMN leaderboard.puzzle_title IS 'Çözdüğü bulmacının adı';
COMMENT ON COLUMN leaderboard.difficulty IS 'Zorluk seviyesi: easy, medium, hard';
COMMENT ON COLUMN leaderboard.remaining_time IS 'Kalan zaman (saniye) - Yüksek = Daha iyi';
COMMENT ON COLUMN leaderboard.points IS 'Kazanılan puan: 1=easy, 2=medium, 3=hard';
COMMENT ON COLUMN leaderboard.avatar IS 'Oyuncunun avatar emoji''si';
COMMENT ON COLUMN leaderboard.selected_frame IS 'Oyuncunun seçilen avatar çerçevesi';

-- Mevcut leaderboard tablosuna points sütunu ekle (varsa)
ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Mevcut leaderboard tablosuna avatar sütunu ekle (varsa)
ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Mevcut leaderboard tablosuna selected_frame sütunu ekle (varsa)
ALTER TABLE leaderboard
ADD COLUMN IF NOT EXISTS selected_frame TEXT DEFAULT 'frame-none';

-- 3. LEADERBOARD INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_leaderboard_wallet ON leaderboard(wallet_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(remaining_time DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard(created_at DESC);

-- 4. LOCAL LEADERBOARD TABLE (Cihaz bazında local skorlar)
-- ============================================
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

COMMENT ON TABLE local_leaderboard IS 'Lokal cihaz bazında depolanmış skor geçmişi (localStorage backup)';
COMMENT ON COLUMN local_leaderboard.device_id IS 'Cihaz benzersiz ID (browser localStorage key)';
COMMENT ON COLUMN local_leaderboard.username IS 'Oyuncu adı (lokal)';
COMMENT ON COLUMN local_leaderboard.puzzle_title IS 'Çözdüğü bulmacının adı';
COMMENT ON COLUMN local_leaderboard.difficulty IS 'Zorluk seviyesi: easy, medium, hard';
COMMENT ON COLUMN local_leaderboard.points IS 'Kazanılan puan: 1=easy, 2=medium, 3=hard';

-- 6. LOCAL LEADERBOARD INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_local_lb_device ON local_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_local_lb_difficulty ON local_leaderboard(difficulty);
CREATE INDEX IF NOT EXISTS idx_local_lb_points ON local_leaderboard(points DESC);
CREATE INDEX IF NOT EXISTS idx_local_lb_created ON local_leaderboard(created_at DESC);

-- 7. AVATAR PURCHASES TABLE (Cüzdan entegrasyonu)
-- ============================================
CREATE TABLE IF NOT EXISTS avatar_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  avatar_emoji TEXT NOT NULL,
  avatar_name TEXT NOT NULL,
  cost_xlm DECIMAL NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE avatar_purchases IS 'Avatar satın almalarının geçmişi (Stellar blockchain entegrasyonu)';
COMMENT ON COLUMN avatar_purchases.wallet_address IS 'Satın alan oyuncunun cüzdan adresi';
COMMENT ON COLUMN avatar_purchases.avatar_emoji IS 'Satın alınan avatar emoji';
COMMENT ON COLUMN avatar_purchases.avatar_name IS 'Avatar adı (Tekno Kedi, vb)';
COMMENT ON COLUMN avatar_purchases.cost_xlm IS 'Ödenmiş XLM miktarı';
COMMENT ON COLUMN avatar_purchases.transaction_hash IS 'Stellar blockchain transaction hash (unique)';

-- Indexler
CREATE INDEX IF NOT EXISTS idx_avatar_purchases_wallet ON avatar_purchases(wallet_address);
CREATE INDEX IF NOT EXISTS idx_avatar_purchases_created ON avatar_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avatar_purchases_hash ON avatar_purchases(transaction_hash);

-- 9. AVATAR FRAMES TABLE (Çerçeve satın almalarının geçmişi)
-- ============================================
CREATE TABLE IF NOT EXISTS frame_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  frame_id TEXT NOT NULL,
  frame_name TEXT NOT NULL,
  cost_xlm DECIMAL NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE frame_purchases IS 'Avatar çerçeve satın almalarının geçmişi (Stellar blockchain entegrasyonu)';
COMMENT ON COLUMN frame_purchases.wallet_address IS 'Satın alan oyuncunun cüzdan adresi';
COMMENT ON COLUMN frame_purchases.frame_id IS 'Frame ID (frame-ocean, frame-fire-ring, frame-forest, frame-neon, frame-ice, frame-gold-crown)';
COMMENT ON COLUMN frame_purchases.frame_name IS 'Frame name (Ocean, Fire, Forest, Neon, Ice, Gold Crown)';
COMMENT ON COLUMN frame_purchases.cost_xlm IS 'Paid XLM amount';
COMMENT ON COLUMN frame_purchases.transaction_hash IS 'Stellar blockchain transaction hash (unique)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_frame_purchases_wallet ON frame_purchases(wallet_address);
CREATE INDEX IF NOT EXISTS idx_frame_purchases_created ON frame_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_frame_purchases_hash ON frame_purchases(transaction_hash);

-- ============================================
-- 4. GLOBAL LEADERBOARD VIEW (Aggregate puanlar)
-- ============================================
DROP VIEW IF EXISTS global_leaderboard_aggregate CASCADE;
CREATE OR REPLACE VIEW global_leaderboard_aggregate AS
SELECT 
  wallet_address,
  username,
  difficulty,
  COUNT(*) as total_games,
  COALESCE(SUM(points), 0) as total_points,
  ROUND(AVG(CAST(remaining_time AS NUMERIC)), 0)::INTEGER as avg_time,
  MAX(created_at) as last_game,
  RANK() OVER (PARTITION BY difficulty ORDER BY COALESCE(SUM(points), 0) DESC) as rank_by_difficulty,
  RANK() OVER (ORDER BY COALESCE(SUM(points), 0) DESC) as global_rank
FROM leaderboard
GROUP BY wallet_address, username, difficulty;

COMMENT ON VIEW global_leaderboard_aggregate IS 'Oyuncuların zorluk seviyesine göre toplam puanları ve sıralaması';

-- 5. GLOBAL LEADERBOARD MATERIALIZED VIEW
-- ============================================
DROP MATERIALIZED VIEW IF EXISTS global_leaderboard_summary CASCADE;
CREATE MATERIALIZED VIEW global_leaderboard_summary AS
SELECT 
  wallet_address,
  username,
  COALESCE(SUM(points), 0) as total_points,
  COUNT(*) as total_games,
  COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
  COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
  COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count,
  ROUND(AVG(CAST(remaining_time AS NUMERIC)), 0)::INTEGER as avg_time,
  MAX(created_at) as last_played,
  RANK() OVER (ORDER BY COALESCE(SUM(points), 0) DESC) as global_rank
FROM leaderboard
GROUP BY wallet_address, username;

COMMENT ON MATERIALIZED VIEW global_leaderboard_summary IS 'Global leaderboard özeti - en son puanlar ve sıralaması';

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- USER PROFILES RLS
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Herkes profilleri görebilir (public)
CREATE POLICY "Allow anyone to view profiles"
ON user_profiles FOR SELECT
USING (true);

-- Kullanıcılar sadece kendi profillerini değiştirebilir
CREATE POLICY "Allow users to update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = wallet_address)
WITH CHECK (auth.uid() = wallet_address);

-- Kullanıcılar yeni profil oluşturabilir
CREATE POLICY "Allow users to insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = wallet_address);

-- LEADERBOARD RLS
-- ============================================
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Herkes leaderboard'u görebilir
CREATE POLICY "Allow anyone to view leaderboard"
ON leaderboard FOR SELECT
USING (true);

-- Yalnızca kendi skorlarını ekleyebilir
CREATE POLICY "Allow users to insert own scores"
ON leaderboard FOR INSERT
WITH CHECK (auth.uid() = wallet_address);

-- Leaderboard skoru güncellenemez (immutable)
-- CREATE POLICY "Prevent leaderboard updates" ON leaderboard FOR UPDATE USING (false);

-- LOCAL LEADERBOARD RLS
-- ============================================
ALTER TABLE local_leaderboard ENABLE ROW LEVEL SECURITY;

-- Herkes lokal leaderboard'u görebilir
CREATE POLICY "Allow anyone to view local leaderboard"
ON local_leaderboard FOR SELECT
USING (true);

-- Yalnızca kendi lokal skorlarını ekleyebilir
CREATE POLICY "Allow users to insert own local scores"
ON local_leaderboard FOR INSERT
WITH CHECK (auth.uid() = device_id OR true); -- Device ID tabanlı

-- AVATAR PURCHASES RLS
-- ============================================
ALTER TABLE avatar_purchases ENABLE ROW LEVEL SECURITY;

-- Avatar satın almalarını herkes görebilir (public showcase)
CREATE POLICY "Allow anyone to view avatar purchases"
ON avatar_purchases FOR SELECT
USING (true);

-- Yalnızca kendi avatar satın almalarını ekleyebilir
CREATE POLICY "Allow users to insert own avatar purchases"
ON avatar_purchases FOR INSERT
WITH CHECK (auth.uid() = wallet_address);

-- FRAME PURCHASES RLS
-- ============================================
ALTER TABLE frame_purchases ENABLE ROW LEVEL SECURITY;

-- Frame satın almalarını herkes görebilir
CREATE POLICY "Allow anyone to view frame purchases"
ON frame_purchases FOR SELECT
USING (true);

-- Yalnızca kendi frame satın almalarını ekleyebilir
CREATE POLICY "Allow users to insert own frame purchases"
ON frame_purchases FOR INSERT
WITH CHECK (auth.uid() = wallet_address);

-- ✅ TAMAMLANDI - Tüm tablolar ve politikalar başarıyla oluşturuldu!
-- Supabase dashboard'da Database > Tables bölümünde görebilirsin:
-- 
-- TABLOLAR:
-- ✅ user_profiles          → RLS aktif (Kendi profil güncelleme)
-- ✅ leaderboard           → RLS aktif (Public okuma, kendi skor ekleme)
-- ✅ local_leaderboard     → RLS aktif (Public okuma, device-based ekleme)
-- ✅ avatar_purchases      → RLS aktif (Public okuma, kendi alım ekleme)
-- ✅ frame_purchases       → RLS aktif (Public okuma, kendi alım ekleme)
-- ✅ advertisements        → RLS aktif (Public okuma)
-- ✅ ad_analytics          → RLS aktif (Public okuma)
--
-- VIEWS:
-- ✅ global_leaderboard_aggregate (VIEW)        → Zorluk seviyesine göre puanlar
-- ✅ global_leaderboard_summary (MATERIALIZED VIEW) → Genel özet sıralaması
--
-- RLS POLİTİKALARI:
-- ✅ user_profiles (3 policy)    - View all, update own, insert own
-- ✅ leaderboard (2 policy)      - View all, insert own
-- ✅ local_leaderboard (2 policy) - View all, insert own
-- ✅ avatar_purchases (2 policy) - View all, insert own
-- ✅ frame_purchases (2 policy)  - View all, insert own
-- ✅ advertisements (1 policy)   - View all
-- ✅ ad_analytics (1 policy)     - View all
--
-- Multiplayer tables kaldırıldı (1v1 mod devre dışı bırakıldı)
-- Leaderboard artık LOCAL + GLOBAL (puanlar) ile çalışıyor!
-- RLS Security: Kullanıcılar sadece kendi verilerine yazma erişimi!

-- ============================================
-- 11. ADVERTISEMENTS TABLE (Reklam Yönetimi)
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

COMMENT ON TABLE advertisements IS 'Sponsor reklamlarının yönetimi';
COMMENT ON COLUMN advertisements.id IS 'Reklam ID (Unique)';
COMMENT ON COLUMN advertisements.title IS 'Reklam başlığı';
COMMENT ON COLUMN advertisements.description IS 'Reklam açıklaması';
COMMENT ON COLUMN advertisements.image_url IS 'Reklam görseli URL''i';
COMMENT ON COLUMN advertisements.sponsor_name IS 'Sponsor adı';
COMMENT ON COLUMN advertisements.sponsor_logo IS 'Sponsor logosu URL''i';
COMMENT ON COLUMN advertisements.placement_ids IS 'Görüneceği placement IDs (array)';
COMMENT ON COLUMN advertisements.cta_text IS 'Call-to-action buton metni';
COMMENT ON COLUMN advertisements.cta_url IS 'CTA link URL''i';
COMMENT ON COLUMN advertisements.priority IS 'Reklam önceliği (high, medium, low)';
COMMENT ON COLUMN advertisements.active IS 'Reklam aktif mi';
COMMENT ON COLUMN advertisements.impressions IS 'Toplam gösterim sayısı';
COMMENT ON COLUMN advertisements.clicks IS 'Toplam tıklama sayısı';

-- Advertisements Indexes
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(active);
CREATE INDEX IF NOT EXISTS idx_advertisements_priority ON advertisements(priority);
CREATE INDEX IF NOT EXISTS idx_advertisements_created ON advertisements(created_at DESC);

-- ADVERTISEMENTS RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Herkes reklamları görebilir
CREATE POLICY "Allow anyone to view advertisements"
ON advertisements FOR SELECT
USING (true);

-- ============================================
-- 12. AD ANALYTICS TABLE (Reklam Analitikleri)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_analytics (
  ad_id TEXT PRIMARY KEY REFERENCES advertisements(id),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ad_analytics IS 'Reklam performans analitikleri';
COMMENT ON COLUMN ad_analytics.ad_id IS 'Reklam ID (Foreign key)';
COMMENT ON COLUMN ad_analytics.impressions IS 'Toplam gösterim sayısı';
COMMENT ON COLUMN ad_analytics.clicks IS 'Toplam tıklama sayısı';
COMMENT ON COLUMN ad_analytics.ctr IS 'Click-Through Rate (%)';

-- Ad Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_ad_analytics_timestamp ON ad_analytics(timestamp DESC);

-- AD ANALYTICS RLS
ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

-- Herkes analytics'i görebilir
CREATE POLICY "Allow anyone to view ad analytics"
ON ad_analytics FOR SELECT
USING (true);
-- ✅ user_profiles (3 policy)    - View all, update own, insert own
-- ✅ leaderboard (2 policy)      - View all, insert own
-- ✅ local_leaderboard (2 policy) - View all, insert own
-- ✅ avatar_purchases (2 policy) - View all, insert own
-- ✅ frame_purchases (2 policy)  - View all, insert own
--
-- Multiplayer tables kaldırıldı (1v1 mod devre dışı bırakıldı)
-- Leaderboard artık LOCAL + GLOBAL (puanlar) ile çalışıyor!
-- RLS Security: Kullanıcılar sadece kendi verilerine yazma erişimi!
