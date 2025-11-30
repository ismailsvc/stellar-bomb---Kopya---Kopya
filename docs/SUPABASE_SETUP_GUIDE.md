# 📊 Supabase'ye Reklamlar Kaydı - Talimatlar

## Adım 1: Supabase Dashboard'ta Tables Oluştur

1. **Supabase.com** adresine git → Proje Paneline gir
2. **SQL Editor** > **New Query** tıkla
3. Aşağıdaki SQL'i kopyala (supabase_setup.sql dosyasında):
   - İlk olarak `tables` ve `indexes` oluştur
   - `ALTER TABLE` komutları ve RLS ayarlarını çalıştır

```sql
-- supabase_setup.sql dosyasındaki tüm CREATE TABLE komutlarını çalıştır
```

## Adım 2: Örnek Reklamları Ekle

1. **SQL Editor** > **New Query** tıkla
2. **SUPABASE_INSERT_ADS.sql** dosyasının içeriğini kopyala
3. Yapıştır ve **RUN** tıkla

Çıktı:
```
id           | title                                    | sponsor_name | priority | active
-------------|------------------------------------------|--------------|----------|--------
ad-stellar   | Stellar Network - Blockchain Devriminde  | SDF          | high     | true
ad-freighter | Freighter Wallet - Stellar İçin          | Stellar Comm | high     | true
ad-tournament| Stellar Bomb Turnuvası - 100 XLM Ödül    | Stellar Bomb | medium   | true
```

## Adım 3: RLS Policies Kontrol Et

- `advertisements` tablosu: Herkese **PUBLIC READ** izni
- `ad_analytics` tablosu: Herkese **PUBLIC READ** izni

```sql
-- supabase_setup.sql sonunda bu policies var - onları da çalıştır
CREATE POLICY "Allow anyone to view advertisements" ON advertisements FOR SELECT USING (true);
CREATE POLICY "Allow anyone to view ad_analytics" ON ad_analytics FOR SELECT USING (true);
```

## Adım 4: Environment Variables Kontrol Et

`.env.local` dosyasında bu variables olmalı:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Adım 5: Uygulamayı Test Et

1. **npm run dev** ile uygulamayı başlat
2. Anasayfaya gir
3. Sayfayı yenile (F5)
4. Browser console'da (F12) kontrol et:
   - ✅ `Supabase configured - Cloud features enabled`
   - ✅ `Loaded 3 advertisements` (veya daha fazla)

5. Sayfada reklamları görmek için yenile (AdBanner'lar gözükür):
   - 📢 Header banner (üst)
   - 🔍 Sidebar spotlight (sidebar)
   - 🏆 Leaderboard banner (sıralama sayfası)

## Adım 6: Admin Paneli Test Et

1. **Freighter Wallet** ile bağlan
2. Wallet adresi şu olmalı: `GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA`
3. Menüde ⚙️ **Admin** butonu görünür
4. Admin Panel'de:
   - 📢 Reklamları görebilirsin (toggle, delete)
   - 📊 Analytics sekmesi (toplam gösterim/tıklama)
   - 👥 Users sekmesi (yakında)

## 📝 Dosyalar Nereye?

- **supabase_setup.sql** - Tüm tablo ve schema tanımları
- **SUPABASE_INSERT_ADS.sql** - Örnek 3 reklam ekleme
- **src/config/ads.config.ts** - Frontend reklam konfigürasyonu
- **src/services/adManager.ts** - Reklam yönetim servisi
- **src/shared/components/AdBanner.tsx** - Reklam görüntüleme componenti
- **src/config/admin.config.ts** - Admin konfigürasyonu
- **src/shared/components/AdminPanel.tsx** - Admin Panel UI

## ⚠️ Önemli Notlar

- Admin wallet: `GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA`
- Reklamlar **localStorage**'da de cacheleniyor (offline mode)
- Analytics **otomatik olarak** kaydediliyor (impression/click)
- CTR (Click-Through Rate) otomatik hesaplanıyor

## 🎯 Sonuç

✅ Supabase tablolarını oluşturdun  
✅ Örnek reklamları ekledin  
✅ Admin panel aktif  
✅ Reklamlar sayfada görünüyor  
✅ Analytics takip ediliyor
