# 🎮 ADMIN PANEL KULLANIMI - QUICK GUIDE

## Admin Panel'e Nasıl Erişilir?

### Adım 1: Freighter Wallet ile Bağlan
1. Browser'da **F12** tıkla (Developer Tools aç)
2. Console'da "Freighter Wallet bağlandı" mesajı görmelisin
3. Wallet adresin şu olmalı:
   ```
   GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA
   ```

### Adım 2: Admin Butonunu Bul
1. Sayfanın sağ üstüne bak
2. Menu'de **⚙️ Admin** butonu görünmelidir
3. Eğer görünmüyorsa:
   - Wallet adresi yanlış olabilir
   - Browser console'da hata var mı kontrol et

### Adım 3: Admin Panel'e Gir
1. **⚙️ Admin** butonuna tıkla
2. Admin panel açılır

## 📢 REKLAMLAR SEKMESİ

### Görebileceğin Bilgiler:
- **Reklam Başlığı** - Reklam adı
- **Sponsor** - Sponsor adı (ör: Stellar, Freighter)
- **Öncelik** - ⭐ Yüksek / ✨ Orta / • Düşük
- **Durum** - 🟢 Aktif / 🔴 Pasif
- **Analitikler**:
  - 👁️ Gösterimler (kaç kez görüldü)
  - 👆 Tıklamalar (kaç kez tıklandı)
  - 📊 CTR (Click-Through Rate %)

### Yapabileceklerin:
1. **🟢 Aktif Et / 🔴 Deaktif Et** - Reklamı aç/kapat
2. **🗑️ Sil** - Reklamı sil (onay dialog'u gösterir)

**NOT:** Şu anda reklam DÜZENLEME özelliği taslak halindedir.

## 📊 ANALİTİKLER SEKMESİ

### Toplam İstatistikler:
- **👁️ Toplam Gösterimler** - Tüm reklamların toplam gösterim sayısı
- **👆 Toplam Tıklamalar** - Tüm reklamların toplam tıklama sayısı
- **📊 Ortalama CTR** - Ortalama click-through rate
- **🟢 Aktif Reklamlar** - Aktif reklam sayısı

## 👥 KULLANICILAR SEKMESİ

- Yakında eklenecek...

## 🔄 REKLAM YAŞAM DÖNGÜSÜ

### Supabase'de Reklam Ekleme:

1. **SQL Editor** > New Query
2. Bu SQL'i çalıştır:

```sql
INSERT INTO advertisements (
  id, 
  title, 
  description, 
  sponsor_name, 
  cta_text, 
  cta_url,
  placement_ids,
  start_date,
  end_date,
  priority,
  active
) VALUES (
  'ad-my-sponsor',
  'Benim Reklamım',
  'Bu harika bir reklam',
  'My Sponsor',
  'Tıkla',
  'https://example.com',
  ARRAY['header-banner', 'sidebar-spotlight'],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days',
  'high',
  true
);
```

3. Sayfayı yenile (F5)
4. Admin Panel'de yeni reklam görünür

### Reklam Silme:

Admin Panel'den:
1. Silinecek reklama git
2. **🗑️ Sil** tıkla
3. Onay dialog'u gelir
4. "OK" tıkla

## 📍 REKLAM YERLEŞİM TÜRLERİ (Placements)

Reklamlar şu yerlerde görülebilir:
- **header-banner** - Sayfanın başında (şerit banner)
- **sidebar-spotlight** - Sidebar'da (spotlight)
- **leaderboard-banner** - Sıralama sayfasında
- **game-complete-modal** - Oyun bittiğinde
- **event-notification** - Etkinlik bildirimi

## ⚡ ANALYTICS NASIL ÇALIŞIR?

1. **Impression** (Görüntü) - Reklam sayfada yüklendiğinde
   - Otomatik olarak kaydedilir
   - Başında `impressions` artar

2. **Click** (Tıklama) - Reklam CTA butonuna tıklandığında
   - Otomatik olarak kaydedilir
   - Başında `clicks` artar

3. **CTR** (Click-Through Rate) - Hesaplanır
   - Formula: (Clicks / Impressions) × 100
   - Örnek: 100 gösterim, 2 tıklama = %2 CTR

## 🔐 GÜVENLİK

- Admin wallet: `GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA`
- Sadece bu wallet ile giriş yapanlara admin panel görünür
- Veriler Supabase'de PostgreSQL DB'de tutulur
- RLS (Row Level Security) sayesinde veriler güvenli

## 🐛 SORUN GIDERİCİ

### Admin butonu görünmüyor?
- Wallet'ı kontrol et (Freighter)
- Wallet adresi doğru mu? (GDSPUJG45...)
- Console'da "⚠️ Not admin" mesajı var mı?

### Reklamlar yüklenmiyor?
- Console'da hata var mı kontrol et (F12)
- Supabase'ye bağlı mı? "Supabase configured" mesajı görmelisin
- SQL'i Supabase'de çalıştırdın mı?

### Analytics sıfır gösteriyorsa?
- Sayfayı yenile (F5)
- Reklam sayfada görünüyor mu kontrol et
- Browser console'da hata mesajı var mı

## 📞 İLETİŞİM

Sorun olursa lütfen:
1. Browser console'dan (F12) hata mesajını kopyala
2. Sonra debug et

---

**Başarılar!** 🎉 Admin panel ile reklamları kontrol edebilirsin!
