// /src/lib/githubLeaderboard.ts

const GITHUB_USERNAME = "ismailsvc";       // 🔥 Senin GitHub adın
const REPO_NAME = "stellar-bomb-db";       // 🔥 Oluşturduğun repo
const FILE_PATH = "data/leaderboard.json"; // 🔥 JSON dosyası

// 🔥 BUNU .env DOSYASINA YAZACAKSIN
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

export async function fetchLeaderboard() {
  const res = await fetch(BASE_URL, {
    headers: { Authorization: `token ${TOKEN}` }
  });

  const json = await res.json();
  const content = atob(json.content);
  return JSON.parse(content) as any[];
}

export async function pushLeaderboard(updated: any[]) {
  const getFile = await fetch(BASE_URL, {
    headers: { Authorization: `token ${TOKEN}` }
  });

  const fileData = await getFile.json();

  const newContent = btoa(JSON.stringify(updated, null, 2));

  await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Leaderboard update",
      content: newContent,
      sha: fileData.sha
    })
  });
}

// Oyuncu skoru ekle
export async function addScore(entry: any) {
  const list = await fetchLeaderboard() as Array<{ remainingTime?: number }>;
  list.push(entry);

  list.sort((a, b) => (b.remainingTime ?? 0) - (a.remainingTime ?? 0));

  await pushLeaderboard(list);

  return list;
}
