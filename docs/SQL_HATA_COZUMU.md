# 🔧 Supabase SQL Hatası Düzeltme

## Hata Mesajı
```
ERROR: 42883: operator does not exist: uuid = text
```

## Nedeni
Supabase'nin PostgreSQL versiyonu UUID ile TEXT karşılaştırmasını doğrudan desteklemiyor.

## Çözüm

### SEÇENEK 1: Düzeltilmiş SQL'i Kullan (Önerilen)

1. **supabase_setup_fixed.sql** dosyasını açıp Supabase SQL Editor'a kopyala
2. Tüm SQL'i çalıştır
3. Hata oluşmayacak

### SEÇENEK 2: Orijinal SQL'i Düzelt

Orijinal `supabase_setup.sql` dosyasında:
- Foreign key tanımlarını kaldır
- RLS policies'i iki aşamada ekle

## Adım Adım (Seçenek 1 - Önerilen)

### 1. Tables ve Schema Oluştur
```bash
✅ supabase_setup_fixed.sql → Supabase SQL Editor → RUN
```

### 2. Örnek Reklamları Ekle
```bash
✅ SUPABASE_INSERT_ADS_FIXED.sql → Supabase SQL Editor → RUN
```

### 3. Doğrulama
SQL çıktısında şu görünmelidir:
```
id             | title                      | sponsor_name | priority | active | created_at
---------------|----------------------------|--------------|----------|--------|-------------------
ad-stellar     | Stellar Network...         | SDF          | high     | true   | 2025-11-30...
ad-freighter   | Freighter Wallet...        | Stellar Comm | high     | true   | 2025-11-30...
ad-tournament  | Stellar Bomb Turnuvası...  | Stellar Bomb | medium   | true   | 2025-11-30...
```

## Dosya Listesi

| Dosya | Amaç | Durum |
|-------|------|-------|
| `supabase_setup_fixed.sql` | Tüm tables ve schema | ✅ FIXED |
| `SUPABASE_INSERT_ADS_FIXED.sql` | Örnek 3 reklam | ✅ FIXED |
| `supabase_setup.sql` | Eski versiyon (hatalı) | ⚠️ DEPRECATED |
| `SUPABASE_INSERT_ADS.sql` | Eski versiyon (hatalı) | ⚠️ DEPRECATED |

## ⚡ Hızlı Başla

1. Supabase Dashboard'a gir
2. **SQL Editor** tıkla
3. **supabase_setup_fixed.sql** dosyasını kopyala
4. Yapıştır → **RUN**
5. Yeni sorgu → **SUPABASE_INSERT_ADS_FIXED.sql** kopyala
6. Yapıştır → **RUN**
7. ✅ Bitti!

## 💡 Not

- Eski `supabase_setup.sql` ve `SUPABASE_INSERT_ADS.sql` artık kullanılmıyor
- Yeni dosyaları (`_fixed.sql`) kullan
- İkisini karıştırma!

---

**Sorun çözüldü!** ✅
