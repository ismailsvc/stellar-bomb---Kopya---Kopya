import { githubCreateIssue, githubGetIssues } from "./github";

type ScoreEntry = { address?: string; puzzle?: string; score: number; createdAt?: string };

export async function addScore(address: string, puzzle: string, time: number) {
  const score = {
    address,
    puzzle,
    score: time,
    createdAt: new Date().toISOString(),
  };

  await githubCreateIssue(
    `score-${address}-${puzzle}-${time}s`,
    score,
    ["score"]
  );

  return score;
}

export async function getTopScores() {
  const issues = await githubGetIssues("score");

  const parsed = issues.map((i: any) => JSON.parse(i.body) as ScoreEntry);

  parsed.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score);

  return parsed.slice(0, 50);
}
