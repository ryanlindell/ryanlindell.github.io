import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { getProjectsWithUpdates } from '@/lib/github'
import { getProjectList } from '@/lib/projects'

export default async function Home() {
  const projects = await getProjectsWithUpdates(getProjectList())

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Projects repos={projects} />
      <Contact />
      <Footer />
    </>
  )
}
