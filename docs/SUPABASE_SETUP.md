# 🚀 Stellar Bomb - Supabase Setup Guide

Bu rehber Stellar Bomb oyununun Supabase backend'ini ayarlamak için adım adım talimatlar sağlar.

---

## 📋 İçindekiler

1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Supabase Projesi Oluşturma](#supabase-projesi-oluşturma)
3. [Tabloları Ayarlama](#tabloları-ayarlama)
4. [Environment Variables](#environment-variables)
5. [Veri Yapısı](#veri-yapısı)
6. [RLS Politikaları](#rls-politikaları)
7. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Hızlı Başlangıç

### 1️⃣ Supabase Projesi Oluştur

```bash
# Supabase dashboard'a git: https://supabase.com
# 1. Sign Up / Login yap
# 2. "New Project" tıkla
# 3. Şu bilgileri gir:
#    - Name: "stellar-bomb"
#    - Database Password: Güvenli bir şifre
#    - Region: İstediğin bölgeyi seç (yakındaki bölge latency azaltır)
# 4. "Create new project" tıkla
# 5. Proje yaratılana kadar bekle (3-5 dakika)
```

### 2️⃣ SQL Kodunu Çalıştır

```bash
# Supabase Dashboard'da:
# 1. Sol taraftaki "SQL Editor" tıkla
# 2. "New Query" tıkla
# 3. supabase_setup.sql dosyasının içeriğini kopyala
# 4. Query editor'e yapıştır
# 5. "RUN" tıkla (sağ üstte)
# ✅ Tamamlandı!
```

### 3️⃣ Environment Variables Ayarla

```bash
# .env.local dosyasını oluştur (proje kökünde)

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Değerleri bulmak:
# 1. Supabase Dashboard → Project Settings → API
# 2. "Project URL" → VITE_SUPABASE_URL
# 3. "anon" key → VITE_SUPABASE_ANON_KEY
```

### 4️⃣ Uygulamayı Çalıştır

```bash
npm run dev
# Website: http://localhost:5173
```

---

## 🏗️ Supabase Projesi Oluşturma

### Adım 1: Supabase Hesabı Oluştur

1. https://supabase.com adresine git
2. "Start your project" tıkla
3. GitHub ile Sign Up et (veya Email)
4. Email doğrulaması yap

### Adım 2: Yeni Proje Oluştur

```
Dashboard → "New Project" düğmesi
├─ Name: stellar-bomb
├─ Database Password: MySecurePassword123!
├─ Region: Frankfurt (or nearest to you)
└─ "Create new project"
```

### Adım 3: Proje Ayarlarını Kopyala

```
1. Project Settings (sol altta ayar simgesi)
2. API tab
3. Şu değerleri kopyala:
   - Project URL
   - Anon (public) Key
   - Service Role Key
```

---

## 📊 Tabloları Ayarlama

### Supabase'de SQL Kodunu Çalıştır

```bash
# 1. Supabase Dashboard açı
# 2. "SQL Editor" → "New Query"
# 3. supabase_setup.sql dosyasındaki tüm kodu kopyala
# 4. Paste et
# 5. "RUN" tıkla
```

### Oluşturulacak Tablolar

| Tablo | Amaç | Ana Sütunlar |
|-------|------|--------------|
| **user_profiles** | Kullanıcı profilleri | wallet_address, username, avatar, bio, level |
| **leaderboard** | Oyun skorları | wallet_address, puzzle_title, difficulty, points |
| **multiplayer_matches** | 1v1 maçları | match_code, player1_wallet, player2_wallet, status |
| **avatar_purchases** | Avatar alımları | wallet_address, avatar_emoji, transaction_hash |

---

## 🔐 Environment Variables

### .env.local Dosyası Oluştur

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Stellar Network (Test)
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_SERVER=https://horizon-testnet.stellar.org
```

### Değerleri Nerede Bulacağını?

```
Supabase Dashboard
└─ Project Settings (sol altta)
   └─ API tab
      ├─ Project URL → VITE_SUPABASE_URL
      ├─ Anon (public) Key → VITE_SUPABASE_ANON_KEY
      └─ Service Role Key → (Backend kullanımı için)
```

---

## 📋 Veri Yapısı

### 1. user_profiles Tablosu

```sql
CREATE TABLE user_profiles (
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
```

**Açıklama:**
- `wallet_address`: Stellar cüzdan adresi (benzersiz)
- `username`: Oyuncu adı
- `avatar`: Seçilen emoji (👨‍💻, 🤖, vb.)
- `photo_url`: Base64 encoded profil fotoğrafı
- `bio`: Kullanıcı biyografisi
- `level`: Oyuncu seviyesi (future use)

---

### 2. leaderboard Tablosu

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  username TEXT NOT NULL,
  puzzle_title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  remaining_time INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Açıklama:**
- `id`: Benzersiz skor ID
- `wallet_address`: Oyuncunun cüzdan adresi
- `puzzle_title`: Çözdüğü bulmacının adı
- `difficulty`: Zorluk seviyesi (easy=1pt, medium=2pts, hard=3pts)
- `points`: Kazanılan puanlar
- `remaining_time`: Çözüm zamanı (saniye cinsinden)

**Önemli Indexler:**
```sql
CREATE INDEX idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX idx_leaderboard_difficulty ON leaderboard(difficulty);
CREATE INDEX idx_leaderboard_wallet ON leaderboard(wallet_address);
```

---

### 3. multiplayer_matches Tablosu

```sql
CREATE TABLE multiplayer_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_code TEXT NOT NULL UNIQUE,
  puzzle_id TEXT NOT NULL,
  puzzle_title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  player1_wallet TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  player1_username TEXT,
  player2_wallet TEXT REFERENCES user_profiles(wallet_address),
  player2_username TEXT,
  player1_solved BOOLEAN DEFAULT FALSE,
  player1_time INTEGER,
  player2_solved BOOLEAN DEFAULT FALSE,
  player2_time INTEGER,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Statüsler:**
- `waiting`: İkinci oyuncu bekleniyor
- `in_progress`: Her iki oyuncu da hazır, oyun başladı
- `completed`: Oyun tamamlandı

---

### 4. avatar_purchases Tablosu

```sql
CREATE TABLE avatar_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL REFERENCES user_profiles(wallet_address),
  avatar_emoji TEXT NOT NULL,
  avatar_name TEXT NOT NULL,
  cost_xlm DECIMAL NOT NULL,
  transaction_hash TEXT NOT NULL UNIQUE,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 RLS Politikaları

### Genel İlke

```sql
-- Kullanıcılar sadece kendi verilerine erişim
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see all profiles (public)"
ON user_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = wallet_address);

CREATE POLICY "Users can insert their profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = wallet_address);
```

### Leaderboard Politikaları

```sql
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Herkesi okumaya izin ver (public leaderboard)
CREATE POLICY "Anyone can view leaderboard"
ON leaderboard FOR SELECT
USING (true);

-- Sadece kendi skorlarını ekle
CREATE POLICY "Users can insert their scores"
ON leaderboard FOR INSERT
WITH CHECK (auth.uid() = wallet_address);
```

---

## 🐛 Sorun Giderme

### Problem: "RLS policy error" veya "403 Forbidden"

**Çözüm:**
```sql
-- Tüm tablolarda RLS'yi devre dışı bırak (Development)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard DISABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_purchases DISABLE ROW LEVEL SECURITY;

-- Production için: Uygun RLS politikaları yazın
```

### Problem: "Connection refused" veya "Network error"

**Çözüm:**
```bash
# 1. .env.local dosyasını kontrol et
# 2. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY doğru mu?
# 3. URL'de "supabase.co" var mı?
# 4. Projenin status'u "Active" mı?

# Supabase Status: https://status.supabase.com
```

### Problem: "Column 'points' does not exist"

**Çözüm:**
```sql
-- Mevcut tabloyu güncelle
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(points DESC);
```

### Problem: Türkçe karakterler bozuk görünüyor

**Çözüm:**
```sql
-- Veritabanını UTF-8 olarak ayarla
-- Supabase varsayılan olarak UTF-8 kullanır, sorun yoktur
-- Eğer problem devam ederse:
SELECT pg_database.datname, pg_encoding_to_char(pg_database.encoding) 
FROM pg_database 
WHERE datname = 'postgres';
```

---

## 🔄 Veri Senkronizasyonu

### Local vs Cloud

**Local Storage** (Browser):
- Çabuk erişim
- Offline çalışma
- Yalnız 20 skor kaydı (sınırlı)

**Supabase** (Cloud):
- Sınırsız veri
- Global leaderboard
- Çoklu cihaz senkronizasyonu

### Senkronizasyon Akışı

```
Oyun Çözüldü
    ↓
saveScore() → Local Storage + Supabase
    ↓
loadGlobalLeaderboard() → Supabase'den oku
    ↓
Leaderboard'ı Göster (Cloud + Local)
```

---

## 📱 Monthly Rewards Sistemi

### Mekanizma

**Her ayın 1. Günü:**
- 🔴 Zor: 500 XLM
- 🟡 Orta: 250 XLM
- 🟢 Kolay: 125 XLM

### Future Enhancement

```sql
-- Ödülleri saklamak için tablo
CREATE TABLE monthly_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  difficulty TEXT NOT NULL,
  rank INTEGER NOT NULL,
  wallet_address TEXT REFERENCES user_profiles(wallet_address),
  reward_xlm DECIMAL NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP
);
```

---

## 🚀 Production Deployment

### Checklist

- [ ] RLS Politikaları ayarlandı
- [ ] API Keys secure olarak depolandı
- [ ] Database backups yapılandırıldı
- [ ] CORS ayarları yapılandırıldı
- [ ] Rate limiting ayarlandı
- [ ] Monitoring etkinleştirildi

---

## 📞 Destek & Kaynaklar

### Resmi Linkler

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Stellar Docs: https://developers.stellar.org

### Yaygın Konfigürasyonlar

```env
# Development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## ✅ Kontrol Listesi

Kurulumu başlatan kişi şu adımları takip etsin:

- [ ] Supabase hesabı oluşturdum
- [ ] Yeni proje oluşturdum
- [ ] SQL kodunu çalıştırdım
- [ ] .env.local dosyası oluşturdum
- [ ] Environment variables'ı kopyaladım
- [ ] `npm run dev` çalıştırdım
- [ ] Leaderboard açılıyor (http://localhost:5173)
- [ ] Profil sayfasında puanlar görünüyor

---

**Son güncelleme:** November 30, 2025
**Oyun Versiyonu:** v1.2 (Points System Active)
