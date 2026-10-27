import { Hero } from '../components/home/Hero'
import { LauncherSection } from '../components/home/LauncherSection'
import { SolutionsSection } from '../components/home/SolutionsSection'
import { CapabilitiesSection } from '../components/home/CapabilitiesSection'
import { HowItWorks } from '../components/home/HowItWorks'
import { FinalCta } from '../components/home/FinalCta'
import { usePageTitle } from '../lib/usePageTitle'

export function Home() {
  usePageTitle()
  return (
    <>
      <Hero />
      <LauncherSection />
      <SolutionsSection compact />
      <CapabilitiesSection />
      <HowItWorks />
      <FinalCta />
    </>
  )
}
