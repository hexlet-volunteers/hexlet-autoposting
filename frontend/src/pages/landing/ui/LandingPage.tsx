import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()

  // Якорная навигация: ссылки вида /#features работают с любой страницы —
  // после перехода скроллим к секции по id из хэша (location.key учитывает
  // повторный клик по тому же пункту меню)
  useEffect(() => {
    if (!location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash, location.key])

  return (
    <>
      <MarketingHeader />
      <HeroSection />
      <NetworksSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CrosspostingSection />
      <AiAssistantSection />
      <ComparisonSection showCompetitors />
      <TestimonialsSection />
      <PricingTeaserSection />
      <FaqSection />
      <CtaSection />
      <MarketingFooter />
    </>
  )
}
