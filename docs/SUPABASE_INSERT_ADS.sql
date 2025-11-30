-- ============================================
-- STELLAR BOMB - DEFAULT ADVERTISEMENTS
-- Supabase'ye eklenecek örnek reklamlar
-- ============================================
-- Bu SQL'i Supabase Dashboard'ta çalıştırın
-- SQL Editor > New Query > Aşağıdaki SQL'i kopyalayıp yapıştırın > Çalıştırın

-- Mevcut reklamları temizle (opsiyonel - ilk çalıştırmada açın)
-- DELETE FROM advertisements;
-- DELETE FROM ad_analytics;

-- 1. STELLAR REKLAMI
INSERT INTO advertisements (
  id, 
  title, 
  description, 
  image_url, 
  sponsor_name, 
  sponsor_logo, 
  placement_ids, 
  start_date, 
  end_date, 
  cta_text, 
  cta_url, 
  priority, 
  active, 
  impressions, 
  clicks
) VALUES (
  'ad-stellar-2025',
  'Stellar Network - Blockchain Devriminde Katılın',
  'Hızlı, güvenli ve küresel ödeme ağı. Stellar ile finansal kapsayıcılığı mümkün kılın.',
  'https://stellar.org/assets/img/logo-stellar.png',
  'Stellar Development Foundation',
  'https://stellar.org/assets/img/logo-stellar-mark.png',
  ARRAY['header-banner', 'sidebar-spotlight', 'leaderboard-banner'],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '90 days',
  'Stellar\'ı Keşfet',
  'https://stellar.org',
  'high',
  true,
  0,
  0
) ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- 2. FREIGHTER REKLAMI
INSERT INTO advertisements (
  id, 
  title, 
  description, 
  image_url, 
  sponsor_name, 
  sponsor_logo, 
  placement_ids, 
  start_date, 
  end_date, 
  cta_text, 
  cta_url, 
  priority, 
  active, 
  impressions, 
  clicks
) VALUES (
  'ad-freighter-2025',
  'Freighter Wallet - Stellar İçin En İyi Cüzdan',
  'Güvenli, hızlı ve kullanıcı dostu Stellar cüzdanı. Dapp\'lar ile sorunsuz entegrasyon.',
  'https://freighter.app/assets/logo.png',
  'Stellar Community',
  'https://freighter.app/assets/logo-mark.png',
  ARRAY['header-banner', 'sidebar-spotlight', 'game-complete-modal'],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '60 days',
  'Freighter\'ı İndir',
  'https://freighter.app',
  'high',
  true,
  0,
  0
) ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- 3. TOURNAMENT REKLAMI
INSERT INTO advertisements (
  id, 
  title, 
  description, 
  image_url, 
  sponsor_name, 
  sponsor_logo, 
  placement_ids, 
  start_date, 
  end_date, 
  cta_text, 
  cta_url, 
  priority, 
  active, 
  impressions, 
  clicks
) VALUES (
  'ad-tournament-2025',
  'Stellar Bomb Turnuvası - 100 XLM Ödül Havuzu',
  'Haftaüzerinde yapılan turnuvalara katılın ve gerçek XLM kazanın!',
  'https://stellar-bomb.app/assets/tournament-banner.png',
  'Stellar Bomb',
  'https://stellar-bomb.app/assets/logo.png',
  ARRAY['leaderboard-banner', 'event-notification'],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  'Turnuvaya Katıl',
  'https://stellar-bomb.app/tournament',
  'medium',
  true,
  0,
  0
) ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- ✅ BAŞARILI - 3 örnek reklam Supabase'ye kaydedildi
-- Analytics tablosuna da entri ekle (opsiyonel)

INSERT INTO ad_analytics (ad_id, impressions, clicks, ctr) VALUES
  ('ad-stellar-2025', 0, 0, 0),
  ('ad-freighter-2025', 0, 0, 0),
  ('ad-tournament-2025', 0, 0, 0)
ON CONFLICT (ad_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Doğrulama: Eklenen reklamları göster
SELECT id, title, sponsor_name, priority, active FROM advertisements ORDER BY created_at DESC;
