# 💣 Stellar Bomb - Web3 Kod Çözme Oyunu

> Stellar blokzinciri üzerinde çalışan, yapay zeka tarafından yönetilen, merkeziyetsiz kod çözme oyunu. Kendinizi zorlayın, 30 saniyede programlama bulmacalarını çözün ve küresel sıralamada yarışın.

![Durum](https://img.shields.io/badge/durum-aktif-brightgreen)
![Lisans](https://img.shields.io/badge/lisans-MIT-blue)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Stellar](https://img.shields.io/badge/Stellar-Blockchain-9f10ff?logo=stellar)

## ✨ Genel Bakış

Stellar Bomb, rekabetçi oyunculuğu Web3 teknolojisi ile birleştiren devrim niteliğinde bir kod çözme oyunudur. Oyuncular Stellar cüzdanlarını bağlar, dinamik olarak oluşturulan programlama bulmacalarını çözer ve blokzincirde kayıtlı puan kazanırlar. Her bulmaca OpenAI tarafından yapay zeka ile oluşturulur ve doğrulanır, her oyun oturumunda benzersiz zorluklar sağlar.

## 🎮 Ana Özellikler

### Oyun Mekaniği
- **30 Saniye Zorlukları**: Hızlı gerçek zamanlı geri sayım ile kod çözme
- **Yapay Zeka Bulmacaları**: OpenAI API tarafından benzersiz kod zorlukları
- **Dinamik Zorluk Seviyeleri**: Kolay (1 puan), Orta (2 puan), Zor (3 puan)
- **Çoklu Diller**: JavaScript ve C++ programlama bulmacaları
- **Görsel Geri Bildirim**: Zaman bittiğinde dramatik patlama animasyonu
- **Anlık Puanlama**: Zorluk seviyesine göre gerçek zamanlı puan hesaplaması

### Web3 Entegrasyonu
- **Freighter Cüzdan**: Sorunsuz Stellar cüzdan bağlantısı
- **Blokzincir Doğrulaması**: Oyuncu kimlik bilgileri Supabase'de depolanır
- **Merkeziyetsiz Kayıtlar**: Oyun skorları veritabanında kalıcı olarak kaydedilir
- **Profil Kişileştirmesi**: Avatar, kullanıcı adı ve özel avatar çerçeveleri
- **Çoklu Hesap Desteği**: Birden fazla Stellar cüzdanı arasında geçiş yap

### Sıralamalar
- **Küresel Puanlama**: Dünya çapında oyuncu rekabeti
- **Yerel Önbellekleme**: Çevrimdışı oyun ve otomatik senkronizasyon
- **Avatar Gösterimi**: Özel çerçeveli görsel oyuncu tanımlaması
- **Gerçek Zamanlı Güncellemeler**: Canlı skor takibi ve pozisyon değişiklikleri
- **Zorluk Filtreleme**: Kolay, orta ve zor bulmacalara göre sıralama

### Parasal Kazanç (Sponsorluk Sistemi)
- **Reklam Yerleri**: 5 stratejik konumda hedefli reklam sistemi
- **Analytics Panosu**: İzlenimler, tıklamalar ve CTR takibi
- **Admin Paneli**: Tam reklam yönetimi ve kontrolü
- **Akıllı Rotasyon**: Öncelik seviyesine göre otomatik reklam döndürme
- **Esnek Kampanyalar**: Başlangıç/bitiş tarihleri, öncelik ve yerleşim kontrolü

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+ ve npm
- Freighter Cüzdan Tarayıcı Uzantısı
- Supabase hesabı (ücretsiz tier mevcuttur)
- OpenAI API anahtarı (yapay zeka özellikleri için isteğe bağlı)

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/yourusername/stellar-bomb.git
cd stellar-bomb

# Bağımlılıkları yükle
npm install

# Ortam dosyasını oluştur
cp .env.example .env.local

# .env.local dosyasını API anahtarlarınızla düzenleyin
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_OPENAI_API_KEY=
# VITE_GITHUB_TOKEN=

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcınızda http://localhost:5173 adresini açın
```

## ⚙️ Yapılandırma

### Ortam Değişkenleri

`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Supabase (Veritabanı)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# OpenAI (Yapay Zeka Bulmaca Oluşturma)
VITE_OPENAI_API_KEY=sk-proj-xxxxx...

# GitHub (İsteğe bağlı, sıralama entegrasyonu için)
VITE_GITHUB_TOKEN=ghp_xxxxx...
```

### Supabase Kurulumu

1. **Hesap Oluştur**: https://supabase.com adresini ziyaret et ve kaydol
2. **Proje Oluştur**: Yeni bir proje oluştur (ücretsiz tier mevcuttur)
3. **SQL Şemasını Çalıştır**:
   - SQL Editor'a git
   - `supabase_setup_fixed.sql` dosyasını aç
   - Tüm SQL'i kopyala ve çalıştır
4. **Örnek Verileri Ekle**:
   - Örnek reklamlar için `SUPABASE_INSERT_ADS_FIXED.sql` dosyasını çalıştır
5. **Kimlik Bilgilerini Al**:
   - Ayarlar > API bölümüne git
   - Proje URL'si ve Anon Key'i kopyala
   - `.env.local` dosyasına yapıştır

### Veritabanı Yapısı

```
user_profiles
├── wallet_address (PK)
├── username
├── avatar
├── photo_url
├── bio
├── level
├── selected_frame
└── zaman damgaları

leaderboard
├── id (UUID)
├── wallet_address (FK)
├── username
├── puzzle_title
├── difficulty
├── remaining_time
├── points
├── avatar
├── selected_frame
└── created_at

advertisements
├── id (PK, TEXT)
├── title
├── description
├── sponsor_name
├── sponsor_logo
├── placement_ids
├── start_date / end_date
├── priority (high/medium/low)
├── active (boolean)
├── impressions
├── clicks
└── zaman damgaları

ad_analytics
├── ad_id (FK)
├── impressions
├── clicks
├── ctr
└── timestamp
```

## 🎮 Oyun Nasıl Oynanır

### Adım 1: Cüzdan Bağla
- "Cüzdan Bağla" butonuna tıkla
- Freighter cüzdan bağlantısını onayla
- Stellar adresin oyuncu kimliğin olur

### Adım 2: Profil Oluştur/Güncelle
- Kullanıcı adı gir
- Avatar emoji seç
- Avatar çerçevesi seç (görsel süslemeler)
- Profil blokzincire kaydedilir

### Adım 3: Oyunu Başlat
- "Oyunu Başlat" butonuna tıkla
- Oyun rastgele bir bulmaca seçer
- 30 saniye geri sayımı başlar

### Adım 4: Bulmacayı Çöz
- Hatalı kodu dikkatli oku
- Monaco Editör'ü kullanarak kodu düzelt
- Kod derlenmeli ve mantık kontrollerini geçmeli
- Bazı bulmacalar için ipuçları mevcuttur

### Adım 5: Çözümü Gönder
- "Gönder" butonuna tıkla
- Yapay Zeka kodunuzu anında doğrular
- Anlık geri bildirim al

### Adım 6: Sonuçları Görüntüle
- Kazanılan puanları gör (zorluk seviyesine göre 1-3)
- Tekrar oynama veya sıralamayı görüntüleme seçeneği
- Skor otomatik olarak küresel olarak kaydedilir

## 📊 Oyun İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam Bulmacalar | 19 |
| JavaScript Bulmacaları | 8 |
| C++ Bulmacaları | 11 |
| Zorluk Seviyeleri | 3 (Kolay, Orta, Zor) |
| Bulmaca Başına Zaman | 30 saniye |
| Oyun Başına Maksimum Puan | 40 |
| Kolay Puanlar | 1 |
| Orta Puanlar | 2 |
| Zor Puanlar | 3 |

## 🤖 Yapay Zeka Özellikleri

### Bulmaca Oluşturma
- OpenAI GPT-3.5-turbo benzersiz bulmacalar oluşturur
- Her bulmaca içerir: kod, hata açıklaması, ipuçları
- Oyuncu performansına göre zorluk ayarlanır
- Konular: Diziler, Dizgiler, Döngüler, Algoritmalar, Veri Yapıları

### Kod Doğrulaması
- Yapay Zeka gönderilen kodu doğruluk için analiz eder
- Kontrol eder: Sözdizimi, mantık, köşe durumları, performans
- Hata açıklamaları ile anlık geri bildirim
- Hardcoded çözümleri önler

### Analytics
- Oyuncu performans metriklerini takip eder
- Bulmaca zorluk derecelerini analiz eder
- Oyuncu içgörüleri ve istatistikleri sağlar
- Gelişmiş istatistikler için isteğe bağlı GitHub entegrasyonu

## 👨‍💼 Admin Paneli

### Erişim
- Admin Freighter cüzdanı ile bağlan
- Menüde ⚙️ Admin butonu görünür
- Tam reklam yönetimi arayüzü

### Özellikler
- **📢 Reklamlar Sekmesi**: Reklamları görüntüle, aç/kapat ve sil
- **📊 Analytics Sekmesi**: İzlenimleri, tıklamaları, CTR istatistiklerini görüntüle
- **👥 Kullanıcılar Sekmesi**: Gelecek özellik için yer tutucu

### Admin İşlevleri
- Reklamları etkinleştir/devre dışı bırak
- Reklamları sil (onay ile)
- Gerçek zamanlı analytics'i görüntüle (izlenimleri, tıklamaları, CTR)
- Aktif kampanya sayısını izle
- Toplam katılım metriklerini gör

### Örnek Admin Cüzdanı
```
GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA
```

## 💰 Parasal Kazanç Stratejisi

### Sponsorluk Sistemi (Özellik #4)
1. **Reklam Yerleri**: Uygulama boyunca 5 stratejik konum
   - Başlık banner
   - Sidebar spotlight
   - Sıralama banner
   - Oyun tamamlama modal
   - Etkinlik bildirimi

2. **Öncelik Seviyeleri**: Reklam görünürlüğünü kontrol et
   - Yüksek: Ön plana alınmış
   - Orta: Normal rotasyon
   - Düşük: Nadiren gösterilir

3. **Analytics**: Kampanya performansını takip et
   - İzlenim: Her reklam yüklemesi
   - Tıklama: CTA butonu etkileşimleri
   - CTR: Tıklama oranı yüzdesi
   - Gerçek zamanlı metrikler panosu

4. **Kampanya Yönetimi**: Admin kontrolleri
   - Reklamları etkinleştir/devre dışı bırak
   - Düşük performans gösteren kampanyaları sil
   - Kampanyaları tarihe göre planla
   - Performans metriklerini görüntüle

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Amaç |
|--------|-----------|------|
| **Ön Yüz** | React 19 + TypeScript + Vite | UI Çerçevesi |
| **Editör** | Monaco Editör | Kod düzenleme |
| **Blokzincir** | Stellar SDK + Freighter | Cüzdan entegrasyonu |
| **Yapay Zeka** | OpenAI API (GPT-3.5) | Bulmaca ve doğrulama |
| **Veritabanı** | Supabase (PostgreSQL) | Veri depolama |
| **Stil** | CSS3 + Animasyonlar | UI/UX Tasarımı |
| **Build Aracı** | Vite | Hızlı inşa süreci |

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── BombModel.tsx              # Bomb 3D modeli
│   ├── AdBanner.tsx               # Reklam gösterimi
│   └── AdminPanel.tsx             # Admin yönetimi UI
├── config/
│   ├── ads.config.ts              # Reklam yerleri ve config
│   └── admin.config.ts            # Admin ayarları
├── handlers/
│   └── gameHandlers.ts            # Oyun mantığı
├── lib/
│   ├── supabase.ts                # Veritabanı fonksiyonları
│   ├── aiGenerator.ts             # Yapay Zeka bulmaca oluşturma
│   ├── profileGithub.ts           # GitHub entegrasyonu
│   └── sorobanSession.ts          # Cüzdan oturumu
├── services/
│   └── adManager.ts               # Reklam yönetimi mantığı
├── types/
│   └── index.ts                   # TypeScript türleri
├── utils/
│   └── index.ts                   # Yardımcı fonksiyonlar
├── App.tsx                        # Ana uygulama
├── main.tsx                       # Giriş noktası
└── index.css                      # Global stiller

docs/
├── README.md                      # İngilizce versiyon
├── README_TR.md                   # Türkçe versiyon (bu dosya)
├── ADMIN_PANEL_GUIDE.md          # Admin kullanım rehberi
├── SUPABASE_SETUP_GUIDE.md       # Veritabanı kurulumu
└── supabase_setup_fixed.sql      # Veritabanı şeması
```

## 📚 Kullanılabilir Komutlar

```bash
# Geliştirme
npm run dev              # Dev sunucuyu başlat (http://localhost:5173)

# Üretim
npm run build            # Optimize edilmiş inşa oluştur
npm run preview          # Üretim inşasını yerel olarak ön izle

# Kod Kalitesi
npm run lint             # ESLint kontrollerini çalıştır
npm run lint -- --fix    # Linting sorunlarını otomatik olarak düzelt

# Tip Kontrolü
npm run type-check       # TypeScript derleme kontrolü
```

## 🔒 Güvenlik & Gizlilik

- **Cüzdan Tabanlı Auth**: Şifre yok, yalnızca Stellar cüzdanı gerekli
- **Satır Seviyesi Güvenlik**: Supabase RLS politikaları veri erişimini kısıtlar
- **Herkese Açık Okuma**: Sıralama verileri tüm oyunculara görülebilir
- **Özel Yazma**: Sadece kullanıcılar kendi skorlarını yazabilir
- **Admin Erişimi**: Cüzdan adresi doğrulaması ile kontrol edilir

## 🌐 Tarayıcı Desteği

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Gerekli**: Freighter Cüzdan uzantısı

## 📖 Dokümantasyon

Ayrıntılı rehberler ve kurulum talimatları:

- **[Admin Paneli Rehberi](./ADMIN_PANEL_GUIDE.md)** - Tam admin özellik dokümantasyonu
- **[Supabase Kurulumu](./SUPABASE_SETUP_GUIDE.md)** - Veritabanı yapılandırması
- **[SQL Şeması](./supabase_setup_fixed.sql)** - Tam veritabanı yapısı
- **[Reklam Sistemi Ekleme](./SUPABASE_INSERT_ADS_FIXED.sql)** - Örnek reklamlar

## 🚀 Dağıtım

### Vercel (Önerilen)
```bash
# GitHub deposunu bağla
# "Stellar Bomb" projesini seç
# Vercel otomatik olarak derler ve dağıtır
# Vercel panelinde ortam değişkenlerini ekle
```

### Manuel Dağıtım
```bash
npm run build
# 'dist' klasörünü barındırma sağlayıcınıza dağıt
```

## 🐛 Sorun Giderme

### Cüzdan Bağlanmıyor
- Freighter uzantısını kurulumuştur
- Stellar testnet'te olduğundan emin ol
- Tarayıcı konsolunda hata kontrol et

### Supabase Bağlantısı Başarısız
- `.env.local` dosyasının doğru kimlik bilgilerine sahip olduğunu doğrula
- Supabase projesinin çalışıyor olduğunu kontrol et
- Ağ bağlantısını doğrula

### Yapay Zeka Bulmacaları Oluşturulmuyor
- OpenAI API anahtarının geçerli olduğunu doğrula
- API kotasının aşılmadığını kontrol et
- OpenAI panelinde hataları izle

### Admin Paneli Gösterilmiyor
- Cüzdan adresinin admin cüzdanı ile eşleştiğini doğrula
- Tarayıcı konsolundan: `isAdmin()` true döndürmelidir
- Freighter'ın bağlı olduğundan emin ol

## 📊 Performans Metrikleri

- **İlk Boyama**: < 1s
- **Paket Boyutu**: ~450KB (sıkıştırılmış)
- **Etkileşimli Olma Süresi**: < 2s
- **Lighthouse Puanı**: 85+

## 🎯 Yol Haritası

- [ ] Blokzincir ödülleri (XLM tokenları)
- [ ] GPT-4 ile gelişmiş Yapay Zeka
- [ ] Mobil uygulama versiyonu
- [ ] Sosyal özellikler (takımlar, zorluklar)
- [ ] Canlı yayın entegrasyonu
- [ ] Turnuva sistemi

## 📄 Lisans

MIT Lisansı - Ayrıntılar için [LICENSE](./LICENSE) dosyasını gör

## 🤝 Katkı Sağlama

Katkılar hoşlanır! Lütfen:

1. Depoyu çatallandır
2. Özellik dalı oluştur (`git checkout -b feature/amazing-feature`)
3. Değişiklikleri işle (`git commit -m 'Harika özellik ekle'`)
4. Dalı itme (`git push origin feature/amazing-feature`)
5. Pull Request'i aç

## 📞 Destek ve İletişim

- **Sorunlar**: GitHub Sorunlarında hata bildir
- **Tartışmalar**: GitHub Tartışmalarında sorular sor
- **E-posta**: support@stellar-bomb.app
- **Discord**: Topluluk sunucumuza katıl

## 🙏 Teşekkürler

- Blokzincir altyapısı için Stellar Geliştirme Vakfı
- Yapay Zeka modelleri ve API'ler için OpenAI
- Cüzdan entegrasyonu için Freighter Cüzdan ekibi
- Veritabanı çözümleri için Supabase
- Harika araçlar için React topluluğu

---

**Yapıldı 💣 ve ❤️ ile Stellar Bomb Ekibi tarafından**

*Son Güncelleme: 30 Kasım 2025*
