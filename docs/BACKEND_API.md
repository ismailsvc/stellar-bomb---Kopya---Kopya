# 🚀 Stellar Bomb Backend API

Complete REST API documentation for the Stellar Bomb game backend.

## Base URL

```
http://localhost:3001/api
```

## ✅ Health Check

### GET `/health`

Check backend server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T10:30:00.000Z"
}
```

---

## 🎯 Puzzle Generation

### POST `/puzzle/generate`

Generate a new AI-powered puzzle.

**Request:**
```json
{
  "difficulty": "easy|medium|hard",
  "language": "javascript|cpp" // optional, default: javascript
}
```

**Response:**
```json
{
  "success": true,
  "puzzle": {
    "title": "Fix the Sum Function",
    "description": "This function should sum all numbers in an array",
    "buggyCode": "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i < arr.length; i++)\n    total += i; // BUG: should be arr[i]\n  return total;\n}",
    "correctSolution": "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i < arr.length; i++)\n    total += arr[i];\n  return total;\n}",
    "explanation": "The bug is adding index i instead of the array value arr[i]",
    "hints": [
      "Check what's being added to total",
      "Compare with the variable names"
    ],
    "difficulty": "easy",
    "language": "javascript"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to generate puzzle",
  "details": "API key not configured"
}
```

---

## ✔️ Solution Validation

### POST `/puzzle/validate`

Validate a user's puzzle solution using AI.

**Request:**
```json
{
  "puzzleTitle": "Fix the Sum Function",
  "buggyCode": "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i < arr.length; i++)\n    total += i;\n  return total;\n}",
  "userSolution": "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i < arr.length; i++)\n    total += arr[i];\n  return total;\n}",
  "correctSolution": "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i < arr.length; i++)\n    total += arr[i];\n  return total;\n}"
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "isCorrect": true,
    "score": 100,
    "feedback": "Perfect! You correctly identified and fixed the bug.",
    "issues": [],
    "suggestions": []
  }
}
```

**Incorrect Response:**
```json
{
  "success": true,
  "validation": {
    "isCorrect": false,
    "score": 30,
    "feedback": "The logic is still incorrect. Review the loop variable.",
    "issues": [
      "Still using index instead of array value",
      "Missing edge case handling"
    ],
    "suggestions": [
      "Use arr[i] to access array elements",
      "Consider empty array input"
    ]
  }
}
```

---

## 🏆 Leaderboard

### GET `/leaderboard/global`

Get global leaderboard rankings.

**Query Parameters:**
- `limit` (optional, default: 100) - Number of results
- `offset` (optional, default: 0) - Pagination offset
- `difficulty` (optional) - Filter by difficulty (easy|medium|hard)

**Request:**
```
GET /leaderboard/global?limit=10&offset=0&difficulty=hard
```

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "wallet_address": "GXXXXXXX...",
      "username": "CryptoMaster",
      "difficulty": "hard",
      "points": 42,
      "remaining_time": 5,
      "created_at": "2025-11-30T10:15:00.000Z"
    },
    {
      "wallet_address": "GYYYYYYY...",
      "username": "CodeNinja",
      "difficulty": "hard",
      "points": 40,
      "remaining_time": 8,
      "created_at": "2025-11-30T10:10:00.000Z"
    }
  ],
  "total": 2
}
```

---

## 👤 Player Statistics

### GET `/player/:walletAddress`

Get detailed player statistics and profile.

**Parameters:**
- `walletAddress` - Stellar wallet address

**Request:**
```
GET /player/GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Response:**
```json
{
  "success": true,
  "player": {
    "profile": {
      "wallet_address": "GXXXXXXX...",
      "username": "CryptoMaster",
      "avatar": "🧠",
      "photo_url": null,
      "bio": "Loves solving puzzles",
      "level": 15,
      "selected_frame": "frame-gold",
      "created_at": "2025-11-20T10:00:00.000Z"
    },
    "statistics": {
      "totalPoints": 120,
      "totalGames": 30,
      "easyCount": 10,
      "mediumCount": 12,
      "hardCount": 8,
      "avgTime": 18,
      "level": 15
    }
  }
}
```

**Error Response:**
```json
{
  "error": "Player not found"
}
```

---

## 💾 Score Submission

### POST `/score/submit`

Submit a completed puzzle score.

**Request:**
```json
{
  "walletAddress": "GXXXXXXX...",
  "username": "CryptoMaster",
  "puzzleTitle": "Fix the Sum Function",
  "difficulty": "easy|medium|hard",
  "points": 30,
  "remainingTime": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "id": "uuid-string",
    "wallet_address": "GXXXXXXX...",
    "username": "CryptoMaster",
    "puzzle_title": "Fix the Sum Function",
    "difficulty": "easy",
    "points": 30,
    "remaining_time": 15,
    "created_at": "2025-11-30T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to submit score",
  "details": "Missing required fields"
}
```

---

## 📊 Points System

### Easy Puzzles: 1 point
- Basic syntax errors
- Simple logic mistakes
- Time Bonus: +50% if >20s remaining

### Medium Puzzles: 2 points
- Logic errors
- Edge case handling
- Time Bonus: +25% if >10s remaining

### Hard Puzzles: 3 points
- Complex algorithms
- Optimization issues
- Time Bonus: +0% (extra reward for speed)

**Example:**
- Easy puzzle solved in 25s: 1 + 0.5 = 1.5 → 1 point (rounded)
- Medium puzzle solved in 15s: 2 + 0.5 = 2.5 → 2 points
- Hard puzzle solved in 5s: 3 + 0 = 3 points

---

## 🔐 Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error description",
  "details": "Additional error details (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Setup & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3001`

### 4. Production Build
```bash
npm run build
npm start
```

---

## 📝 API Rate Limiting

- Puzzle Generation: 10 requests/minute per IP
- Solution Validation: 20 requests/minute per IP
- Score Submission: 100 requests/minute per IP
- Leaderboard: Unlimited

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Generate Puzzle
```bash
curl -X POST http://localhost:3001/api/puzzle/generate \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "easy",
    "language": "javascript"
  }'
```

### Get Leaderboard
```bash
curl "http://localhost:3001/api/leaderboard/global?limit=10&difficulty=easy"
```

### Submit Score
```bash
curl -X POST http://localhost:3001/api/score/submit \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "GXXXXXXX...",
    "username": "TestPlayer",
    "puzzleTitle": "Test Puzzle",
    "difficulty": "easy",
    "points": 10,
    "remainingTime": 20
  }'
```

---

## 🔗 Integration with Frontend

The backend should be called from:
- `src/lib/backend.ts` - Backend service functions
- `src/handlers/gameHandlers.ts` - Game event handlers
- Game components for real-time updates

**Example Frontend Integration:**
```typescript
// src/lib/backend.ts
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export async function generatePuzzle(difficulty: string) {
  const response = await fetch(`${API_BASE}/puzzle/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });
  return response.json();
}

export async function validateSolution(puzzle, userCode) {
  const response = await fetch(`${API_BASE}/puzzle/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puzzleTitle: puzzle.title,
      buggyCode: puzzle.buggyCode,
      userSolution: userCode,
      correctSolution: puzzle.correctSolution,
    }),
  });
  return response.json();
}
```

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase SDK](https://supabase.com/docs/reference/javascript)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 🤝 Support

For issues or questions:
1. Check the logs: `npm run dev`
2. Verify environment variables are set correctly
3. Check API keys have necessary permissions
4. Open an issue on GitHub
