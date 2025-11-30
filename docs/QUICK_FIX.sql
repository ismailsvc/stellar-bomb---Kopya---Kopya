-- HIZLI FİKS: Points sütununu ekle
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Views'i yeniden oluştur
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

-- ✅ Tamam!
