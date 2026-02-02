'use client'

import { useEffect, useRef } from 'react'

const skills = ['HTML', 'CSS', 'JavaScript', 'Python', 'C++']

export default function About() {
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

  return (
    <section id="about">
      <div className="container">
        <h2>About Me</h2>
        <div className="about-content animate-out" ref={ref}>
          <div className="about-text">
            <p>
              Hello! I&apos;m a developer with expertise in multiple programming languages including Python, C++, HTML, and more. I enjoy building projects that solve real-world problems and create engaging experiences.
            </p>
            <p>
              My portfolio showcases a range of projects from interactive websites to utility applications and programming tools.
            </p>
            <div className="skills">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
