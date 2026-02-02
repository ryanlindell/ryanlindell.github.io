'use client'

import { useEffect, useRef } from 'react'

export default function Contact() {
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
    <section id="contact">
      <div className="container">
        <h2>Get In Touch</h2>
        <div className="contact-content animate-out" ref={ref}>
          <p>Interested in working together or have a question? Feel free to reach out!</p>
          <div className="contact-links">
            <a href="mailto:ryanjlindell@gmail.com" className="contact-link">
              <i className="fas fa-envelope"></i> Email
            </a>
            <a
              href="https://github.com/ryanlindell"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <i className="fab fa-github"></i> GitHub
            </a>
            <a
              href="https://linkedin.com/in/ryanlindell808"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
