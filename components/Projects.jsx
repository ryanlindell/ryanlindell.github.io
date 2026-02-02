'use client'

import ProjectCard from './ProjectCard'

export default function Projects({ repos = [] }) {
  return (
    <section id="projects">
      <div className="container">
        <h2>My Projects</h2>
        <div className="projects-grid">
          {repos.map((repo) => (
            <ProjectCard key={repo.name} repo={repo} />
          ))}
        </div>
      </div>
    </section>
  )
}
