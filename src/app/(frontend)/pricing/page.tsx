import { PageHeroSection } from '@/sections/PageHeroSection/component'
import { PricingSection } from '@/sections/PricingSection/component'
import { FaqSection } from '@/sections/FaqSection/component'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import { seedPricingData, seedFaqItems, seedHomePage } from '@/payload/seed-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '定價',
}

export default function PricingPage() {
  const newsletterData = seedHomePage.blocks[2] as Parameters<typeof NewsletterSignupSection>[0]['data']

  return (
    <>
      <PageHeroSection
        data={{
          blockType: 'pageHeroSection',
          title: '升級路徑',
          intro: '選擇適合你現在階段的起點，每個階段都有具體可交付的成果',
        }}
      />

      <PricingSection
        data={{
          blockType: 'pricingSection',
          ...seedPricingData,
        }}
      />

      <FaqSection
        data={{
          blockType: 'faqSection',
          title: '常見問題',
          items: seedFaqItems,
        }}
      />

      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
