/* =====================================================
   AI-Powered Puzzle Generator using OpenAI API
===================================================== */

export type Puzzle = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput?: string;
  category: "easy" | "medium" | "hard";
};

export type AIResponse = {
  success: boolean;
  data?: Puzzle | boolean;
  error?: string;
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Puzzle Cache (localStorage'da sakla)
const PUZZLE_CACHE_KEY = "ai_puzzle_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 saat

function getCachedPuzzles(): Puzzle[] {
  try {
    const cached = localStorage.getItem(PUZZLE_CACHE_KEY);
    if (!cached) return [];
    const { puzzles, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(PUZZLE_CACHE_KEY);
      return [];
    }
    return puzzles;
  } catch {
    return [];
  }
}

function cachePuzzles(puzzles: Puzzle[]) {
  try {
    localStorage.setItem(PUZZLE_CACHE_KEY, JSON.stringify({
      puzzles,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache errors
  }
}

function getRandomCachedPuzzle(difficulty: "easy" | "medium" | "hard"): Puzzle | null {
  const cached = getCachedPuzzles();
  const filtered = cached.filter(p => p.category === difficulty);
  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * OpenAI ile yapay zeka tabanlı puzzle oluştur
 */
export async function generatePuzzleWithAI(
  difficulty: "easy" | "medium" | "hard"
): Promise<AIResponse> {
  // Önce cache'den kontrol et
  const cached = getRandomCachedPuzzle(difficulty);
  if (cached) {
    return {
      success: true,
      data: cached,
      error: undefined,
    };
  }

  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  const prompt = `Generate a JavaScript code puzzle for ${difficulty} difficulty level. 
The puzzle should have intentional bugs that the user needs to fix within 30 seconds.
Return the response in JSON format with this structure:
{
  "title": "Problem Name",
  "description": "Short description of what the code should do",
  "starterCode": "function buggyCode() { ... }",
  "expectedOutput": "What the fixed code should output or demonstrate"
}

Requirements:
- The starter code should have exactly 1-3 bugs
- Bugs should be logical (wrong operators, wrong conditions, etc)
- Code should be simple enough to fix in 30 seconds
- Include comments showing where the bugs are like // HATA
- The code should be valid JavaScript that can be tested`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert JavaScript teacher. Generate engaging coding puzzles with bugs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      // Rate limit hatası - daha sonra tekrar dene
      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limited by OpenAI API. Please try again later.",
        };
      }
      return {
        success: false,
        error: `OpenAI API error: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "Empty response from OpenAI",
      };
    }

    // JSON'u parse et
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "Could not parse JSON from response",
      };
    }

    const puzzleData = JSON.parse(jsonMatch[0]);

    const puzzle: Puzzle = {
      id: `ai-${Date.now()}`,
      title: puzzleData.title || "AI Generated Puzzle",
      description: puzzleData.description || "Fix the bugs in this code",
      starterCode: puzzleData.starterCode || "",
      expectedOutput: puzzleData.expectedOutput,
      category: difficulty,
    };

    // Cache'e ekle
    const allCached = getCachedPuzzles();
    allCached.push(puzzle);
    cachePuzzles(allCached);

    return {
      success: true,
      data: puzzle,
    };
  } catch (error) {
    console.error("AI Puzzle Generation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Yapay zeka ile kodu kontrol et (çözümün doğru olup olmadığını kontrol et)
 */
export async function validateCodeWithAI(
  userCode: string,
  originalBuggyCode: string,
  expectedOutput: string
): Promise<AIResponse> {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: "OpenAI API key not configured",
    };
  }

  const prompt = `Check if the user fixed the JavaScript code correctly.

Original buggy code:
\`\`\`javascript
${originalBuggyCode}
\`\`\`

User's fixed code:
\`\`\`javascript
${userCode}
\`\`\`

Expected behavior: ${expectedOutput}

Answer ONLY with "true" if the code is correctly fixed, or "false" if it still has bugs. 
Consider these fixes correct if:
1. The main bugs are fixed
2. The code would work as expected
3. The logic is sound

Respond with only: true or false`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a JavaScript code reviewer. Check if code is correctly fixed. Answer only with true or false.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `OpenAI API error: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim().toLowerCase();

    const isCorrect = content === "true";

    return {
      success: true,
      data: isCorrect,
    };
  } catch (error) {
    console.error("AI Code Validation Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
