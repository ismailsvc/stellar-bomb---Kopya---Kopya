// src/lib/github.ts
const GITHUB_OWNER = "ismailsvc";
const GITHUB_REPO = "stellar-bomb-global";

// !!! ÖNEMLİ !!!
// .env içine ekle:
// VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export async function githubCreateIssue(title: string, body: any, labels: string[] = []) {
  if (!TOKEN) {
    console.log("⚠️ GitHub token not configured. Skipping issue creation.");
    return { success: false };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.github+json",
      },
      body: JSON.stringify({
        title,
        labels,
        body: JSON.stringify(body, null, 2),
      }),
    });

    if (!res.ok) {
      console.log(`⚠️ GitHub API error (${res.status}). Skipping.`);
      return { success: false };
    }

    return await res.json();
  } catch (error) {
    console.log("⚠️ GitHub API error. Skipping.", error);
    return { success: false };
  }
}

export async function githubGetIssues(label?: string) {
  if (!TOKEN) {
    console.log("⚠️ GitHub token not configured. Returning empty list.");
    return [];
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?per_page=100${
      label ? `&labels=${label}` : ""
    }`;

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      console.log(`⚠️ GitHub API error (${res.status}). Returning empty list.`);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.log("⚠️ GitHub API error. Returning empty list.", error);
    return [];
  }
}
