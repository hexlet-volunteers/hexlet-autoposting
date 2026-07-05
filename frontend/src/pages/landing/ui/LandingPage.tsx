import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'
import { HeroSection } from './sections/HeroSection'
import { NetworksSection } from './sections/NetworksSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { CrosspostingSection } from './sections/CrosspostingSection'
import { AiAssistantSection } from './sections/AiAssistantSection'
import { ComparisonSection } from './sections/ComparisonSection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { PricingTeaserSection } from './sections/PricingTeaserSection'
import { FaqSection } from './sections/FaqSection'
import { CtaSection } from './sections/CtaSection'

/** Публичная главная страница-лендинг «Отложки». */
export function LandingPage() {
  return (
    <>
      <MarketingHeader />
      <HeroSection />
      <NetworksSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CrosspostingSection />
      <AiAssistantSection />
      <ComparisonSection />
      <TestimonialsSection />
      <PricingTeaserSection />
      <FaqSection />
      <CtaSection />
      <MarketingFooter />
    </>
  )
}
