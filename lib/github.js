const GITHUB_API = 'https://api.github.com'
const GITHUB_USER = 'ryanlindell'

/**
 * Format a date as "X days ago" style string
 */
export function formatTimeAgo(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]

  for (const [secondsInUnit, unit] of intervals) {
    const n = Math.floor(seconds / secondsInUnit)
    if (n >= 1) {
      return `Updated ${n} ${unit}${n > 1 ? 's' : ''} ago`
    }
  }
  return 'Updated just now'
}

/**
 * Fetch repo info from GitHub API (updated_at, description, language, visibility)
 */
async function fetchRepoFromGitHub(owner, repo) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  }

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers,
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!res.ok) return null
  return res.json()
}

/**
 * Enrich project list with live data from GitHub API
 */
export async function getProjectsWithUpdates(projects) {
  const results = await Promise.all(
    projects.map(async (project) => {
      const githubData = await fetchRepoFromGitHub(GITHUB_USER, project.name)

      if (githubData) {
        return {
          ...project,
          description: githubData.description || project.description || '',
          language: githubData.language || project.language,
          isPublic: !githubData.private,
          updatedAt: githubData.updated_at,
          status: formatTimeAgo(githubData.updated_at) || '—',
        }
      }

      // API failed (private repo, rate limit, etc.) - use static fallback
      return {
        ...project,
        status: project.status || '—',
      }
    })
  )

  return results
}
