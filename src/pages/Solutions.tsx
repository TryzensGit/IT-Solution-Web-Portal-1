import { SolutionsSection } from '../components/home/SolutionsSection'
import { CapabilitiesSection } from '../components/home/CapabilitiesSection'
import { ContactSection } from '../components/home/ContactSection'
import { FinalCta } from '../components/home/FinalCta'
import { usePageTitle } from '../lib/usePageTitle'

export function Solutions() {
  usePageTitle('Solutions')
  return (
    <>
      <SolutionsSection headingLevel="h1" />
      <CapabilitiesSection />
      <ContactSection />
      <FinalCta />
    </>
  )
}
