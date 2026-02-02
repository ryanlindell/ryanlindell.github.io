'use client'

export default function Header() {
  const scrollTo = (e, id) => {
    e.preventDefault()
    const el = document.querySelector(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <header>
      <div className="container">
        <h1>Ryan Lindell</h1>
        <p className="tagline">Developer & Creator</p>
        <nav>
          <ul>
            <li><a href="#about" onClick={(e) => scrollTo(e, '#about')}>About</a></li>
            <li><a href="#projects" onClick={(e) => scrollTo(e, '#projects')}>Projects</a></li>
            <li><a href="#contact" onClick={(e) => scrollTo(e, '#contact')}>Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
