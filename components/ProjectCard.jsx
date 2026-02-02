'use client'

import { useEffect, useRef } from 'react'

const LANGUAGE_COLORS = {
  Python: '#3572A5',
  'C++': '#f34b7d',
  HTML: '#e34c26',
  CSS: '#563d7c',
  JavaScript: '#f1e05a',
}

const GITHUB_USER = 'ryanlindell'

export default function ProjectCard({ repo }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-in')
          el.classList.remove('animate-out')
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const languageColor = repo.language ? (LANGUAGE_COLORS[repo.language] || '#858585') : null
  const repoUrl = `https://github.com/${GITHUB_USER}/${repo.name}`

  return (
    <div className="project-card animate-out" ref={ref}>
      <div className="project-content">
        <div className="project-title">
          <h3>{repo.name}</h3>
          <span
            style={{
              fontSize: '0.8rem',
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: repo.isPublic ? 'rgba(96, 165, 250, 0.2)' : 'rgba(248, 113, 113, 0.2)',
              color: repo.isPublic ? '#93c5fd' : '#fca5a5',
            }}
          >
            {repo.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        {repo.language && (
          <div className="project-language">
            <span
              className="language-dot"
              style={{ backgroundColor: languageColor }}
            />
            {repo.language}
          </div>
        )}
        <p>{repo.description || 'No description provided'}</p>
        <div className="project-status">{repo.status}</div>
        <div className="project-links">
          <a href={repo.projectUrl || repoUrl} target="_blank" rel="noopener noreferrer">
            <i className="fas fa-external-link-alt"></i> View Project
          </a>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i> Code
          </a>
        </div>
      </div>
    </div>
  )
}
