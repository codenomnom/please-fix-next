// ---------------------------------------------------------------------------
// gh-stats.ts — GitHub repository statistics, fetched at build time
// ---------------------------------------------------------------------------
// Env vars (set in .env or your CI/hosting environment):
//
//   GITHUB_REPO   "owner/repo"   e.g. codenomnom/please-fix-next   (required)
//   GITHUB_TOKEN  ghp_...        Classic PAT, no scopes needed  (optional)
//   GITHUB_MOCK   true           Return a random star count instead of
//                                hitting the API — useful during local dev
//                                so you don't burn rate-limit on every HMR.
// ---------------------------------------------------------------------------

export interface RepoStats {
  stars: number;
  isMock: boolean;
}

interface GitHubRepoResponse {
  stargazers_count: number;
  html_url: string;
}

function randomStars(min = 800, max = 6_000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

async function fetchStars(repo: string, token?: string): Promise<number> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });

  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining') ?? 'unknown';
    throw new Error(`GitHub API returned ${res.status} for "${repo}" (rate-limit remaining: ${remaining})`);
  }

  const data = (await res.json()) as GitHubRepoResponse;
  return data.stargazers_count;
}

export async function getStats(): Promise<RepoStats> {
  const mock = (import.meta.env.GITHUB_MOCK as string | undefined)?.toLowerCase();
  const isMock = mock === 'true' || mock === '1';
  const result = { stars: 0, isMock };

  if (isMock) {
    result.stars = randomStars();
    console.info(`[gh-stats] mock mode — returning ${result.stars} stars`);
  } else {
    const repo = import.meta.env.GITHUB_REPO as string | undefined;
    const token = import.meta.env.GITHUB_TOKEN as string | undefined;
    if (!repo) {
      console.warn('[gh-stats] GITHUB_REPO is not set — skipping star count.');
      return result;
    }

    try {
      result.stars = await fetchStars(repo, token);
    } catch (err) {
      console.warn('[gh-stats]', err);
    }
  }

  return result;
}
