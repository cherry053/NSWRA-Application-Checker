import AboutSection from './sections/AboutSection';
import CapabilitiesSection from './sections/CapabilitiesSection';
import CertificationsSection from './sections/CertificationsSection';
import ContactSection from './sections/ContactSection';
import ExperienceSection from './sections/ExperienceSection';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import ProjectsSection from './sections/ProjectsSection';

export default function App() {
  return (
    <main style={{ background: '#0C0C0C', overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ExperienceSection />
      <CapabilitiesSection />
      <ProjectsSection />
      <CertificationsSection />
      <ContactSection />
    </main>
  );
}
