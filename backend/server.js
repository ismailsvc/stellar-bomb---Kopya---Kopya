// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PUZZLE GENERATION
// ============================================

/**
 * Generate a puzzle using Claude AI
 */
app.post('/api/puzzle/generate', async (req, res) => {
  try {
    const { difficulty, language = 'javascript' } = req.body;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const prompt = `Generate a ${difficulty} level coding puzzle in ${language}.
    
    Requirements:
    - The puzzle should have a bug or logical error
    - Include the buggy code
    - Provide the correct solution
    - Add explanation of what's wrong
    - Return as JSON with: { title, description, buggyCode, correctSolution, explanation, hints }
    
    For ${difficulty} level:
    ${difficulty === 'easy' ? '- Simple syntax errors or basic logic mistakes' : ''}
    ${difficulty === 'medium' ? '- Logic errors or edge case handling' : ''}
    ${difficulty === 'hard' ? '- Complex algorithm issues or optimization problems' : ''}
    
    Return ONLY valid JSON, no markdown or extra text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;
    const puzzle = JSON.parse(responseText);

    res.json({
      success: true,
      puzzle: {
        ...puzzle,
        difficulty,
        language,
      },
    });
  } catch (error) {
    console.error('Error generating puzzle:', error);
    res.status(500).json({
      error: 'Failed to generate puzzle',
      details: error.message,
    });
  }
});

// ============================================
// SOLUTION VALIDATION
// ============================================

/**
 * Validate a puzzle solution using Claude AI
 */
app.post('/api/puzzle/validate', async (req, res) => {
  try {
    const { puzzleTitle, buggyCode, userSolution, correctSolution } = req.body;

    if (!userSolution || !correctSolution) {
      return res.status(400).json({ error: 'Missing solution data' });
    }

    const prompt = `You are a code evaluation expert. Evaluate if this solution is correct.
    
    Original Puzzle: ${puzzleTitle}
    Buggy Code:
    \`\`\`
    ${buggyCode}
    \`\`\`
    
    Correct Solution:
    \`\`\`
    ${correctSolution}
    \`\`\`
    
    User's Solution:
    \`\`\`
    ${userSolution}
    \`\`\`
    
    Evaluate the user's solution and respond with ONLY valid JSON:
    {
      "isCorrect": boolean,
      "score": number (0-100),
      "feedback": "explanation of why it's correct or incorrect",
      "issues": ["list of issues if any"],
      "suggestions": ["improvements if any"]
    }
    
    Return ONLY valid JSON, no markdown or extra text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;
    const validation = JSON.parse(responseText);

    res.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error('Error validating solution:', error);
    res.status(500).json({
      error: 'Failed to validate solution',
      details: error.message,
    });
  }
});

// ============================================
// LEADERBOARD
// ============================================

/**
 * Get global leaderboard
 */
app.get('/api/leaderboard/global', async (req, res) => {
  try {
    const { limit = 100, offset = 0, difficulty = null } = req.query;

    let query = supabase
      .from('leaderboard')
      .select('wallet_address, username, difficulty, points, remaining_time, created_at')
      .order('points', { ascending: false })
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      leaderboard: data,
      total: data.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      details: error.message,
    });
  }
});

/**
 * Get player statistics
 */
app.get('/api/player/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get player profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // Get player scores
    const { data: scores } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('wallet_address', walletAddress);

    if (!scores) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Calculate statistics
    const totalPoints = scores.reduce((sum, score) => sum + (score.points || 0), 0);
    const totalGames = scores.length;
    const easyCount = scores.filter((s) => s.difficulty === 'easy').length;
    const mediumCount = scores.filter((s) => s.difficulty === 'medium').length;
    const hardCount = scores.filter((s) => s.difficulty === 'hard').length;
    const avgTime =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.remaining_time, 0) / scores.length)
        : 0;

    res.json({
      success: true,
      player: {
        profile,
        statistics: {
          totalPoints,
          totalGames,
          easyCount,
          mediumCount,
          hardCount,
          avgTime,
          level: profile?.level || 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      error: 'Failed to fetch player statistics',
      details: error.message,
    });
  }
});

// ============================================
// SCORE SUBMISSION
// ============================================

/**
 * Submit a game score
 */
app.post('/api/score/submit', async (req, res) => {
  try {
    const { walletAddress, username, puzzleTitle, difficulty, points, remainingTime } = req.body;

    if (!walletAddress || !puzzleTitle || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert score into leaderboard
    const { data, error } = await supabase.from('leaderboard').insert({
      wallet_address: walletAddress,
      username,
      puzzle_title: puzzleTitle,
      difficulty,
      points: points || 0,
      remaining_time: remainingTime || 0,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Score submitted successfully',
      data,
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      error: 'Failed to submit score',
      details: error.message,
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
