# 🎮 Stellar Bomb - Rehberler Haritası

```
╔════════════════════════════════════════════════════════════════╗
║           STELLAR BOMB - BAŞLARKEN OKUYACAKLARIN              ║
╚════════════════════════════════════════════════════════════════╝

⏱️  5 DAKIKA HAZIR OLMAK İSTİYORUM
│
└─→ 📄 QUICKSTART.md (En hızlı yol!)
    └─→ supabase_setup.sql (Kopyala-yapıştır)


📚 DETAYLI REHBERLER
│
├─→ 🚀 QUICKSTART.md
│   İçerik: Hızlı kurulum, API anahtarları, SQL setup
│   Süre: 5 dakika
│   Kim için: Herkes
│
├─→ 🗄️  SUPABASE_SETUP.md
│   İçerik: Adım adım Supabase kurulumu
│   Süre: 10-15 dakika
│   Kim için: Supabase'i detaylı öğrenmek isteyenler
│
├─→ 🎮 MULTIPLAYER.md
│   İçerik: 1v1 multiplayer rehberi
│   Süre: 5 dakika
│   Kim için: Multiplayer oynamak isteyenler
│
├─→ 📊 SUPABASE_DATA.md
│   İçerik: Veri kaydetme sistemi detayları
│   Süre: 10 dakika
│   Kim için: Veri akışını anlamak isteyenler
│
├─→ ✅ CHECKLIST.md
│   İçerik: Kurulum kontrol listesi
│   Süre: Kurulum sırasında
│   Kim için: Hiçbir şey unutmamak için
│
├─→ 📖 DOCS.md
│   İçerik: Tüm rehberlerin indeksi
│   Süre: 2 dakika
│   Kim için: Hangi dosyayı okuyacağını bilmemek için
│
└─→ 📋 README.md
    İçelik: Proje özeti, özellikler, teknoloji
    Süre: 5 dakika
    Kim için: Projeyi genel olarak anlamak için


💾 TEKNIK DOSYALAR
│
├─→ supabase_setup.sql
│   İçerik: Tüm SQL kodları (kopyala-yapıştır)
│   Kullanım: Supabase SQL Editor'e yapıştır
│
├─→ .env.example
│   İçerik: Environment değişkenleri şablonu
│   Kullanım: .env.local dosyasının temelini oluştur
│
├─→ src/App.tsx
│   İçerik: Tüm oyun mantığı (1331 satır)
│   Görüntüle: Kod değiştirmek istersen
│
├─→ src/App.css
│   İçerik: Cyberpunk tema stilleri
│   Görüntüle: Tasarımı değiştirmek istersen
│
└─→ src/lib/supabase.ts
    İçerik: Supabase servis fonksiyonları
    Görüntüle: Veri işlemlerini anlamak için


🎯 DURUMA GÖRE REHBER SEÇ
│
├─→ "5 dakikada başlamak istiyorum"
│   └─ QUICKSTART.md ⚡
│
├─→ "Supabase tablolarını oluşturmak istiyorum"
│   └─ SUPABASE_SETUP.md + supabase_setup.sql 🗄️
│
├─→ "Multiplayer nasıl çalışıyor?"
│   └─ MULTIPLAYER.md ⚔️
│
├─→ "Kurulumu adım adım yapacağım"
│   └─ CHECKLIST.md ✅
│
├─→ "Veri sistemi nasıl çalışıyor?"
│   └─ SUPABASE_DATA.md 📊
│
└─→ "Genel bilgi istiyorum"
    └─ README.md 📖


📑 KURULUMUNdaki ADIM NUMARALARI
│
1️⃣  Repoyu klonla
    └─ git clone ... && cd stellar-bomb
│
2️⃣  Bağımlılıkları yükle
    └─ npm install
│
3️⃣  Supabase hesabı oluştur
    └─ https://supabase.com
│
4️⃣  Tabloları oluştur
    └─ SQL Editor'de supabase_setup.sql'i çalıştır
│
5️⃣  API anahtarlarını al
    └─ Settings > API > Configuration
│
6️⃣  .env.local dosyasını oluştur
    └─ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ...
│
7️⃣  Oyunu başlat
    └─ npm run dev
│
8️⃣  Freighter yükle
    └─ Chrome Web Store
│
9️⃣  Cüzdan oluştur
    └─ Freighter > Testnet > Yeni Cüzdan
│
🔟 Oyuna başla!
    └─ http://localhost:5173


📞 SORUN ÇÖZÜMÜ
│
├─→ "Supabase not configured"
│   └─ .env.local kontrol et → SUPABASE_SETUP.md #2
│
├─→ "Tablolar oluşturulmadı"
│   └─ SQL kodunu kontrol et → SUPABASE_SETUP.md #4
│
├─→ "Freighter bağlantısı yok"
│   └─ Freighter yükle → QUICKSTART.md #7
│
└─→ Diğer sorunlar
    └─ İlgili rehberin Troubleshooting bölümü


🔐 GÜVENLİK KONTROLLERI
│
✓ .env.local'ı .gitignore'a ekle (yapılmış)
✓ API anahtarlarını GitHub'a commit etme
✓ Testnet kullan, mainnet değil
✓ Supabase RLS ayarlarını gözden geçir


✨ BONUS TİPLERİ
│
💡 Tüm kodları kopyala-yapıştır (kendin değiştirme)
💡 CHECKLIST.md ile kontrol et (hiçbir şey unutma)
💡 Sorun varsa console.log() ile debug et (F12 > Console)
💡 Supabase Dashboard'ı açık tut (kontrol için)
💡 İlk test için solo mode, sonra multiplayer


🚀 BAŞLA!
│
┌─────────────────────────────────────────────┐
│ 👉 QUICKSTART.md ile başlayalım! ⚡         │
└─────────────────────────────────────────────┘
│
│ Yapılacaklar:
│ 1. QUICKSTART.md'yi oku
│ 2. Supabase hesabı oluştur
│ 3. SQL kodunu çalıştır
│ 4. Oyunu başlat
│ 5. Eğlendir! 🎮


📊 DOSYA OKUNUŞluk
│
1. QUICKSTART.md ..................... ⭐⭐⭐⭐⭐ (Başla!)
2. SUPABASE_SETUP.md ................ ⭐⭐⭐⭐ (Detaylı)
3. CHECKLIST.md ..................... ⭐⭐⭐⭐ (Kontrol)
4. MULTIPLAYER.md ................... ⭐⭐⭐ (İsteğe bağlı)
5. SUPABASE_DATA.md ................. ⭐⭐⭐ (İsteğe bağlı)
6. README.md ........................ ⭐⭐ (Bilgi)


═══════════════════════════════════════════════════════════════
                    HAZIRSAN BAŞLAYALIM! 🚀
═══════════════════════════════════════════════════════════════
```

## 📋 Hızlı Karar Ağacı

```
                    STELLAR BOMB'U BAŞLATMAK İSTİYORUM
                                |
                    ┌───────────┴───────────┐
                    |                       |
            5 DAKİKA HAZIR        DETAYLI KURULUM
                    |                       |
            QUICKSTART.md           SUPABASE_SETUP.md
                    |                       |
            ┌───────┴───────┐       ┌───────┴────────┐
            |               |       |                |
        BAŞLAT       SORUN MI?    TABLOLAR        ÇALIŞIYOR
            |         |           OLUŞTUR             |
         SUCCESS  TROUBLESHOOTING  |                SUCCESS
                       ↓          SUCCESS
                   SEKTABLS.md
```

## ⚡ Hızlı Komutlar

```bash
# Repoyu klonla
git clone https://github.com/ismailsvc/stellar-bomb.git
cd stellar-bomb

# Bağımlılıkları yükle
npm install

# Oyunu başlat
npm run dev

# URL aç
# http://localhost:5173
```

## 🎯 Başarı Kriterleri

✅ Supabase tablolarını oluşturdum
✅ .env.local dosyasını oluşturdum
✅ npm run dev çalıştı
✅ http://localhost:5173 açıldı
✅ Freighter cüzdan bağladım
✅ Profil oluşturdum
✅ Bulmaca çözdüm
✅ Skor kaydedildi

---

**Öyleyse başlayalım!** 👉 **[QUICKSTART.md](./QUICKSTART.md)**
