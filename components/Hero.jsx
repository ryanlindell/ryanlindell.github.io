'use client'

export default function Hero() {
  const scrollTo = (e) => {
    e.preventDefault()
    const el = document.querySelector('#projects')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="hero">
      <div className="container">
        <h2>Building Digital Experiences</h2>
        <p>Full-stack developer passionate about creating innovative solutions</p>
        <a href="#projects" className="btn" onClick={scrollTo}>View My Work</a>
      </div>
    </section>
  )
}
