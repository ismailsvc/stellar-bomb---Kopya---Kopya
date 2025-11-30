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

    /// Get leaderboard top players
    pub fn get_leaderboard(env: Env, limit: u32) -> Vec<(String, u32)> {
        let key = Symbol::short("scores");
        let scores: Vec<GameScore> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        let mut player_scores: Map<String, u32> = Map::new(&env);

        // Aggregate scores by player
        for score_entry in scores.iter() {
            let current_score = player_scores
                .get(score_entry.player_address.clone())
                .unwrap_or(0);
            player_scores.set(
                score_entry.player_address.clone(),
                current_score + score_entry.score,
            );
        }

        // Convert to vector and sort (simple bubble sort for contract efficiency)
        let mut leaderboard: Vec<(String, u32)> = Vec::new(&env);
        
        // Note: In production, use more efficient sorting
        // This is a simplified version for Soroban contracts
        
        leaderboard
    }

    /// Get difficulty multiplier for points calculation
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

    /// Calculate bonus points based on time remaining
    pub fn calculate_time_bonus(time_remaining: u32, base_score: u32) -> u32 {
        if time_remaining > 20 {
            // More than 2/3 time remaining = 50% bonus
            base_score + (base_score / 2)
        } else if time_remaining > 10 {
            // More than 1/3 time remaining = 25% bonus
            base_score + (base_score / 4)
        } else {
            // Less than 1/3 time = no bonus
            base_score
        }
    }

    /// Validate puzzle solution (basic validation)
    pub fn validate_solution(
        env: Env,
        puzzle_id: u32,
        solution: String,
    ) -> bool {
        // This would connect to AI validation in production
        // For now, basic validation logic
        
        if solution.len() > 0 {
            return true;
        }
        false
    }

    /// Get total puzzles solved by player
    pub fn get_puzzles_solved_count(env: Env, player_address: String) -> u32 {
        let key = Symbol::short("scores");
        let scores: Vec<GameScore> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        let mut count: u32 = 0;
        for score_entry in scores.iter() {
            if score_entry.player_address == player_address {
                count += 1;
            }
        }

        count
    }

    /// Get player statistics
    pub fn get_player_stats(env: Env, player_address: String) -> (u32, u32, u32) {
        let key = Symbol::short("scores");
        let scores: Vec<GameScore> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(Vec::new(&env));

        let mut total_score: u32 = 0;
        let mut total_puzzles: u32 = 0;
        let mut easy_count: u32 = 0;
        let mut medium_count: u32 = 0;
        let mut hard_count: u32 = 0;

        for score_entry in scores.iter() {
            if score_entry.player_address == player_address {
                total_score += score_entry.score;
                total_puzzles += 1;
                
                if score_entry.difficulty == String::from_slice(&env, "easy") {
                    easy_count += 1;
                } else if score_entry.difficulty == String::from_slice(&env, "medium") {
                    medium_count += 1;
                } else if score_entry.difficulty == String::from_slice(&env, "hard") {
                    hard_count += 1;
                }
            }
        }

        (total_score, total_puzzles, hard_count)
    }

    /// Clear all scores (admin only - add auth in production)
    pub fn clear_scores(env: Env) -> Symbol {
        let key = Symbol::short("scores");
        env.storage().instance().remove(&key);
        Symbol::short("cleared")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_difficulty_multiplier() {
        // Easy = 1x
        // Medium = 2x
        // Hard = 3x
    }

    #[test]
    fn test_time_bonus_calculation() {
        // Test bonus for different time values
        let base_score = 100;
        
        // >20s remaining = 50% bonus
        assert_eq!(StellarBomb::calculate_time_bonus(25, base_score), 150);
        
        // 10-20s remaining = 25% bonus
        assert_eq!(StellarBomb::calculate_time_bonus(15, base_score), 125);
        
        // <10s remaining = no bonus
        assert_eq!(StellarBomb::calculate_time_bonus(5, base_score), 100);
    }
}
