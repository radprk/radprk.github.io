import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import CuddleCodeSection from "@/components/cuddle-code-section"
import ProjectsSection from "@/components/projects-section"
import ExperienceSection from "@/components/experience-section"
import SkillsSection from "@/components/skills-section"
import ContactSection from "@/components/contact-section"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <HeroSection />
      <AboutSection />
      <CuddleCodeSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <ContactSection />
    </div>
  )
}
