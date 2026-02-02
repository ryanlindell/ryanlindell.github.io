/**
 * Curated list of repositories to display.
 * Data is enriched with live info (updated_at, etc.) from GitHub API.
 */
export const repositoryNames = [
  'hawaii-tours',
  'MBTA-poster',
  'ryanlindell.github.io',
  'rocket-pygame',
]

export const repositoryOverrides = {
  'hawaii-tours': { description: 'A website for hawaii tour guides' },
  'MBTA-poster': {
    description: 'A poster that has live updates of the MBTA train system (green line only)',
  },
  'ryanlindell.github.io': { description: 'Personal portfolio website' },
  'rocket-pygame': { description: ' ', isPublic: false },
}

export function getProjectList() {
  return repositoryNames.map((name) => ({
    name,
    description: repositoryOverrides[name]?.description ?? '',
    language: null,
    status: '—',
    isPublic: repositoryOverrides[name]?.isPublic ?? true,
    projectUrl: null,
  }))
}
