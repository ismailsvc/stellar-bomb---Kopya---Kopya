# 🔗 Soroban Smart Contract Integration Guide

Stellar Bomb oyununa Soroban akıllı kontratı nasıl bağlanır - Adım adım rehber.

## 1️⃣ Soroban Kontratını Deploy Et

### Adım 1: Rust Kurulumu

```bash
# Rust'ı kur
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Soroban CLI'yı kur
cargo install soroban-cli --locked

# Kontrol et
soroban --version
```

### Adım 2: Stellar Testnet'e Bağlan

```bash
# Testnet ağını ekle
soroban network add --name testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Testnet'i kullan
soroban network use testnet
```

### Adım 3: Cüzdan Oluştur

```bash
# Yeni keypair oluştur
soroban keys generate --name stellar-bomb

# Cüzdanı kontrol et
soroban keys show stellar-bomb
```

### Adım 4: XLM Alarak Cüzdanı Fonla

```bash
# Çıktıda görünen public key'i kopyala
# https://developers.stellar.org/docs/reference/testnet adresine git
# Friendbot'u kullanarak cüzdanı fonla (1000 XLM)
```

### Adım 5: Kontratı Deploy Et

```bash
# Kontratı derle (stellar-bomb-contract.wasm oluşturulacak)
cd backend
cargo build --target wasm32-unknown-unknown --release

# Deploy et
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_bomb_contract.wasm \
  --source-account stellar-bomb \
  --network testnet
```

**Çıktı örneği:**
```
CBVG4IXVLUYQXQYCDW7YGQDZV3WJHWEU5TJWXWXWXWXWXWXWXWXWXWX
```

Bu `CONTRACT_ID`'yi kopyala! ⭐

---

## 2️⃣ Frontend'de Entegrasyon

### Adım 1: Environment Variables Ayarla

`.env.local`'e ekle:
```env
# Soroban
VITE_SOROBAN_CONTRACT_ID=CBVG4IXVLUYQXQYCDW7YGQDZV3WJHWEU5TJWXWXWXWXWXWXWXWXWXWX
VITE_STELLAR_NETWORK=testnet
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org:443
```

### Adım 2: Soroban Service Oluştur

`src/lib/sorobanService.ts` oluştur:

```typescript
import { Contract, SorobanRpc, Keypair, Networks, TransactionBuilder, nativeToScVal } from "stellar-sdk";

const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID;
const RPC_URL = import.meta.env.VITE_SOROBAN_RPC;

const sorobanRpc = new SorobanRpc.Server(RPC_URL, {
  allowHttp: false,
});

/**
 * Oyuncunun skorunu blockchain'e kaydet
 */
export async function saveScoreToBlockchain(
  walletPublicKey: string,
  puzzleId: number,
  difficulty: "easy" | "medium" | "hard",
  score: number,
  timeRemaining: number
): Promise<boolean> {
  try {
    console.log("🔗 Blockchain'e skor kaydediliyor...");

    // Oyuncu hesabını al
    const account = await sorobanRpc.getAccount(walletPublicKey);

    // Contract'ı çağır
    const contract = new Contract(CONTRACT_ID, "save_score");

    // İşlem parametrelerini oluştur
    const op = contract.call(
      "save_score",
      nativeToScVal(walletPublicKey, { type: "address" }),
      nativeToScVal(puzzleId, { type: "u32" }),
      nativeToScVal(difficulty),
      nativeToScVal(score, { type: "u32" }),
      nativeToScVal(timeRemaining, { type: "u32" })
    );

    // İşlemi imzala ve gönder
    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    console.log("✅ Skor başarıyla blockchain'e kaydedildi!");
    return true;
  } catch (error) {
    console.error("❌ Blockchain kaydı hatası:", error);
    return false;
  }
}

/**
 * Oyuncunun toplam skorunu blockchain'den al
 */
export async function getPlayerScoreFromBlockchain(
  walletPublicKey: string
): Promise<number> {
  try {
    const contract = new Contract(CONTRACT_ID, "get_player_total_score");
    
    const result = await sorobanRpc.invokeContract({
      method: "get_player_total_score",
      args: [nativeToScVal(walletPublicKey, { type: "address" })],
    });

    return parseInt(result.toString());
  } catch (error) {
    console.error("❌ Skor alma hatası:", error);
    return 0;
  }
}

/**
 * Oyuncunun istatistiklerini blockchain'den al
 */
export async function getPlayerStatsFromBlockchain(
  walletPublicKey: string
): Promise<{
  totalScore: number;
  totalPuzzles: number;
  hardCount: number;
}> {
  try {
    const contract = new Contract(CONTRACT_ID, "get_player_stats");
    
    const result = await sorobanRpc.invokeContract({
      method: "get_player_stats",
      args: [nativeToScVal(walletPublicKey, { type: "address" })],
    });

    return {
      totalScore: parseInt(result[0].toString()),
      totalPuzzles: parseInt(result[1].toString()),
      hardCount: parseInt(result[2].toString()),
    };
  } catch (error) {
    console.error("❌ İstatistik alma hatası:", error);
    return { totalScore: 0, totalPuzzles: 0, hardCount: 0 };
  }
}

/**
 * Kontrat başlatma (admin)
 */
export async function initializeContract(walletPublicKey: string): Promise<boolean> {
  try {
    const account = await sorobanRpc.getAccount(walletPublicKey);
    const contract = new Contract(CONTRACT_ID, "init");

    const op = contract.call("init");

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    console.log("✅ Kontrat başlatıldı!");
    return true;
  } catch (error) {
    console.error("❌ Kontrat başlatma hatası:", error);
    return false;
  }
}
```

### Adım 3: Game Handler'ında Kullan

`src/handlers/gameHandlers.ts`'de:

```typescript
import { saveScoreToBlockchain } from "../lib/sorobanService";

export async function handlePuzzleComplete(
  playerAddress: string,
  puzzleId: number,
  difficulty: "easy" | "medium" | "hard",
  score: number,
  timeRemaining: number
) {
  // Lokalde kaydet
  saveLocalScore({
    puzzleId,
    difficulty,
    score,
    timeRemaining,
  });

  // Blockchain'e kaydet
  const blockchainSuccess = await saveScoreToBlockchain(
    playerAddress,
    puzzleId,
    difficulty,
    score,
    timeRemaining
  );

  if (blockchainSuccess) {
    console.log("🔗 Blockchain verified!");
    // UI'da badge göster
    showBlockchainVerificationBadge();
  }
}
```

### Adım 4: App.tsx'de Kullan

```typescript
import { getPlayerScoreFromBlockchain } from "./lib/sorobanService";

// Profil sayfasında
useEffect(() => {
  async function loadBlockchainScore() {
    if (profile?.wallet_address) {
      const blockchainScore = await getPlayerScoreFromBlockchain(
        profile.wallet_address
      );
      console.log("Blockchain Score:", blockchainScore);
      // setState ile güncelle
    }
  }

  loadBlockchainScore();
}, [profile]);
```

---

## 3️⃣ Blockchain'de Skorları Doğrula

### Testnet Explorer'da Kontrol Et

1. https://testnet.steexp.io/ aç
2. Contract ID'yi ara
3. Transactions sekmesini kontrol et

### CLI ile Kontrol Et

```bash
# Oyuncunun toplam skorunu kontrol et
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source stellar-bomb \
  --network testnet \
  -- \
  get_player_total_score \
  --player_address GXXXXXXX...
```

---

## 4️⃣ Sorun Giderme

### Hata: "Contract not found"
```bash
# CONTRACT_ID'nin doğru olduğunu kontrol et
# Testnet'te deploy edilip edilmediğini kontrol et
soroban contract info --id <CONTRACT_ID> --network testnet
```

### Hata: "Insufficient balance"
```bash
# Cüzdanın yeterince XLM'si var mı kontrol et
soroban account balances --source-account stellar-bomb --network testnet
```

### Hata: "Network error"
```bash
# RPC endpoint'in erişilebilir olduğunu kontrol et
curl https://soroban-testnet.stellar.org:443/health
```

---

## 5️⃣ Üretim İçin (Production)

### Mainnet'e Deploy

```bash
# Mainnet ağını ekle
soroban network add --name mainnet \
  --rpc-url https://soroban.stellar.org:443 \
  --network-passphrase "Public Global Stellar Network ; September 2015"

# Deploy et
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_bomb_contract.wasm \
  --source-account stellar-bomb \
  --network mainnet
```

### Environment Güncellemesi

```env
# Production
VITE_SOROBAN_CONTRACT_ID=production_contract_id
VITE_STELLAR_NETWORK=mainnet
VITE_SOROBAN_RPC=https://soroban.stellar.org:443
```

---

## 📚 Kontrol Listesi

- [ ] Rust ve Soroban CLI kuruldu
- [ ] Testnet'e bağlandı
- [ ] Cüzdan oluşturuldu
- [ ] Cüzdan XLM ile fonlandı
- [ ] Kontrat deployed
- [ ] CONTRACT_ID kaydedildi
- [ ] .env.local güncelleştirildi
- [ ] sorobanService.ts oluşturuldu
- [ ] Game handler'da entegre edildi
- [ ] Test edildi
- [ ] Blockchain'de doğrulandı

---

## 🎯 Sonuç

Artık Stellar Bomb oyunun skorları Stellar blockchain'de kaydediliyor! 🚀

**Avantajlar:**
- ✅ Tamper-proof skorlar
- ✅ Blockchain verified leaderboard
- ✅ NFT rewards olabilir
- ✅ Açık ve şeffaf sistem
- ✅ Web3 entegrasyonu tamamlandı

---

## 🔗 Faydalı Linkler

- [Soroban Docs](https://developers.stellar.org/docs/smart-contracts)
- [Stellar Testnet](https://developers.stellar.org/docs/reference/testnet)
- [Testnet Explorer](https://testnet.steexp.io/)
- [Soroban CLI Reference](https://github.com/stellar/soroban-cli)

Başarılar! 🌟
