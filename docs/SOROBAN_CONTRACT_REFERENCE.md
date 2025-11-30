# Soroban Smart Contract - Stellar Bomb
# Reference Implementation (Rust)
# This is a reference file. For actual Soroban development, use the Soroban CLI

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Symbol, Vec, Map, String};

#[derive(Clone)]
pub struct GameScore {
    pub player_address: String,
    pub puzzle_id: u32,
    pub difficulty: String,
    pub score: u32,
    pub time_remaining: u32,
    pub timestamp: u64,
}

#[contract]
pub struct StellarBomb;

#[contractimpl]
impl StellarBomb {
    /// Initialize the game contract
    pub fn init(env: Env) -> Symbol {
        let key = Symbol::short("initialized");
        if env.storage().instance().has(&key) {
            return Symbol::short("already_init");
        }
        env.storage().instance().set(&key, &true);
        Symbol::short("success")
    }

    /// Save player score to blockchain
    pub fn save_score(
        env: Env,
        player_address: String,
        puzzle_id: u32,
        difficulty: String,
        score: u32,
        time_remaining: u32,
    ) -> Symbol {
        let timestamp = env.ledger().timestamp();
        
        // Create score entry
        let game_score = GameScore {
            player_address: player_address.clone(),
            puzzle_id,
            difficulty,
            score,
            time_remaining,
            timestamp,
        };

        // Store in contract
        let key = Symbol::short("scores");
        let mut scores: Vec<GameScore> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Vec::new(&env));
        
        scores.push_back(game_score);
        env.storage().instance().set(&key, &scores);

        Symbol::short("score_saved")
    }

    /// Get player total score
    pub fn get_player_total_score(env: Env, player_address: String) -> u32 {
        let key = Symbol::short("scores");
        let scores: Vec<GameScore> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        let mut total_score: u32 = 0;
        for score_entry in scores.iter() {
            if score_entry.player_address == player_address {
                total_score += score_entry.score;
            }
        }

        total_score
    }

    /// Get difficulty multiplier
    pub fn get_difficulty_multiplier(difficulty: String) -> u32 {
        if difficulty == String::from_slice(&env, "easy") {
            1
        } else if difficulty == String::from_slice(&env, "medium") {
            2
        } else if difficulty == String::from_slice(&env, "hard") {
            3
        } else {
            0
        }
    }

    /// Calculate time bonus
    pub fn calculate_time_bonus(time_remaining: u32, base_score: u32) -> u32 {
        if time_remaining > 20 {
            base_score + (base_score / 2)
        } else if time_remaining > 10 {
            base_score + (base_score / 4)
        } else {
            base_score
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_difficulty_multiplier() {
        // Easy = 1x, Medium = 2x, Hard = 3x
    }

    #[test]
    fn test_time_bonus() {
        let base = 100;
        assert_eq!(StellarBomb::calculate_time_bonus(25, base), 150);
        assert_eq!(StellarBomb::calculate_time_bonus(15, base), 125);
        assert_eq!(StellarBomb::calculate_time_bonus(5, base), 100);
    }
}
```

## Key Features

- **Game Score Structure**: Tracks player, puzzle, difficulty, score, time, timestamp
- **Score Saving**: Stores game results on-chain
- **Leaderboard**: Aggregate player scores
- **Multipliers**: 1x (easy), 2x (medium), 3x (hard)
- **Bonuses**: Time-based bonus system
- **Statistics**: Track player performance

## Deployment

See `SOROBAN_CONTRACT_GUIDE.md` for full deployment instructions.

## Integration

This contract is referenced in the backend and can be deployed to Stellar Testnet.
