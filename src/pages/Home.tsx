import { Hero } from '../components/home/Hero'
import { TrustedBy } from '../components/home/TrustedBy'
import { LauncherSection } from '../components/home/LauncherSection'
import { ChatbotPromo } from '../components/home/ChatbotPromo'
import { SolutionsSection } from '../components/home/SolutionsSection'
import { CapabilitiesSection } from '../components/home/CapabilitiesSection'
import { HowItWorks } from '../components/home/HowItWorks'
import { ContactSection } from '../components/home/ContactSection'
import { FinalCta } from '../components/home/FinalCta'
import { usePageTitle } from '../lib/usePageTitle'

export function Home() {
  usePageTitle()
  return (
    <>
      <Hero />
      <LauncherSection />
      <ChatbotPromo />
      <SolutionsSection compact />
      <CapabilitiesSection />
      <HowItWorks />
      <TrustedBy />
      <ContactSection />
      <FinalCta />
    </>
  )
}
