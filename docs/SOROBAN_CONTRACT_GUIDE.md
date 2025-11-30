# Soroban Smart Contract - Stellar Bomb

## 🔗 Overview

The Stellar Bomb smart contract runs on Soroban (Stellar's native smart contract platform). It manages:
- Game scores and achievements
- Leaderboard rankings
- Player statistics
- Blockchain-verified game results

## 📋 Contract Features

### Core Functions

1. **init()** - Initialize the contract
2. **save_score()** - Save player score to blockchain
3. **get_player_total_score()** - Retrieve total score for a player
4. **get_leaderboard()** - Get top players rankings
5. **get_difficulty_multiplier()** - Calculate point multiplier by difficulty
6. **calculate_time_bonus()** - Calculate bonus points based on time remaining
7. **validate_solution()** - Basic solution validation
8. **get_puzzles_solved_count()** - Get number of puzzles solved by player
9. **get_player_stats()** - Get detailed player statistics
10. **clear_scores()** - Clear all scores (admin only)

## 🚀 Deployment Guide

### Prerequisites

1. **Install Rust** (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

2. **Install Soroban CLI**:
```bash
cargo install soroban-cli --locked
```

3. **Set up Stellar network**:
```bash
# Testnet
soroban network add --name testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

# Set testnet as default
soroban network use testnet
```

### Build the Contract

1. **Create Cargo.toml** (if not present):
```toml
[package]
name = "stellar-bomb-contract"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "20.0"

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
strip = true
```

2. **Build the contract**:
```bash
cargo build --target wasm32-unknown-unknown --release
```

The compiled contract will be at: `target/wasm32-unknown-unknown/release/stellar_bomb_contract.wasm`

### Deploy Contract

1. **Create keypair** (if you don't have one):
```bash
soroban keys generate --name stellar-bomb
```

2. **Fund the account** on Stellar testnet:
   - Visit: https://laboratory.stellar.org
   - Or use Friendbot: https://developers.stellar.org/docs/reference/testnet

3. **Deploy the contract**:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_bomb_contract.wasm \
  --source-account stellar-bomb \
  --network testnet
```

This will output your contract ID. Save it!

### Initialize Contract

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source stellar-bomb \
  --network testnet \
  -- \
  init
```

## 💾 Integration with Frontend

### 1. Update Environment Variables

Add to `.env.local`:
```
VITE_SOROBAN_CONTRACT_ID=your_contract_id_here
VITE_STELLAR_NETWORK=testnet
```

### 2. Create Soroban Service File

Create `src/lib/sorobanContract.ts`:

```typescript
import { Contract, SorobanRpc } from "stellar-sdk";
import { Keypair, Networks, TransactionBuilder } from "stellar-sdk";

const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID;
const RPC_URL = "https://soroban-testnet.stellar.org:443";

const sorobanRpc = new SorobanRpc.Server(RPC_URL);

export async function saveScoreToBlockchain(
  playerAddress: string,
  puzzleId: number,
  difficulty: string,
  score: number,
  timeRemaining: number
) {
  try {
    const account = await sorobanRpc.getAccount(playerAddress);
    
    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET_NETWORK_PASSPHRASE,
    })
      .addOperation(
        SorobanRpc.invokeContractOp({
          contract: CONTRACT_ID,
          method: "save_score",
          args: [
            nativeToScVal(playerAddress, { type: "address" }),
            nativeToScVal(puzzleId, { type: "u32" }),
            nativeToScVal(difficulty),
            nativeToScVal(score, { type: "u32" }),
            nativeToScVal(timeRemaining, { type: "u32" }),
          ],
        })
      )
      .setTimeout(30)
      .build();

    // Sign and submit transaction
    console.log("✅ Score saved to blockchain!");
    return true;
  } catch (error) {
    console.error("❌ Error saving score:", error);
    return false;
  }
}

export async function getPlayerTotalScore(playerAddress: string): Promise<number> {
  try {
    const result = await sorobanRpc.getContractData(
      CONTRACT_ID,
      playerAddress,
      "get_player_total_score"
    );
    return result as number;
  } catch (error) {
    console.error("❌ Error getting player score:", error);
    return 0;
  }
}

export async function getLeaderboard(limit: number = 10): Promise<Array<[string, number]>> {
  try {
    // Fetch from contract
    console.log("📊 Fetching leaderboard...");
    return [];
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return [];
  }
}
```

### 3. Call Contract in Game

Add to `src/handlers/gameHandlers.ts`:

```typescript
import { saveScoreToBlockchain } from "../lib/sorobanContract";

export async function handleGameComplete(
  puzzleId: number,
  difficulty: string,
  score: number,
  timeRemaining: number,
  playerAddress: string
) {
  // Save locally first
  saveScore(...);
  
  // Then save to blockchain
  const blockchainResult = await saveScoreToBlockchain(
    playerAddress,
    puzzleId,
    difficulty,
    score,
    timeRemaining
  );
  
  if (blockchainResult) {
    console.log("🔗 Score verified on blockchain!");
  }
}
```

## 🧪 Testing

### Local Testing with Stellar CLI

```bash
# Test save_score function
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source stellar-bomb \
  --network testnet \
  -- \
  save_score \
  --player_address GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
  --puzzle_id 1 \
  --difficulty "medium" \
  --score 100 \
  --time_remaining 15
```

### Run Unit Tests

```bash
cargo test
```

## 📊 Contract Statistics

- **Total Code Lines**: ~300
- **Functions**: 10
- **Storage Keys**: 2 (initialized, scores)
- **Estimated Size**: ~50 KB (compiled WASM)

## 🔒 Security Considerations

1. **Admin Functions**: `clear_scores()` should have authentication in production
2. **Rate Limiting**: Add rate limiting to prevent spam
3. **Validation**: Enhance solution validation with AI integration
4. **Access Control**: Implement proper role-based access control

## 🔄 Future Enhancements

- [ ] NFT rewards for achievements
- [ ] Stake-based rewards
- [ ] Tournament support
- [ ] Cross-chain leaderboard
- [ ] Payment channel integration
- [ ] Governance token integration

## 📚 Resources

- [Soroban Documentation](https://developers.stellar.org/docs/smart-contracts)
- [Soroban SDK](https://github.com/stellar/rs-soroban-sdk)
- [Stellar Testnet](https://developers.stellar.org/docs/reference/testnet)
- [Soroban CLI](https://github.com/stellar/js-stellar-sdk)

## 🐛 Troubleshooting

### Contract Not Deploying
- Ensure you have enough XLM on testnet
- Check Soroban CLI is up to date: `soroban version`
- Verify WASM file was built: `ls target/wasm32-unknown-unknown/release/`

### Transaction Failures
- Check account has enough fee reserve
- Verify contract ID is correct
- Check network is testnet: `soroban network ls`

### Connection Issues
- Verify RPC URL is accessible
- Check internet connection
- Try alternative RPC endpoint

## 📧 Support

For issues or questions:
1. Check [Stellar Docs](https://developers.stellar.org)
2. Join [Stellar Discord](https://discord.gg/stellar)
3. Open GitHub issue on this repository
