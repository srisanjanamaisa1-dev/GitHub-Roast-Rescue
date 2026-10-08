const API = "https://api.github.com";

function headers() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function githubGet(path) {
  const response = await fetch(`${API}${path}`, { headers: headers() });
  if (response.status === 404) throw new Error("NOT_FOUND");
  if (response.status === 403 || response.status === 429) throw new Error("RATE_LIMIT");
  if (!response.ok) throw new Error("NETWORK");
  return response.json();
}

export async function fetchGitHubProfile(username) {
  const safe = encodeURIComponent(username.trim());
  const [profile, repos] = await Promise.all([
    githubGet(`/users/${safe}`),
    githubGet(`/users/${safe}/repos?per_page=100&sort=updated`),
  ]);
  return { profile, repos };
}
