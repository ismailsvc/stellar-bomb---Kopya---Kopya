import { githubCreateIssue, githubGetIssues } from "./github";

// Identicon avatar
export function getAvatar(address: string) {
  return `https://avatars.dicebear.com/api/identicon/${address}.svg`;
}

export async function getOrCreateGithubProfile(address: string) {
  try {
    const issues = await githubGetIssues();

    // Check if response is an array
    if (Array.isArray(issues) && issues.length > 0) {
      const existing = issues.find((i: any) => i.title === `profile-${address}`);
      if (existing) return JSON.parse(existing.body);
    }

    const profile = {
      address,
      avatar: getAvatar(address),
      createdAt: new Date().toISOString(),
    };

    await githubCreateIssue(`profile-${address}`, profile, ["profile"]);

    return profile;
  } catch (error) {
    console.log("⚠️ GitHub profile error. Using local profile.", error);
    return {
      address,
      avatar: getAvatar(address),
      createdAt: new Date().toISOString(),
    };
  }
}
